export default async function handler(req, res) {

  try {

    const API_KEY = process.env.FOOTBALL_DATA_KEY;
    const agora = new Date();

    let jogos = [];

    /* =========================
       1️⃣ FOOTBALL-DATA (Base)
    ========================== */

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

    jogos = data.matches.map(m => ({

      date: m.utcDate,

      competition: m.competition?.name ?? "Desconhecida",

      homeTeam: m.homeTeam?.name ?? "",
      awayTeam: m.awayTeam?.name ?? "",

      status: m.status ?? "SCHEDULED",

      score: {
        home: m.score?.fullTime?.home ?? null,
        away: m.score?.fullTime?.away ?? null
      }

    }));


    /* =========================
       2️⃣ TAÇAS VIA ICS
    ========================== */

    try {

      const icsUrl =
        "https://ics.ecal.com/ecal-sub/65579626831e20000d568cec/Sporting%20CP.ics";

      const resIcs = await fetch(icsUrl);
      const icsText = await resIcs.text();

      const eventos = icsText.split("BEGIN:VEVENT");

      for (const evento of eventos) {

        if (!evento.includes("SUMMARY") || !evento.includes("DTSTART"))
          continue;

        const summaryMatch = evento.match(/SUMMARY:(.*)/);
        const dtMatch = evento.match(/DTSTART:(.*)/);
        const descMatch = evento.match(/DESCRIPTION:(.*)/);

        if (!summaryMatch || !dtMatch) continue;

        const summary = summaryMatch[1].trim();
        const description = descMatch ? descMatch[1].toLowerCase() : "";

        if (
          !description.includes("taça") &&
          !description.includes("taca")
        ) continue;

        const formatted = dtMatch[1].trim().replace(
          /(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z/,
          "$1-$2-$3T$4:$5:$6Z"
        );

        const date = new Date(formatted);

        let teams = null;

        if (summary.includes(" vs "))
          teams = summary.split(" vs ");
        else if (summary.includes(" - "))
          teams = summary.split(" - ");
        else continue;

        if (!teams || teams.length !== 2) continue;

        const homeTeam = teams[0].replace(/[\u{1F300}-\u{1FAFF}]/gu, "").trim();
        const awayTeam = teams[1].replace(/[\u{1F300}-\u{1FAFF}]/gu, "").trim();

        const jaExiste = jogos.some(j =>
          j.homeTeam === homeTeam &&
          j.awayTeam === awayTeam &&
          Math.abs(new Date(j.date) - date) < 86400000
        );

        if (jaExiste) continue;

        const competitionName = description.includes("liga")
          ? "Taça da Liga"
          : "Taça de Portugal";

        jogos.push({
          date,
          competition: competitionName,
          homeTeam,
          awayTeam,
          status: "SCHEDULED",
          score: { home: null, away: null }
        });

      }

    } catch (err) {
      console.log("Erro ao carregar Taças ICS:", err.message);
    }

    for (const j of jogos) {
    
      if (j.score.home !== null) continue;
    
      const match = jogos.find(apiGame =>
        apiGame.score.home !== null &&
        apiGame.homeTeam.includes("Sporting") &&
        apiGame.awayTeam === j.awayTeam
      );
    
      if (match) {
        j.score = match.score;
      }
    
    }
    
    /* =========================
       3️⃣ ORDENAR
    ========================== */

    const porJogar = jogos
      .filter(j => new Date(j.date) >= agora)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    const jogados = jogos
      .filter(j => new Date(j.date) < agora)
      .sort((a, b) => new Date(b.date) - new Date(a.date));


    /* =========================
       4️⃣ ESTATÍSTICAS
    ========================== */

    let vitorias = 0;
    let empates = 0;
    let derrotas = 0;
    let golosMarcados = 0;
    let golosSofridos = 0;

    jogados.forEach(j => {

      if (j.score.home === null) return;

      const sportingHome = j.homeTeam.toLowerCase().includes("sporting");

      const gm = sportingHome ? j.score.home : j.score.away;
      const gs = sportingHome ? j.score.away : j.score.home;

      golosMarcados += gm;
      golosSofridos += gs;

      if (gm > gs) vitorias++;
      else if (gm === gs) empates++;
      else derrotas++;

    });


    /* =========================
       5️⃣ RESPONSE
    ========================== */

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
      error: "Erro ao carregar jogos",
      detalhe: error.message
    });

  }

}
