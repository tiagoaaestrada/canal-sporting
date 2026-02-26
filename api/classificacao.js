export default async function handler(req, res) {
  try {
    const url =
      "https://www.ligaportugal.pt/competition/854/liga-portugal-betclic/round/20252026?tab=standings";

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "text/html"
      }
    });

    const html = await response.text();

    // Procurar todas as linhas da tabela
    const rowRegex = /<tr[^>]*>(.*?)<\/tr>/gs;
    const rows = [...html.matchAll(rowRegex)];

    const classificacao = [];

    for (const row of rows) {
      const cols = [...row[1].matchAll(/<t[dh][^>]*>(.*?)<\/t[dh]>/gs)]
        .map(c => c[1].replace(/<.*?>/g, "").trim())
        .filter(Boolean);

      // Precisamos de pelo menos 8 colunas numéricas
      if (cols.length < 8) continue;
      if (!/^\d+$/.test(cols[0])) continue;

      classificacao.push({
        position: parseInt(cols[0]),
        team: cols[1],
        played: parseInt(cols[2]),
        won: parseInt(cols[3]),
        draw: parseInt(cols[4]),
        lost: parseInt(cols[5]),
        goalDifference: parseInt(cols[6].replace("+","")),
        points: parseInt(cols[7])
      });
    }

    return res.status(200).json({
      "Primeira Liga": classificacao
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Erro ao obter classificação"
    });
  }
}
