export default async function handler(req, res) {

  try {

    const API_KEY = process.env.FOOTBALL_DATA_KEY;

    const agora = new Date();
    let jogos = [];

    /* =======================
       PRIMEIRA LIGA (API)
    ======================== */

    const ligaRes = await fetch(
      "https://api.football-data.org/v4/competitions/PPL/matches?season=2025",
      {
        headers: { "X-Auth-Token": API_KEY }
      }
    );

    const ligaData = await ligaRes.json();

    if (ligaData.matches) {

      const jogosLiga = ligaData.matches
        .filter(m => m.homeTeam.id === 498 || m.awayTeam.id === 498)
        .map(m => ({
          date: m.utcDate,
          competition: "Primeira Liga",
          homeTeam: m.homeTeam.name,
          awayTeam: m.awayTeam.name,
          score: {
            home: m.score.fullTime.home,
            away: m.score.fullTime.away
          }
        }));

      jogos = jogos.concat(jogosLiga);
    }
/* =======================
   CHAMPIONS (ICS UEFA)
======================= */

const uefaRes = await fetch(
  "https://calendar.uefa.com/v1/calendar.ics?competitionId=1&countryCode=PT&language=PT&reminder=60&teamId=50149",
  {
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Accept": "text/calendar"
    }
  }
);

const uefaText = await uefaRes.text();

const eventos = uefaText.split("BEGIN:VEVENT");

eventos.forEach(evento => {

  const summaryMatch = evento.match(/SUMMARY:(.*)/);
  const dtMatch = evento.match(/DTSTART:(.*)/);

  if (!summaryMatch || !dtMatch) return;

  let summary = summaryMatch[1].trim();
  const dt = dtMatch[1].trim();

  // Remover tudo antes do último ":"
  if (summary.includes(":")) {
    summary = summary.split(":").pop().trim();
  }

  const data = new Date(
    dt.replace(
      /(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z/,
      "$1-$2-$3T$4:$5:$6Z"
    )
  );

  // Aceitar vários separadores
  let equipas;

  if (summary.includes(" - ")) {
    equipas = summary.split(" - ");
  } else if (summary.includes(" vs ")) {
    equipas = summary.split(" vs ");
  } else if (summary.includes(" v ")) {
    equipas = summary.split(" v ");
  } else {
    return;
  }

  if (equipas.length !== 2) return;

  jogos.push({
    date: data,
    competition: "Champions League",
    homeTeam: equipas[0].trim(),
    awayTeam: equipas[1].trim(),
    score: { home: null, away: null }
  });

});
    /* =======================
       ORDENAR E SEPARAR
    ======================== */

    jogos.sort((a,b) => new Date(a.date) - new Date(b.date));

    const porJogar = jogos.filter(j => new Date(j.date) >= agora);
    const jogados = jogos.filter(j => 
      new Date(j.date) < agora &&
      j.score.home !== null
    );

    /* =======================
       ESTATÍSTICAS
    ======================== */

    let vitorias = 0;
    let empates = 0;
    let derrotas = 0;
    let golosMarcados = 0;
    let golosSofridos = 0;

    jogados.forEach(j => {

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

    res.status(500).json({ error: "Erro ao carregar jogos" });

  }
}
