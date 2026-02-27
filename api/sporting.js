export default async function handler(req, res) {

  try {

    const API_KEY = process.env.FOOTBALL_DATA_KEY;
    const agora = new Date();

    const response = await fetch(
      "https://api.football-data.org/v4/teams/498/matches?season=2025",
      {
        headers: {
          "X-Auth-Token": API_KEY
        }
      }
    );

    const data = await response.json();

    if (!data.matches) {
      return res.status(500).json({ error: "Sem jogos disponíveis" });
    }

    const jogos = data.matches.map(m => ({
      date: m.utcDate,
      competition: m.competition.name,
      homeTeam: m.homeTeam.name,
      awayTeam: m.awayTeam.name,
      score: {
        home: m.score.fullTime.home,
        away: m.score.fullTime.away
      }
    }));

    const porJogar = jogos
      .filter(j => new Date(j.date) >= agora)
      .sort((a,b) => new Date(a.date) - new Date(b.date));

    const jogados = jogos
      .filter(j => new Date(j.date) < agora)
      .sort((a,b) => new Date(b.date) - new Date(a.date));

    /* ===== ESTATÍSTICAS GLOBAIS ===== */

    let vitorias = 0;
    let empates = 0;
    let derrotas = 0;
    let golosMarcados = 0;
    let golosSofridos = 0;

    jogados.forEach(j => {

      if (j.score.home === null) return;

      const sportingHome = j.homeTeam.includes("Sporting");

      const gm = sportingHome ? j.score.home : j.score.away;
      const gs = sportingHome ? j.score.away : j.score.home;

      golosMarcados += gm;
      golosSofridos += gs;

      if (gm > gs) vitorias++;
      else if (gm === gs) empates++;
      else derrotas++;

    });

    res.status(200).json({
      jogos: { porJogar, jogados },
      estatisticas: {
        jogos: jogados.length,
        vitorias,
        empates,
        derrotas,
        golosMarcados,
        golosSofridos
      }
    });

  } catch (error) {

    res.status(500).json({
      error: "Erro ao carregar jogos football-data",
      detalhe: error.message
    });

  }
}
