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

    // Testar apenas títulos de links
    const titles = [];

    $("a").each((i, el) => {
      const text = $(el).text().trim();
      if (text.length > 20 && text.length < 120) {
        titles.push(text);
      }
    });

    return res.status(200).json(titles.slice(0, 30));

  } catch (error) {
    return res.status(500).json({
      error: "Debug failed",
      details: error.message,
    });
  }
}