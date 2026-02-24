export default async function handler(req, res) {
  try {

    const competitions = {
      "Primeira Liga": "PPL",
      "UEFA Champions League": "CL"
    };

    const result = {};

    for (const [name, code] of Object.entries(competitions)) {

      const response = await fetch(
        `https://api.football-data.org/v4/competitions/${code}/standings`,
        {
          headers: {
            "X-Auth-Token": process.env.FOOTBALL_API_KEY,
          },
        }
      );

      if (!response.ok) continue;

      const data = await response.json();

      result[name] = data.standings[0].table.map(team => ({
        position: team.position,
        team: team.team.name,
        played: team.playedGames,
        points: team.points
      }));
    }

    res.status(200).json(result);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
