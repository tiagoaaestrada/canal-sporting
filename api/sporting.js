export default async function handler(req, res) {

  try {

    const headers = {
      "X-Auth-Token": process.env.FOOTBALL_API_KEY
    };

    const teamId = 498; // Sporting
    const season = 2025;

    /* ================= JOGOS ================= */

    const matchesRes = await fetch(
      `https://api.football-data.org/v4/teams/${teamId}/matches?season=${season}`,
      { headers }
    );

    const matchesData = await matchesRes.json();

    const porJogar = [];
    const jogados = [];

    for (const match of matchesData.matches) {

      const homeTeam = match.homeTeam.name;
      const awayTeam = match.awayTeam.name;

      const jogo = {
        id: match.id,
        date: match.utcDate,
        homeTeam,
        awayTeam,
        score: {
          home: match.score.fullTime.home,
          away: match.score.fullTime.away
        }
      };

      if (match.status === "SCHEDULED" || match.status === "TIMED") {
        porJogar.push(jogo);
      }

      if (match.status === "FINISHED") {
        jogados.push(jogo);
      }
    }

    /* ================= CLASSIFICAÇÕES ================= */

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

    /* ================= ESTATÍSTICAS ================= */

    let jogosTotal = 0;
    let vitorias = 0;
    let empates = 0;
    let derrotas = 0;
    let golosMarcados = 0;
    let golosSofridos = 0;

    for (const match of jogados) {

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
    }

    const estatisticas = {
      jogos: jogosTotal,
      vitorias,
      empates,
      derrotas,
      golosMarcados,
      golosSofridos
    };

    res.status(200).json({
      jogos: { porJogar, jogados },
      classificacoes,
      estatisticas
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
