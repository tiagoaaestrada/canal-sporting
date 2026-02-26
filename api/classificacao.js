export default async function handler(req, res) {
  try {
    const response = await fetch(
      "https://v3.football.api-sports.io/standings?league=94&season=2025",
      {
        headers: {
          "x-apisports-key": process.env.API_FOOTBALL_KEY,
        },
      }
    );

    const data = await response.json();

    if (!data.response || !data.response[0]) {
      return res.status(500).json({
        error: "Sem dados de classificação",
        raw: data,
      });
    }

    const tabela = data.response[0].league.standings[0];

    const classificacao = tabela.map((team) => ({
      position: team.rank,
      team: team.team.name,
      played: team.all.played,
      won: team.all.win,
      draw: team.all.draw,
      lost: team.all.lose,
      goalsFor: team.all.goals.for,
      goalsAgainst: team.all.goals.against,
      goalDifference:
        team.all.goals.for - team.all.goals.against,
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
