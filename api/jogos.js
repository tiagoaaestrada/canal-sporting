export default async function handler(req, res) {
  try {
    const response = await fetch(
      "https://api.football-data.org/v4/teams/498/matches?status=SCHEDULED,FINISHED",
      {
        headers: {
          "X-Auth-Token": process.env.FOOTBALL_API_KEY,
        },
      }
    );

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Erro na API football-data",
        details: await response.text(),
      });
    }

    const data = await response.json();

    const porJogar = {};
    const jogados = {};

    data.matches.forEach((match) => {
      const jogo = {
        id: match.id,
        competition: match.competition.name,
        date: new Date(match.utcDate),
        dataFormatada: new Date(match.utcDate).toLocaleString("pt-PT"),
        homeTeam: match.homeTeam.name,
        awayTeam: match.awayTeam.name,
        score: match.score.fullTime,
      };

      if (match.status === "SCHEDULED") {
        if (!porJogar[jogo.competition]) {
          porJogar[jogo.competition] = [];
        }
        porJogar[jogo.competition].push(jogo);
      }

      if (match.status === "FINISHED") {
        if (!jogados[jogo.competition]) {
          jogados[jogo.competition] = [];
        }
        jogados[jogo.competition].push(jogo);
      }
    });

    // 🔽 Ordenação
    Object.keys(porJogar).forEach((comp) => {
      porJogar[comp].sort((a, b) => a.date - b.date);
    });

    Object.keys(jogados).forEach((comp) => {
      jogados[comp].sort((a, b) => b.date - a.date);
    });

    res.status(200).json({
      porJogar,
      jogados,
    });

  } catch (error) {
    res.status(500).json({
      error: "Erro interno ao obter jogos",
      details: error.message,
    });
  }
}
