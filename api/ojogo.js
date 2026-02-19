module.exports = async (req, res) => {
  try {
    // Buscar página das capas
    const coverResponse = await fetch("https://loja.ojogo.pt/edicao-do-dia", {
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    const html = await coverResponse.text();

    // Procurar imagem da capa
    const match = html.match(/img_80x100uu([^"]+)\.jpg/);

    let cover = "/ojogo.png";

    if (match) {
      const imageId = match[1];

      // Construir versão grande
      cover = `https://staticx.noticiasilimitadas.pt/image.webp?brand=oj&type=generate&guid=ca645ba2-8ed8-4c2c-bc77-2dd9a131cd57.jpg`;
    }

    // NOTÍCIAS via Google RSS
    const newsResponse = await fetch(
      "https://news.google.com/rss/search?q=Sporting+site:ojogo.pt&hl=pt-PT&gl=PT&ceid=PT:pt",
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
      cover: "/ojogo.png",
      news: []
    });
  }
};
