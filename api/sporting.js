export default async function handler(req, res) {

  try {

    const API_KEY = process.env.FOOTBALL_DATA_KEY;
    const agora = new Date();

    const headers = {
      "X-Auth-Token": API_KEY
    };

    const competicoes = [
      { code: "PPL", nome: "Primeira Liga" },
      { code: "CL", nome: "Champions League" },
      { code: "CPD", nome: "Taça de Portugal" },
      { code: "LC", nome: "Taça da Liga" }
    ];

    let jogos = [];

    for (const comp of competicoes) {

      try {

        const response = await fetch(
          `https://api.football-data.org/v4/competitions/${comp.code}/matches?season=2025`,
          { headers }
        );

        const data = await response.json();

        if (!data.matches) continue;

        const jogosCompeticao = data.matches
          .filter(m =>
            m.homeTeam.id === 498 ||
            m.awayTeam.id === 498
          )
          .map(m => ({
            date: m.utcDate,
            competition: comp.nome,
            homeTeam: m.homeTeam.name,
            awayTeam: m.awayTeam.name,
            score: {
              home: m.score.fullTime.home,
              away: m.score.fullTime.away
            }
          }));

        jogos = jogos.concat(jogosCompeticao);

      } catch {
        // Se competição não disponível no plano, ignorar
        continue;
      }
    }

    // Ordenar cronologicamente
    jogos.sort((a,b) => new Date(a.date) - new Date(b.date));

    const porJogar = jogos.filter(j =>
      new Date(j.date) >= agora
    );

    const jogados = jogos.filter(j =>
      new Date(j.date) < agora
    );

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
      error: "Erro ao carregar competições",
      detalhe: error.message
    });

  }
}
