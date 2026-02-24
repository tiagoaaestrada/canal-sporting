export default async function handler(req, res) {
  try {

    const competitions = {
      "Taça de Portugal": "TP",
      "Taça da Liga": "LC"
    };

    const result = {};

    for (const [name, code] of Object.entries(competitions)) {

      const response = await fetch(
        `https://api.football-data.org/v4/teams/498/matches?competitions=${code}`,
        {
          headers: {
            "X-Auth-Token": process.env.FOOTBALL_API_KEY,
          },
        }
      );

      if (!response.ok) continue;

      const data = await response.json();

      result[name] = data.matches.map(match => ({
        date: match.utcDate,
        home: match.homeTeam.name,
        away: match.awayTeam.name,
        score: match.score.fullTime
      }));
    }

    res.status(200).json(result);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
