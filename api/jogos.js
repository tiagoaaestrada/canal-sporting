export default async function handler(req, res) {
  try {
    const headers = {
      "x-apisports-key": process.env.APISPORTS_KEY
    };

    const response = await fetch(
      "https://v3.football.api-sports.io/fixtures?team=228&season=2025",
      { headers }
    );

    const data = await response.json();

    const porJogar = [];
    const jogados = [];

    data.response.forEach(match => {
      const jogo = {
        id: match.fixture.id,
        competition: match.league.name,
        date: match.fixture.date,
        homeTeam: match.teams.home.name,
        homeLogo: match.teams.home.logo,
        awayTeam: match.teams.away.name,
        awayLogo: match.teams.away.logo,
        score: {
          home: match.goals.home,
          away: match.goals.away
        },
        venue: match.fixture.venue.name
      };

      if (match.fixture.status.short === "NS") {
        porJogar.push(jogo);
      }

      if (match.fixture.status.short === "FT") {
        jogados.push(jogo);
      }
    });

    res.status(200).json({ porJogar, jogados });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
