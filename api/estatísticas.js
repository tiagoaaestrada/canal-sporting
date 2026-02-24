export default async function handler(req, res) {
  try {

    const headers = {
      "x-apisports-key": process.env.APISPORTS_KEY
    };

    const response = await fetch(
      "https://v3.football.api-sports.io/teams/statistics?league=94&season=2025&team=228",
      { headers }
    );

    const data = await response.json();
    const stats = data.response;

    res.status(200).json({
      jogos: stats.fixtures.played.total,
      vitorias: stats.fixtures.wins.total,
      empates: stats.fixtures.draws.total,
      derrotas: stats.fixtures.loses.total,
      golosMarcados: stats.goals.for.total.total,
      golosSofridos: stats.goals.against.total.total
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
