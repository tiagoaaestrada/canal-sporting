export default async function handler(req, res) {
  try {

    const coverUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/O_Jogo_logo.svg/1200px-O_Jogo_logo.svg.png";
    const coverLink = "https://loja.ojogo.pt/edicao-do-dia";

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
      cover: coverUrl,
      coverLink,
      news
    });

  } catch (error) {
    res.status(200).json({
      cover: null,
      coverLink: "https://loja.ojogo.pt/edicao-do-dia",
      news: []
    });
  }
}
