module.exports = async (req, res) => {
  try {
    const response = await fetch(
      "https://www.vercapas.com/capa/o-jogo.html",
      { headers: { "User-Agent": "Mozilla/5.0" } }
    );

    const html = await response.text();

    // Procurar caminho relativo da imagem
    const match = html.match(/\/storage\/capas\/o-jogo\/[^"]+\.jpg/);

    let cover = "/ojogo.png";

    if (match) {
      cover = "https://www.vercapas.com" + match[0];
    }

    // Notícias via RSS
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
      coverLink: "https://loja.ojogo.pt/edicao-do-dia",
      news
    });

  } catch (error) {
    res.status(200).json({
      cover: "/ojogo.png",
      coverLink: "https://loja.ojogo.pt/edicao-do-dia",
      news: []
    });
  }
};
