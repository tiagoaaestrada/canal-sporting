export default async function handler(req, res) {
  try {

    if (!process.env.FOOTBALL_API_KEY) {
      return res.status(500).json({ error: "FOOTBALL_API_KEY não configurada" });
    }

    const response = await fetch(
      "https://api.football-data.org/v4/teams/498/matches",
      {
        headers: {
          "X-Auth-Token": process.env.FOOTBALL_API_KEY
        }
      }
    );

    const text = await response.text();

    return res.status(200).send(text);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
