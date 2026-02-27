export default async function handler(req, res) {

  try {

    const url = "https://www.zerozero.pt/equipa/sporting/16/jogos?epoca_id=155"; 
    // epoca_id=155 normalmente é 2025/2026 (ajustamos se necessário)

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "text/html"
      }
    });

    const html = await response.text();

    const jogos = [];

    // Procurar apenas linhas de jogos da Taça
    const regex = /Taça de Portugal|Taça da Liga/gi;

    if (!regex.test(html)) {
      return res.status(200).json({ jogos: [] });
    }

    const linhas = html.split("\n");

    linhas.forEach(l => {

      if (
        l.includes("Taça de Portugal") ||
        l.includes("Taça da Liga")
      ) {

        // Extração muito simples (ajustamos depois se preciso)
        const dataMatch = l.match(/\d{2}-\d{2}-\d{4}/);
        const equipasMatch = l.match(/Sporting.*?-.*?</);

        if (dataMatch && equipasMatch) {

          const equipasTexto = equipasMatch[0]
            .replace("<", "")
            .trim();

          const partes = equipasTexto.split(" - ");

          jogos.push({
            date: new Date(dataMatch[0].split("-").reverse().join("-")),
            competition: "Taça",
            homeTeam: partes[0],
            awayTeam: partes[1],
            score: { home: null, away: null }
          });

        }

      }

    });

    res.status(200).json({ jogos });

  } catch (error) {

    res.status(500).json({
      error: "Erro ao carregar Taças ZeroZero",
      detalhe: error.message
    });

  }
}
