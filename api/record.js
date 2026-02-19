module.exports = async (req, res) => {
  try {
    // Buscar página das capas
    const coverResponse = await fetch("https://www.record.pt/capas", {
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    const html = await coverResponse.text();

    // Procurar imagem da capa
    const match = html.match(/img_80x100uu([^"]+)\.jpg/);

    let cover = "/record.png";

    if (match) {
      const imageId = match[1];

      // Construir versão grande
      cover = `https://cdn.record.pt/images/2026-02/img_1200x1200uu${imageId}.jpg`;
    }

    // NOTÍCIAS via Google RSS
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
      coverLink: "https://www.record.pt/capas",
      news: []
    });
  }
};
