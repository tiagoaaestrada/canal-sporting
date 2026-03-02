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

    if (!response.ok) {
      return res.status(500).json({ error: "Transfermarkt blocked request" });
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const resultados = [];

    $(".tm-community-thread-list__item").each((i, el) => {

      const title = $(el).find(".tm-title").text().trim();
      const link = $(el).find("a").attr("href");
      const date = $(el)
        .find(".tm-community-thread-list__date")
        .text()
        .trim();

      if (!title) return;

      // Extrair nome jogador (primeiras palavras antes de "-")
      const playerMatch = title.match(/^([^-]+)/);
      const playerName = playerMatch ? playerMatch[1].trim() : null;

      if (!playerName) return;

      const lower = title.toLowerCase();

      let type = "entrada";

      if (
        lower.includes("saida") ||
        lower.includes("deixa") ||
        lower.includes("rumo a")
      ) {
        type = "saida";
      }

      resultados.push({
        title,
        link: link
          ? `https://www.transfermarkt.pt${link}`
          : null,
        formattedDate: date,
        playerName,
        fromClub: type === "entrada" ? "?" : "Sporting Clube de Portugal",
        toClub: type === "entrada" ? "Sporting Clube de Portugal" : "?",
        type,
        status: "rumor"
      });
    });

    return res.status(200).json({
      sporting: resultados,
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
