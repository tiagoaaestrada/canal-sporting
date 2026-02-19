module.exports = async (req, res) => {
  try {
    // CAPA O JOGO
    const coverResponse = await fetch("https://www.ojogo.pt/capas", {
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    const html = await coverResponse.text();

    const match = html.match(/img.*?src="([^"]+)"[^>]*capa/i);

    let cover = "/ojogo.png";

    if (match) {
      cover = match[1];
      if (!cover.startsWith("http")) {
        cover = "https://www.ojogo.pt" + cover;
      }
    }

    // NOTÍCIAS
    const newsResponse = await fetch(
      "https://news.google.com/rss/search?q=Sporting+site:ojogo.pt&hl=pt-PT&gl=PT&ceid=PT:pt",
      { headers: { "User-Agent": "Mozilla/5.0" } }
    );

    const xml = await newsResponse.text();
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];

    const news = items.slice(0, 3).map(item => {
      const titleMatch = item[1].match(/<title>(.*?)<\/title>/);
      const linkMatch = item[1].match(/<link>(.*?)<\/link>/);

      return {
        title: titleMatch ? titleMatch[1].replace(/<!\[CDATA\[|\]\]>/g, "") : "Sem título",
        link: linkMatch ? linkMatch[1] : "#"
      };
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
