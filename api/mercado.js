import fetch from "node-fetch";
import * as cheerio from "cheerio";

export default async function handler(req, res) {
  try {
    const url =
      "https://www.transfermarkt.pt/sala-de-rumores/detail/forum/154/gk_verein_id/336";

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
      },
    });

    const html = await response.text();
    const $ = cheerio.load(html);

    const resultados = [];

    $("a").each((i, el) => {
      const text = $(el).text().trim();

      if (text.startsWith("Transferência para o/a")) {
        const clubeMatch = text.match(/Transferência para o\/a (.*)\?/);
        const clubeDestino = clubeMatch ? clubeMatch[1].trim() : null;

        const href = $(el).attr("href");

// Extrair nome do jogador do slug
let playerName = null;

if (href) {
  const slugMatch = href.match(/\/([^\/]+)-\/thread/);

  if (slugMatch) {
    const slug = slugMatch[1];

    const parts = slug.split("-");

    // manter apenas primeiras 2 ou 3 palavras
    const nameParts = parts.slice(0, 3);

    playerName = nameParts
      .map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
      )
      .join(" ");
  }
}

resultados.push({
  title: text,
  link: "https://www.transfermarkt.pt" + href,
  formattedDate: "",
  playerName: playerName || "Desconhecido",
  fromClub: "Sporting Clube de Portugal",
  toClub: clubeDestino,
  type: "saida",
  status: "rumor"
});
      }
    });

    return res.status(200).json({
      sporting: resultados.slice(0, 10),
      nacional: [],
      internacional: []
    });

  } catch (error) {
    return res.status(500).json({
      error: "Scraping failed",
      details: error.message
    });
  }
}