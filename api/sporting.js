// api/sporting.js
// Scraping de jogos da época atual de Sporting CP (zerozero.pt)

import fetch from "node-fetch";

export default async function handler(req, res) {
  try {

    // URL da página de jogos do Sporting por época (zerozero.pt)
    const url = "https://www.zerozero.pt/equipa/sporting/jogos?grp=1&epoca_id=155";

    // Fetch HTML
    const pageRes = await fetch(url);
    const html = await pageRes.text();

    // ========================================
    // === Extrair linha por linha os jogos ===
    // ========================================

    // A tabela de jogos no zerozero tem este formato:
    // <tr class="odd/even">
    //   <td class="data">27/07/25 20:45</td>
    //   <td class="competicao">Liga Portugal Bwin</td>
    //   <td class="casa">Sporting Clube de Portugal</td>
    //   <td class="visitante">GD Estoril Praia</td>
    //   <td class="resultado">-</td>
    //   ...
    // </tr>

    // 1) Match all <tr ...> rows
    const rows = [...html.matchAll(/<tr[^>]+class="(?:odd|even)"[^>]*>([\s\S]*?)<\/tr>/g)];

    const jogos = [];

    for (const r of rows) {
      const rowHtml = r[1];

      // Data
      const dateMatch = rowHtml.match(/<td[^>]*class="data"[^>]*>(.*?)<\/td>/);
      const dateRaw = dateMatch?.[1]?.trim() || "";

      // Competition
      const compMatch = rowHtml.match(/<td[^>]*class="competicao"[^>]*>(.*?)<\/td>/);
      const competition = compMatch?.[1]?.trim() || "";

      // Home
      const homeMatch = rowHtml.match(/<td[^>]*class="casa"[^>]*>(.*?)<\/td>/);
      const homeTeam = homeMatch?.[1]?.trim() || "";

      // Away
      const awayMatch = rowHtml.match(/<td[^>]*class="visitante"[^>]*>(.*?)<\/td>/);
      const awayTeam = awayMatch?.[1]?.trim() || "";

      // Result (if exists)
      const resMatch = rowHtml.match(/<td[^>]*class="resultado"[^>]*>(.*?)<\/td>/);
      let scoreHome = null, scoreAway = null;
      if (resMatch && resMatch[1].includes("-") === false) {
        const parts = resMatch[1].trim().split("–");
        if (parts.length === 2) {
          scoreHome = parseInt(parts[0].trim());
          scoreAway = parseInt(parts[1].trim());
        }
      }

      // Normalizar data
      // zerozero usa formato "27/07/25 20:45"
      let isoDate = "";
      const dParts = dateRaw.match(/(\d{2})\/(\d{2})\/(\d{2})\s+(\d{2}:\d{2})/);
      if (dParts) {
        const DD = dParts[1], MM = dParts[2], YY = dParts[3], HM = dParts[4];
        isoDate = `20${YY}-${MM}-${DD}T${HM}:00Z`;
      }

      const status = (scoreHome === null ? "scheduled" : "finished");

      jogos.push({
        date: isoDate,
        competition,
        homeTeam,
        awayTeam,
        score: { home: scoreHome, away: scoreAway },
        status
      });
    }

    // Ordenar cronologicamente por data
    jogos.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Separar por jogar / jogados
    const porJogar = jogos.filter(j => j.status === "scheduled");
    const jogados = jogos.filter(j => j.status === "finished");

    // Resposta final
    res.status(200).json({
      todos: jogos,
      porJogar,
      jogados
    });

  } catch (error) {
    console.error("Erro no scraping /api/sporting:", error);
    res.status(500).json({ error: error.message });
  }
}
