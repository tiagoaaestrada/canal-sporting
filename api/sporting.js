export default async function handler(req, res) {
  try {
    const icsUrl =
      "https://ics.ecal.com/ecal-sub/69a028306ebe6600022464b3/Sporting%20CP.ics";

    const response = await fetch(icsUrl);
    const text = await response.text();

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

      const ano = dtstartRaw.substring(0, 4);
      const mes = dtstartRaw.substring(4, 6);
      const dia = dtstartRaw.substring(6, 8);
      const hora = dtstartRaw.substring(9, 11) || "00";
      const min = dtstartRaw.substring(11, 13) || "00";

      const date = new Date(`${ano}-${mes}-${dia}T${hora}:${min}:00`);

      let cleanSummary = summary
        .replace(/⚽️|🏟️|🚍/g, "")
        .replace(/\(Hora a confirmar\)/g, "")
        .trim();

      const vsMatch = cleanSummary.match(
        /(.*?)(\((\d+)\))?\s+(vs|x)\s+(.*?)(\((\d+)\))?$/
      );

      if (!vsMatch) return;

      const homeTeam = vsMatch[1].trim();
      const awayTeam = vsMatch[5].trim();

      const homeScore = vsMatch[3] ? parseInt(vsMatch[3]) : null;
      const awayScore = vsMatch[7] ? parseInt(vsMatch[7]) : null;

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
        score: { home: homeScore, away: awayScore }
      };

      if (date > agora) porJogar.push(jogo);
      else jogados.push(jogo);
    });

    porJogar.sort((a, b) => new Date(a.date) - new Date(b.date));
    jogados.sort((a, b) => new Date(b.date) - new Date(a.date));

    /* =========================
       🔥 CALCULAR ESTATÍSTICAS
    ========================== */

    let vitorias = 0;
    let empates = 0;
    let derrotas = 0;
    let golosMarcados = 0;
    let golosSofridos = 0;

    jogados.forEach(jogo => {
      if (jogo.score.home === null || jogo.score.away === null) return;

      const sportingHome = jogo.homeTeam === "Sporting CP";

      const golosSporting = sportingHome
        ? jogo.score.home
        : jogo.score.away;

      const golosAdversario = sportingHome
        ? jogo.score.away
        : jogo.score.home;

      golosMarcados += golosSporting;
      golosSofridos += golosAdversario;

      if (golosSporting > golosAdversario) vitorias++;
      else if (golosSporting === golosAdversario) empates++;
      else derrotas++;
    });

    res.status(200).json({
      jogos: { porJogar, jogados },
      classificacoes: {},
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
    res.status(500).json({ error: error.message });
  }
}
