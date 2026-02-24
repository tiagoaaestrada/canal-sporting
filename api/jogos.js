export default async function handler(req, res) {
  try {

    const headers = {
      "X-Auth-Token": process.env.FOOTBALL_API_KEY,
    };

    // 1️⃣ Jogos normais da equipa
    const teamRes = await fetch(
      "https://api.football-data.org/v4/teams/498/matches?season=2025",
      { headers }
    );

    const teamData = await teamRes.json();

    // 2️⃣ Taça de Portugal
    const tacaRes = await fetch(
      "https://api.football-data.org/v4/competitions/TP/matches?season=2025",
      { headers }
    );

    const tacaData = await tacaRes.json();

    // 3️⃣ Taça da Liga
    const tacaLigaRes = await fetch(
      "https://api.football-data.org/v4/competitions/TCL/matches?season=2025",
      { headers }
    );

    const tacaLigaData = await tacaLigaRes.json();

    // Junta todos os jogos
    const allMatches = [
      ...(teamData.matches || []),
      ...(tacaData.matches || []),
      ...(tacaLigaData.matches || [])
    ];

    // Filtrar só jogos do Sporting
    const sportingMatches = allMatches.filter(match =>
      match.homeTeam.id === 498 || match.awayTeam.id === 498
    );

    // Remover duplicados (caso venham repetidos)
    const uniqueMatches = Array.from(
      new Map(sportingMatches.map(m => [m.id, m])).values()
    );

    const porJogar = [];
    const jogados = [];

    uniqueMatches.forEach(match => {

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
