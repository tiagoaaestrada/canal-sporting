module.exports = async (req, res) => {
  try {
    // CAPA
    const response = await fetch(
      "https://www.vercapas.com/capa/record.html",
      { headers: { "User-Agent": "Mozilla/5.0" } }
    );

    const html = await response.text();

    const match = html.match(
      /https:\/\/imgs\.vercapas\.com\/covers\/record\/[^"]+\.(webp|jpg)/
    );

    let cover = "/record.png";

    if (match && match[0]) {
      cover = match[0];
    }

    // NOTÍCIAS
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
      coverLink: "https://www.record.pt/capas",
      news
    });

  } catch (error) {
    res.status(200).json({
      cover: "/record.png",
      coverLink: "https://loja.record.pt/edicao-do-dia",
      news: []
    });
  }
};
