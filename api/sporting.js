// api/sporting.js
// Serves combined Sporting matches + standings + basic stats + logos (TheSportsDB fallback).
// Requires env var: FOOTBALL_API_KEY (football-data.org)

const fetchSafe = global.fetch || (async (...args) => {
  // If node doesn't have fetch, try to require node-fetch (optional)
  try {
    const nodeFetch = require('node-fetch');
    return nodeFetch(...args);
  } catch (e) {
    throw new Error('No fetch available. Install node-fetch or run on Node 18+ / environment with fetch.');
  }
});

const TEAM_ID = 498; // Sporting (football-data.org team id used before)
const SEASON_START = '2025-07-01';
const SEASON_END = '2026-06-30';
const FOOTBALL_API_KEY = process.env.FOOTBALL_API_KEY || '';
const THESPORTSDB_KEY = '1'; // Public test key for TheSportsDB (works for badge lookups)

async function fetchFootballData(url) {
  const res = await fetchSafe(url, {
    headers: {
      'X-Auth-Token': FOOTBALL_API_KEY,
      'Accept': 'application/json'
    }
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`football-data error ${res.status}: ${txt}`);
  }
  return res.json();
}

async function fetchLogoFromSportsDB(teamName) {
  try {
    // TheSportsDB searchteams endpoint (free/public key '1')
    const q = encodeURIComponent(teamName);
    const url = `https://www.thesportsdb.com/api/v1/json/${THESPORTSDB_KEY}/searchteams.php?t=${q}`;
    const res = await fetchSafe(url);
    if (!res.ok) return null;
    const data = await res.json();
    const logo = data?.teams?.[0]?.strTeamBadge || null;
    return logo;
  } catch {
    return null;
  }
}

function safeGetTeamName(match) {
  // football-data v4 structures vary slightly; try several properties
  return (
    match.homeTeam?.name ||
    (match.teams && match.teams.home && match.teams.home.name) ||
    match.home?.name ||
    ''
  );
}

function safeGetAwayName(match) {
  return (
    match.awayTeam?.name ||
    (match.teams && match.teams.away && match.teams.away.name) ||
    match.away?.name ||
    ''
  );
}

function safeGetUtcDate(match) {
  return match.utcDate || match.date || (match.fixture && match.fixture.date) || null;
}

function safeGetCompetition(match) {
  return match.competition?.name || (match.fixture && match.fixture.competition && match.fixture.competition.name) || match.competitionName || '';
}

function safeGetVenue(match) {
  return match.venue || (match.fixture && match.fixture.venue) || match.stage || '';
}

function safeGetScore(match) {
  // football-data: score.fullTime.home/away OR goals.home/goals.away (other apis)
  const full = match.score?.fullTime || match.score || match.goals || {};
  const home = full.home ?? full.homeTeam ??  (match.goals && match.goals.home) ?? null;
  const away = full.away ?? full.awayTeam ?? (match.goals && match.goals.away) ?? null;
  return { home, away };
}

export default async function handler(req, res) {
  try {
    if (!FOOTBALL_API_KEY) {
      return res.status(500).json({ error: 'FOOTBALL_API_KEY not configured' });
    }

    // 1) Fetch all matches for team in date window (do NOT pass season param to capture cups)
    // football-data v4: GET /teams/{id}/matches?dateFrom=YYYY-MM-DD&dateTo=YYYY-MM-DD
    const matchesUrl = `https://api.football-data.org/v4/teams/${TEAM_ID}/matches?dateFrom=${SEASON_START}&dateTo=${SEASON_END}&limit=500`;
    const matchesData = await fetchFootballData(matchesUrl);
    const rawMatches = matchesData.matches || [];

    // Build list of unique team names to fetch logos in batch
    const teamNamesSet = new Set();
    rawMatches.forEach(m => {
      const h = safeGetTeamName(m);
      const a = safeGetAwayName(m);
      if (h) teamNamesSet.add(h);
      if (a) teamNamesSet.add(a);
    });
    const teamNames = Array.from(teamNamesSet);

    // 2) Try to get logos from TheSportsDB for each team (simple cache)
    const logoMap = {};
    await Promise.all(teamNames.map(async name => {
      try {
        const logo = await fetchLogoFromSportsDB(name);
        logoMap[name] = logo || `https://www.thesportsdb.com/images/media/team/badge/unknown.png`;
      } catch (e) {
        logoMap[name] = `https://www.thesportsdb.com/images/media/team/badge/unknown.png`;
      }
    }));

    // 3) Map matches into unified shape, and split porJogar/jogados if needed
    const porJogar = [];
    const jogados = [];
    const todos = [];

    for (const m of rawMatches) {
      const date = safeGetUtcDate(m);
      const competition = safeGetCompetition(m) || (m.competition && m.competition.name) || '';
      const homeTeam = safeGetTeamName(m);
      const awayTeam = safeGetAwayName(m);

      const score = safeGetScore(m);
      // normalize numeric scores (if null/undefined -> null)
      const scoreHome = (score.home === null || score.home === undefined) ? null : Number(score.home);
      const scoreAway = (score.away === null || score.away === undefined) ? null : Number(score.away);

      const jogo = {
        id: m.id ?? (m.matchId || (m.fixture && m.fixture.id)) || null,
        date,
        competition,
        venue: safeGetVenue(m),
        status: m.status || (m.fixture && m.fixture.status) || '',
        homeTeam,
        homeLogo: logoMap[homeTeam] || null,
        awayTeam,
        awayLogo: logoMap[awayTeam] || null,
        score: { home: scoreHome, away: scoreAway },
        raw: m
      };

      todos.push(jogo);
      if (jogo.status === 'SCHEDULED' || jogo.status === 'TIMED' || jogo.status === 'SCHEDULED') {
        porJogar.push(jogo);
      } else {
        // consider 'FINISHED' or others
        jogados.push(jogo);
      }
    }

    // Sort todos by date ascending
    todos.sort((a,b) => new Date(a.date) - new Date(b.date));
    porJogar.sort((a,b)=>new Date(a.date)-new Date(b.date));
    jogados.sort((a,b)=>new Date(b.date)-new Date(a.date)); // resultados: newest first

    // 4) Optional: fetch standings for Primeira Liga (PPL) and Champions (CL)
    // If an endpoint fails we just return empty list
    async function fetchStandings(code) {
      try {
        const url = `https://api.football-data.org/v4/competitions/${code}/standings`;
        const d = await fetchFootballData(url);
        const table = d.standings?.[0]?.table || [];
        return table.map(t => ({
          position: t.position,
          team: t.team?.name || t.teamName || '',
          played: t.playedGames ?? t.played ?? 0,
          won: t.won ?? 0,
          draw: t.draw ?? 0,
          lost: t.lost ?? 0,
          goalDifference: t.goalDifference ?? t.goalDiff ?? 0,
          points: t.points ?? 0
        }));
      } catch (err) {
        return [];
      }
    }

    const classificacoes = {
      "Primeira Liga": await fetchStandings('PPL').catch(()=>[]),
      "UEFA Champions League": await fetchStandings('CL').catch(()=>[])
    };

    // 5) Estatísticas simples (dos jogos finalizados)
    let jogosTotal = 0, vitorias = 0, empates = 0, derrotas = 0, golosMarcados = 0, golosSofridos = 0;
    for (const gm of jogados) {
      const sportingHome = gm.homeTeam && gm.homeTeam.toLowerCase().includes('sporting');
      // identify Sporting's goals:
      const golsSporting = sportingHome ? gm.score.home : gm.score.away;
      const golsAdv = sportingHome ? gm.score.away : gm.score.home;
      if (golsSporting === null || golsSporting === undefined) continue;
      jogosTotal++;
      golosMarcados += Number(golsSporting || 0);
      golosSofridos += Number(golsAdv || 0);
      if (golsSporting > golsAdv) vitorias++;
      else if (golsSporting === golsAdv) empates++;
      else derrotas++;
    }

    const estatisticas = {
      jogos: jogosTotal,
      vitorias,
      empates,
      derrotas,
      golosMarcados,
      golosSofridos
    };

    // 6) Return combined payload
    return res.status(200).json({
      jogos: todos,
      porJogar,
      jogados,
      classificacoes,
      estatisticas
    });

  } catch (error) {
    console.error('api/sporting error', error);
    return res.status(500).json({ error: error.message });
  }
}
