export default async function handler(req, res) {

  try {

    const response = await fetch(
      "https://ics.ecal.com/ecal-sub/69a028306ebe6600022464b3/Sporting%20CP.ics"
    );

    const text = await response.text();

    const eventos = text.split("BEGIN:VEVENT");

    const jogos = [];
    const agora = new Date();

    eventos.forEach(evento => {

      if (!evento.includes("SUMMARY")) return;

      const summaryMatch = evento.match(/SUMMARY:(.*)/);
      const dtMatch = evento.match(/DTSTART:(.*)/);

      if (!summaryMatch || !dtMatch) return;

      const summary = summaryMatch[1].trim();
      const dt = dtMatch[1].trim();

      const data = new Date(
        dt.replace(
          /(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z/,
          "$1-$2-$3T$4:$5:$6Z"
        )
      );

      const equipas = summary.split(" - ");
      if (equipas.length !== 2) return;

      const homeTeam = equipas[0];
      const awayTeam = equipas[1];

      jogos.push({
        date: data,
        competition: "Competição",
        homeTeam,
        awayTeam,
        score: { home: null, away: null }
      });

    });

    const porJogar = jogos.filter(j => new Date(j.date) >= agora);
    const jogados = jogos.filter(j => new Date(j.date) < agora);

    res.status(200).json({
      jogos: {
        porJogar,
        jogados
      },
      estatisticas: {
        jogos: jogados.length,
        vitorias: 0,
        empates: 0,
        derrotas: 0,
        golosMarcados: 0,
        golosSofridos: 0
      }
    });

  } catch (error) {

    res.status(500).json({ error: "Erro ao carregar ICS Sporting" });

  }
}
