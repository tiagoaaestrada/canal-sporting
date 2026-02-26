// api/sporting.js

export default async function handler(req, res) {
  try {

    const url = "https://www.zerozero.pt/equipa/sporting/jogos?grp=1&epoca_id=155";

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "text/html"
      }
    });

    const html = await response.text();

    if (!html.includes("Sporting")) {
      return res.status(500).json({ error: "Zerozero bloqueou o request ou HTML inválido" });
    }

    const rows = [...html.matchAll(/<tr[^>]+class="(?:odd|even)"[^>]*>([\s\S]*?)<\/tr>/g)];

    const jogos = [];

    for (const r of rows) {
      const row = r[1];

      const dateMatch = row.match(/(\d{2}\/\d{2}\/\d{2}\s+\d{2}:\d{2})/);
      const compMatch = row.match(/<span[^>]*class="comp"[^>]*>(.*?)<\/span>/);

      const teams = [...row.matchAll(/<a[^>]*>(.*?)<\/a>/g)].map(m => m[1]);

      if (!dateMatch || teams.length < 2) continue;

      const dateRaw = dateMatch[1];
      const [DD, MM, YY, HM] = dateRaw.match(/(\d{2})\/(\d{2})\/(\d{2})\s+(\d{2}:\d{2})/).slice(1);

      const isoDate = `20${YY}-${MM}-${DD}T${HM}:00Z`;

      let scoreHome = null;
      let scoreAway = null;

      const scoreMatch = row.match(/(\d+)\s*-\s*(\d+)/);
      if (scoreMatch) {
        scoreHome = parseInt(scoreMatch[1]);
        scoreAway = parseInt(scoreMatch[2]);
      }

      jogos.push({
        date: isoDate,
        competition: compMatch?.[1] || "",
        homeTeam: teams[0],
        awayTeam: teams[1],
        score: { home: scoreHome, away: scoreAway },
        status: scoreHome === null ? "scheduled" : "finished"
      });
    }

    jogos.sort((a,b)=> new Date(a.date) - new Date(b.date));

    res.status(200).json({
      todos: jogos,
      porJogar: jogos.filter(j=>j.status==="scheduled"),
      jogados: jogos.filter(j=>j.status==="finished")
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
