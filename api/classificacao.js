export default async function handler(req, res) {
  try {
    const response = await fetch(
      "https://api.football-data.org/v4/competitions/PPL/standings",
      {
        headers: {
          "X-Auth-Token": process.env.FOOTBALL_API_KEY,
        },
      }
    );

    const data = await response.json();

    if (!data.standings || !data.standings[0]) {
      return res.status(500).json({
        error: "Sem dados de classificação",
        raw: data,
      });
    }

    const tabela = data.standings[0].table;

    const classificacao = tabela.map((team) => ({
      position: team.position,
      team: team.team.name,
      played: team.playedGames,
      won: team.won,
      draw: team.draw,
      lost: team.lost,
      goalsFor: team.goalsFor,
      goalsAgainst: team.goalsAgainst,
      goalDifference: team.goalDifference,
      points: team.points,
    }));

    res.status(200).json({
      "Primeira Liga": classificacao,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Erro ao obter classificação",
    });
  }
}
