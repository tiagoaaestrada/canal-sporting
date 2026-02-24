export default async function handler(req, res) {
  try {

    const headers = {
      "x-apisports-key": process.env.APISPORTS_KEY
    };

    const leagues = [
      { name: "Primeira Liga", id: 94 },
      { name: "UEFA Champions League", id: 2 }
    ];

    const resultado = {};

    for (const league of leagues) {
      const response = await fetch(
        `https://v3.football.api-sports.io/standings?league=${league.id}&season=2025`,
        { headers }
      );

      const data = await response.json();

      const tabela = data.response[0]?.league?.standings[0] || [];

      resultado[league.name] = tabela.map(team => ({
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

    res.status(200).json(resultado);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
