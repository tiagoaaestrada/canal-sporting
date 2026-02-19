module.exports = async (req, res) => {
  try {

    // Buscar página da edição do dia
    const coverResponse = await fetch(
      "https://www.abola.pt/edicao-do-dia",
      { headers: { "User-Agent": "Mozilla/5.0" } }
    );

    const html = await coverResponse.text();

    // Procurar imagem da capa (ajustável se necessário)
    const match = html.match(/https:\/\/cdn\.abola\.pt\/images\/[^"]+\.jpg/);

    let cover = "/abola.png";

    if (match) {
      cover = match[0];
    }

    // RSS notícias
    const newsResponse = await fetch(
      "https://news.google.com/rss/search?q=Sporting+site:abola.pt&hl=pt-PT&gl=PT&ceid=PT:pt",
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
      coverLink: "https://www.abola.pt/edicao-do-dia",
      news
    });

  } catch (error) {
    res.status(200).json({
      cover: "/abola.png",
      coverLink: "https://www.abola.pt/",
      news: []
    });
  }
};
