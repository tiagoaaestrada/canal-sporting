export default async function handler(req, res) {

  try {

    const response = await fetch(
      "webcal://ics.ecal.com/ecal-sub/69a17f73c235f1000223dbc1/Sporting%20CP.ics"
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

      let summary = summaryMatch[1].trim();
      const dt = dtMatch[1].trim();

      const data = new Date(
        dt.replace(
          /(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z/,
          "$1-$2-$3T$4:$5:$6Z"
        )
      );

      // Remover símbolo ▶️
      summary = summary.replace("▶️ ", "");

      // Exemplo jogado:
      // Sporting CP 1 - 0 FC Famalicão
      const resultadoRegex = /(.*)\s(\d+)\s-\s(\d+)\s(.*)/;

      let homeTeam, awayTeam, homeScore = null, awayScore = null;

      if (resultadoRegex.test(summary)) {

        const match = summary.match(resultadoRegex);

        homeTeam = match[1].trim();
        homeScore = parseInt(match[2]);
        awayScore = parseInt(match[3]);
        awayTeam = match[4].trim();

      } else {

        const equipas = summary.split(" - ");
        if (equipas.length !== 2) return;

        homeTeam = equipas[0].trim();
        awayTeam = equipas[1].trim();
      }

      jogos.push({
        date: data,
        competition: "Liga Portugal",
        homeTeam,
        awayTeam,
        score: {
          home: homeScore,
          away: awayScore
        }
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
