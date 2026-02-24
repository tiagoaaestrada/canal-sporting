export default async function handler(req, res) {
  try {

    const response = await fetch(
      "https://api.football-data.org/v4/teams/498/matches?season=2025",
      {
        headers: {
          "X-Auth-Token": process.env.FOOTBALL_API_KEY,
        },
      }
    );

    const data = await response.json();

    const porJogar = [];
    const jogados = [];

    data.matches.forEach(match => {

      const jogo = {
        id: match.id,
        competition: match.competition.name,
        date: match.utcDate,
        venue: match.venue || "Estádio por confirmar",
        homeTeam: match.homeTeam.name,
        homeCrest: match.homeTeam.crest,
        awayTeam: match.awayTeam.name,
        awayCrest: match.awayTeam.crest,
        score: match.score.fullTime
      };

      if (match.status === "SCHEDULED" || match.status === "TIMED") {
        porJogar.push(jogo);
      }

      if (match.status === "FINISHED") {
        jogados.push(jogo);
      }

    });

    res.status(200).json({ porJogar, jogados });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
