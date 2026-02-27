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

    let jogos = data.matches.map(m => ({
      date: m.utcDate,
      competition: m.competition.name,
      homeTeam: m.homeTeam.name,
      awayTeam: m.awayTeam.name,
      score: {
        home: m.score.fullTime.home,
        away: m.score.fullTime.away
      }
    }));
    
/* =======================
   TAÇAS (ICS Sporting)
======================= */

try {
  const uefaIcsUrl = "https://ics.ecal.com/ecal-sub/65579626831e20000d568cec/Sporting%20CP.ics";

  const resIcs = await fetch(uefaIcsUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Accept": "text/calendar"
    }
  });

  const icsText = await resIcs.text();

  const lines = icsText.split("BEGIN:VEVENT");

  lines.forEach(evento => {

    if (!evento.includes("SUMMARY")) return;

    // Todos os summaries
    const summaryMatch = evento.match(/SUMMARY:(.*)/);
    const dtStartMatch = evento.match(/DTSTART:(.*)/);

    if (!summaryMatch || !dtStartMatch) return;

    let summary = summaryMatch[1].trim();
    const dtStart = dtStartMatch[1].trim();

    // Converter data
    const date = new Date(
      dtStart.replace(
        /(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z/,
        "$1-$2-$3T$4:$5:$6Z"
      )
    );

    // Vamos filtrar pelos nomes das Taças
    // A Taça de Portugal costuma aparecer nesses eventos
    const lower = summary.toLowerCase();

    if (
      lower.includes("taça de portugal") ||
      lower.includes("taca de portugal") ||
      lower.includes("taça da liga") ||
      lower.includes("taca da liga")
    ) {

      // Normalização do texto
      // Pode vir tipo: “Taça de Portugal: Sporting CP - FC Porto”
      // Queremos só “Sporting CP - FC Porto”
      if (summary.includes(":")) {
        summary = summary.split(":").pop().trim();
      }

      // Separadores possíveis
      let teams;
      if (summary.includes(" - ")) {
        teams = summary.split(" - ");
      } else if (summary.includes(" vs ")) {
        teams = summary.split(" vs ");
      } else if (summary.includes(" v ")) {
        teams = summary.split(" v ");
      } else {
        return;
      }

      if (teams.length !== 2) return;

      jogos.push({
        date,
        competition: summary.toLowerCase().includes("taça da liga") || summary.toLowerCase().includes("taca da liga") ? "Taça da Liga" : "Taça de Portugal",
        homeTeam: teams[0].trim(),
        awayTeam: teams[1].trim(),
        score: { home: null, away: null }
      });

    }
  });

} catch (err) {
  console.error("Erro ao carregar Taças do ICS:", err.message);
}
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
