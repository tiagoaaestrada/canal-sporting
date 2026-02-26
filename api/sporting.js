export default async function handler(req, res) {
  try {
    const icsUrl =
      "https://ics.ecal.com/ecal-sub/69a028306ebe6600022464b3/Sporting%20CP.ics";

    const response = await fetch(icsUrl);
    const text = await response.text();

    if (!text.includes("BEGIN:VEVENT")) {
      return res.status(500).json({
        error: "Calendário inválido"
      });
    }

    const eventos = text.split("BEGIN:VEVENT").slice(1);
    const agora = new Date();

    const porJogar = [];
    const jogados = [];

    eventos.forEach(evento => {
      const getValue = field => {
        const match = evento.match(new RegExp(field + ":(.*)"));
        return match ? match[1].trim() : null;
      };

      const dtstartRaw = getValue("DTSTART");
      const summary = getValue("SUMMARY");
      const description = getValue("DESCRIPTION");

      if (!dtstartRaw || !summary) return;

      // Converter data
      const ano = dtstartRaw.substring(0, 4);
      const mes = dtstartRaw.substring(4, 6);
      const dia = dtstartRaw.substring(6, 8);
      const hora = dtstartRaw.substring(9, 11) || "00";
      const min = dtstartRaw.substring(11, 13) || "00";

      const date = new Date(`${ano}-${mes}-${dia}T${hora}:${min}:00`);

      // 🔥 LIMPEZA DO SUMMARY
      let cleanSummary = summary
        .replace(/⚽️|🏟️|🚍/g, "")
        .replace(/\(Hora a confirmar\)/g, "")
        .trim();

      // Extrair equipas
      let homeTeam = "";
      let awayTeam = "";
      let homeScore = null;
      let awayScore = null;

      const vsMatch = cleanSummary.match(
        /(.*?)(\((\d+)\))?\s+(vs|x)\s+(.*?)(\((\d+)\))?$/
      );

      if (!vsMatch) return;

      homeTeam = vsMatch[1].trim();
      awayTeam = vsMatch[5].trim();

      if (vsMatch[3]) homeScore = parseInt(vsMatch[3]);
      if (vsMatch[7]) awayScore = parseInt(vsMatch[7]);

      // Detectar competição
      let competition = "Outra";
      if (description?.includes("Liga")) competition = "Primeira Liga";
      if (description?.includes("Taça")) competition = "Taça";
      if (description?.includes("Champions")) competition = "Champions League";
      if (description?.includes("Amigável")) competition = "Amigável";

      const jogo = {
        date,
        competition,
        homeTeam,
        awayTeam,
        score: {
          home: homeScore,
          away: awayScore
        }
      };

      if (date > agora) porJogar.push(jogo);
      else jogados.push(jogo);
    });

    // Ordenar cronologicamente
    porJogar.sort((a, b) => new Date(a.date) - new Date(b.date));
    jogados.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.status(200).json({
      jogos: { porJogar, jogados },
      classificacoes: {},
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
    res.status(500).json({
      error: error.message
    });
  }
}
