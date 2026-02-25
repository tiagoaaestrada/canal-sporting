export default async function handler(req, res) {
  try {
    const headers = {
      "x-apisports-key": process.env.APISPORTS_KEY
    };

    const season = 2025;
    const teamId = 228; // Sporting CP

    /* ===============================
       1️⃣ JOGOS
    =============================== */

    const fixturesRes = await fetch(
      `https://v3.football.api-sports.io/fixtures?team=${teamId}&season=${season}`,
      { headers }
    );

    const fixturesData = await fixturesRes.json();

    const porJogar = [];
    const jogados = [];

    fixturesData.response.forEach(match => {
      const jogo = {
        id: match.fixture.id,
        competition: match.league.name,
        date: match.fixture.date,
        venue: match.fixture.venue?.name || "",
        homeTeam: match.teams.home.name,
        homeLogo: match.teams.home.logo,
        awayTeam: match.teams.away.name,
        awayLogo: match.teams.away.logo,
        score: {
          home: match.goals.home,
          away: match.goals.away
        }
      };

      if (match.fixture.status.short === "NS") {
        porJogar.push(jogo);
      }

      if (match.fixture.status.short === "FT") {
        jogados.push(jogo);
      }
    });

    /* ===============================
       2️⃣ CLASSIFICAÇÕES
    =============================== */

    async function getStandings(leagueId) {
      const response = await fetch(
        `https://v3.football.api-sports.io/standings?league=${leagueId}&season=${season}`,
        { headers }
      );

      const data = await response.json();
      const table = data.response[0]?.league?.standings[0] || [];

      return table.map(team => ({
        position: team.rank,
        team: team.team.name,
        played: team.all.played,
        won: team.all.win,
        draw: team.all.draw,
        lost: team.all.lose,
        goalDifference: team.goalsDiff,
        points: team.points
      }));
    }

    const classificacoes = {
      "Primeira Liga": await getStandings(94),
      "UEFA Champions League": await getStandings(2)
    };

    /* ===============================
       3️⃣ ESTATÍSTICAS EQUIPA (Liga)
    =============================== */

    const statsRes = await fetch(
      `https://v3.football.api-sports.io/teams/statistics?league=94&season=${season}&team=${teamId}`,
      { headers }
    );

    const statsData = await statsRes.json();
    const stats = statsData.response;

    const estatisticas = {
      jogos: stats?.fixtures?.played?.total || 0,
      vitorias: stats?.fixtures?.wins?.total || 0,
      empates: stats?.fixtures?.draws?.total || 0,
      derrotas: stats?.fixtures?.loses?.total || 0,
      golosMarcados: stats?.goals?.for?.total?.total || 0,
      golosSofridos: stats?.goals?.against?.total?.total || 0
    };

    /* ===============================
       4️⃣ MARCADORES
    =============================== */

    const playersRes = await fetch(
      `https://v3.football.api-sports.io/players?team=${teamId}&season=${season}`,
      { headers }
    );

    const playersData = await playersRes.json();

    const marcadores = playersData.response.map(player => ({
      nome: player.player.name,
      foto: player.player.photo,
      golos: player.statistics[0]?.goals?.total || 0,
      assistencias: player.statistics[0]?.goals?.assists || 0
    }));

    /* ===============================
       RESPOSTA FINAL
    =============================== */

    res.status(200).json({
      jogos: {
        porJogar,
        jogados
      },
      classificacoes,
      estatisticas,
      marcadores
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
}
