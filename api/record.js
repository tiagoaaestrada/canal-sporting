module.exports = async (req, res) => {
  try {
    // CAPA DO DIA
    const coverResponse = await fetch("https://www.record.pt/capas", {
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    const coverHtml = await coverResponse.text();

    const coverMatch = coverHtml.match(/<img[^>]+src="([^"]+)"[^>]+capa/i);
    let cover = "/record.png";

    if (coverMatch) {
      cover = coverMatch[1];
      if (!cover.startsWith("http")) {
        cover = "https://www.record.pt" + cover;
      }
    }

    // NOTÍCIAS (Google RSS)
    const newsResponse = await fetch(
      "https://news.google.com/rss/search?q=Sporting+site:record.pt&hl=pt-PT&gl=PT&ceid=PT:pt",
      { headers: { "User-Agent": "Mozilla/5.0" } }
    );

    const xml = await newsResponse.text();
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];

    const news = items.slice(0, 3).map(item => {
      const titleMatch = item[1].match(/<title>(.*?)<\/title>/);
      const linkMatch = item[1].match(/<link>(.*?)<\/link>/);

      const title = titleMatch
        ? titleMatch[1].replace(/<!\[CDATA\[|\]\]>/g, "")
        : "Sem título";

      const link = linkMatch ? linkMatch[1] : "#";

      return { title, link };
    });

    res.status(200).json({
      cover,
      news
    });

  } catch (error) {
    res.status(200).json({
      cover: "/record.png",
      news: []
    });
  }
};
