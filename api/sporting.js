export default async function handler(req, res) {
  try {
    const API_KEY = process.env.API_FOOTBALL_KEY;
    const TEAM_ID = 228;
    const SEASON = 2025;

    /* =========================
       1️⃣ ESTATÍSTICAS GLOBAIS
    ========================== */

    const fixturesRes = await fetch(
      `https://v3.football.api-sports.io/fixtures?team=${TEAM_ID}&season=${SEASON}`,
      {
        headers: {
          "x-apisports-key": API_KEY
        }
      }
    );

    const fixturesData = await fixturesRes.json();
    const jogos = fixturesData.response || [];

    let vitorias = 0;
    let empates = 0;
    let derrotas = 0;
    let golosMarcados = 0;
    let golosSofridos = 0;
    let totalJogos = 0;

    jogos.forEach(j => {
      if (j.fixture.status.short === "FT") {
        totalJogos++;

        const home = j.teams.home.id === TEAM_ID;
        const gf = home ? j.goals.home : j.goals.away;
        const ga = home ? j.goals.away : j.goals.home;

        golosMarcados += gf;
        golosSofridos += ga;

        if (gf > ga) vitorias++;
        else if (gf === ga) empates++;
        else derrotas++;
      }
    });

    /* =========================
       2️⃣ CLASSIFICAÇÃO PRIMEIRA LIGA
    ========================== */

    const standingsRes = await fetch(
      `https://v3.football.api-sports.io/standings?league=94&season=${SEASON}`,
      {
        headers: {
          "x-apisports-key": API_KEY
        }
      }
    );

    const standingsData = await standingsRes.json();
    const tabela =
      standingsData.response?.[0]?.league?.standings?.[0] || [];

    const classificacoes = {
      "Primeira Liga": tabela.map(t => ({
        position: t.rank,
        team: t.team.name,
        played: t.all.played,
        won: t.all.win,
        draw: t.all.draw,
        lost: t.all.lose,
        goalDifference: t.goalsDiff,
        points: t.points
      }))
    };

    /* =========================
       3️⃣ DEVOLVER JSON FINAL
    ========================== */

    return res.status(200).json({
      jogos: {
        porJogar: [],   // Mantemos os jogos via ICS
        jogados: []
      },
      classificacoes,
      estatisticas: {
        jogos: totalJogos,
        vitorias,
        empates,
        derrotas,
        golosMarcados,
        golosSofridos
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno" });
  }
}
