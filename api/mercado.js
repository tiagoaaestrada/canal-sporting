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

        resultados.push({
          title: text,
          link: "https://www.transfermarkt.pt" + $(el).attr("href"),
          formattedDate: "",
          playerName: "Jogador do Sporting",
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