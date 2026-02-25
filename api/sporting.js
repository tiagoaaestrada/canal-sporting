export default async function handler(req, res) {
  try {
    const headers = {
      "X-Auth-Token": process.env.FOOTBALL_API_KEY
    };

    const teamId = 498; // Sporting CP
    const season = 2025;

    /* ========================
       1️⃣ FUNÇÃO PARA BUSCAR JOGOS POR COMPETIÇÃO
    ======================== */

    async function getMatchesByCompetition(code, competitionName) {
      const response = await fetch(
        `https://api.football-data.org/v4/competitions/${code}/matches?season=${season}`,
        { headers }
      );

      const data = await response.json();
      if (!data.matches) return [];

      return data.matches
        .filter(match =>
          match.homeTeam.id === teamId ||
          match.awayTeam.id === teamId
        )
        .map(match => ({
          id: match.id,
          competition: competitionName,
          date: match.utcDate,
          status: match.status,
          homeTeam: match.homeTeam.name,
          awayTeam: match.awayTeam.name,
          score: {
            home: match.score.fullTime.home,
            away: match.score.fullTime.away
          }
        }));
    }

    /* ========================
       2️⃣ BUSCAR TODAS AS COMPETIÇÕES
    ======================== */

    const liga = await getMatchesByCompetition("PPL", "Primeira Liga");
    const champions = await getMatchesByCompetition("CL", "Champions League");
    const tacaPortugal = await getMatchesByCompetition("TP", "Taça de Portugal");
    const tacaLiga = await getMatchesByCompetition("CLI", "Taça da Liga");

    const allMatches = [
      ...liga,
      ...champions,
      ...tacaPortugal,
      ...tacaLiga
    ];

    /* ========================
       3️⃣ SEPARAR POR JOGAR / JOGADOS
    ======================== */

    const porJogar = [];
    const jogados = [];

    allMatches.forEach(match => {
      if (match.status === "SCHEDULED" || match.status === "TIMED") {
        porJogar.push(match);
      }

      if (match.status === "FINISHED") {
        jogados.push(match);
      }
    });

    /* ========================
       4️⃣ CLASSIFICAÇÕES (só Liga + CL)
    ======================== */

    async function getStandings(code) {
      const response = await fetch(
        `https://api.football-data.org/v4/competitions/${code}/standings`,
        { headers }
      );

      const data = await response.json();
      const table = data.standings?.[0]?.table || [];

      return table.map(team => ({
        position: team.position,
        team: team.team.name,
        played: team.playedGames,
        won: team.won,
        draw: team.draw,
        lost: team.lost,
        goalDifference: team.goalDifference,
        points: team.points
      }));
    }

    const classificacoes = {
      "Primeira Liga": await getStandings("PPL"),
      "UEFA Champions League": await getStandings("CL")
    };

    /* ========================
       5️⃣ ESTATÍSTICAS GERAIS
    ======================== */

    let jogosTotal = 0;
    let vitorias = 0;
    let empates = 0;
    let derrotas = 0;
    let golosMarcados = 0;
    let golosSofridos = 0;

    jogados.forEach(match => {

      const sportingHome = match.homeTeam.includes("Sporting");

      const golosSporting = sportingHome
        ? match.score.home
        : match.score.away;

      const golosAdversario = sportingHome
        ? match.score.away
        : match.score.home;

      jogosTotal++;

      golosMarcados += golosSporting;
      golosSofridos += golosAdversario;

      if (golosSporting > golosAdversario) vitorias++;
      else if (golosSporting === golosAdversario) empates++;
      else derrotas++;
    });

    const estatisticas = {
      jogos: jogosTotal,
      vitorias,
      empates,
      derrotas,
      golosMarcados,
      golosSofridos
    };

    /* ========================
       RESPOSTA FINAL
    ======================== */

    res.status(200).json({
      jogos: { porJogar, jogados },
      classificacoes,
      estatisticas
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
