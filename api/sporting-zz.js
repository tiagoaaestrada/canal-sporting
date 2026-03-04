export default async function handler(req, res) {

  try {

    const url = "https://www.zerozero.pt/equipa/sporting/jogos";

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept-Language": "pt-PT,pt;q=0.9"
      }
    });

    const html = await response.text();

    const jogos = [];

    const linhas = html.split("<tr");

    for (const linha of linhas) {

      if (!linha.includes("Sporting")) continue;

      const equipas = linha.match(/title="([^"]+)\s+-\s+([^"]+)"/);

      if (!equipas) continue;

      const home = equipas[1];
      const away = equipas[2];

      const resultadoMatch = linha.match(/(\d+)\s*-\s*(\d+)/);

      let score = { home: null, away: null };

      if (resultadoMatch) {
        score = {
          home: parseInt(resultadoMatch[1]),
          away: parseInt(resultadoMatch[2])
        };
      }

      jogos.push({
        homeTeam: home,
        awayTeam: away,
        score
      });

    }

    res.status(200).json({ jogos });

  } catch (err) {

    res.status(500).json({
      error: "Erro ao carregar jogos",
      detalhe: err.message
    });

  }

}
