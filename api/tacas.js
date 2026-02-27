export default async function handler(req, res) {

  try {

    const agora = new Date();
    const icsUrl = "https://ics.ecal.com/ecal-sub/65579626831e20000d568cec/Sporting%20CP.ics";

    const response = await fetch(icsUrl);
    const icsText = await response.text();

    const eventos = icsText.split("BEGIN:VEVENT");

    let jogos = [];

    for (const evento of eventos) {

      if (!evento.includes("SUMMARY") || !evento.includes("DTSTART") || !evento.includes("DESCRIPTION"))
        continue;

      const summaryMatch = evento.match(/SUMMARY:(.*)/);
      const dtMatch = evento.match(/DTSTART:(.*)/);
      const descMatch = evento.match(/DESCRIPTION:(.*)/);

      if (!summaryMatch || !dtMatch || !descMatch)
        continue;

      const summaryRaw = summaryMatch[1].trim();
      const description = descMatch[1].toLowerCase();

      // Apenas Taças
      if (
        !description.includes("taça de portugal") &&
        !description.includes("taca de portugal") &&
        !description.includes("taça da liga") &&
        !description.includes("taca da liga")
      ) continue;

      // Converter data
      const formatted = dtMatch[1].trim().replace(
        /(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z/,
        "$1-$2-$3T$4:$5:$6Z"
      );

      const date = new Date(formatted);

      // Remover emojis e símbolos estranhos
      const summary = summaryRaw.replace(/[^\p{L}\p{N}\s\.\-\:]/gu, "").trim();

      // 🎯 Extrair resultado se existir (ex: 2-1)
      const scoreMatch = summary.match(/(\d+)[-–](\d+)/);

      let score = { home: null, away: null };

      if (scoreMatch) {
        score = {
          home: parseInt(scoreMatch[1]),
          away: parseInt(scoreMatch[2])
        };
      }

      // Remover o resultado do texto para separar equipas
      let cleanSummary = summary;
      if (scoreMatch) {
        cleanSummary = summary.replace(/(\d+)[-–](\d+)/, "").trim();
      }

      // Separar equipas
      let teams = null;

      if (cleanSummary.includes(" vs "))
        teams = cleanSummary.split(" vs ");
      else if (cleanSummary.includes(" - "))
        teams = cleanSummary.split(" - ");
      else continue;

      if (!teams || teams.length !== 2)
        continue;

      const competitionName = description.includes("liga")
        ? "Taça da Liga"
        : "Taça de Portugal";

      jogos.push({
        date,
        competition: competitionName,
        homeTeam: teams[0].trim(),
        awayTeam: teams[1].trim(),
        score
      });

    }

    const porJogar = jogos
      .filter(j => new Date(j.date) >= agora || j.score.home === null)
      .sort((a,b) => new Date(a.date) - new Date(b.date));

    const jogados = jogos
      .filter(j => j.score.home !== null && new Date(j.date) < agora)
      .sort((a,b) => new Date(b.date) - new Date(a.date));

    res.status(200).json({
      jogos: { porJogar, jogados }
    });

  } catch (error) {

    res.status(500).json({
      error: "Erro ao carregar Taças",
      detalhe: error.message
    });

  }
}
