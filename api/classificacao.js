export default async function handler(req, res) {
  try {
    const url = "https://www.ligaportugal.pt/competition/854/liga-portugal-betclic/round/20252026?tab=standings";

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "text/html"
      }
    });

    const html = await response.text();

    // Procurar a tabela dentro do HTML
    const tableMatch = html.match(/<table[^>]*class="table table-[^"]*"[^>]*>([\s\S]*?)<\/table>/i);

    if (!tableMatch) {
      return res.status(500).json({ error: "Não encontrei tabela de classificação" });
    }

    const tableHtml = tableMatch[1];

    // Extrair as linhas da tabela
    const rows = [...tableHtml.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];

    const classificacao = [];

    for (const row of rows) {
      const cols = [...row[1].matchAll(/<t[dh][^>]*>(.*?)<\/t[dh]>/gi)].map(c => c[1].trim());

      // Pular cabeçalhos e linhas inválidas
      if (cols.length < 7 || !/^\d+$/.test(cols[0])) continue;

      const position = parseInt(cols[0]);
      const team = cols[1].replace(/<.*?>/g, "").trim();
      const played = parseInt(cols[2]);
      const won = parseInt(cols[3]);
      const draw = parseInt(cols[4]);
      const lost = parseInt(cols[5]);
      const diff = parseInt(cols[6].replace(/[^0-9-]/g, "").trim());
      const points = parseInt(cols[cols.length - 1].replace(/[^0-9]/g, "").trim());

      classificacao.push({
        position,
        team,
        played,
        won,
        draw,
        lost,
        goalDifference: diff,
        points
      });
    }

    res.status(200).json({
      "Primeira Liga": classificacao
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
