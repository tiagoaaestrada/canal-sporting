export default async function handler(req, res) {
  try {
    // CAPA (url direta)
    const cover = "https://cdn.abola.pt/images/2026-02/abola_capa.jpg";
    const coverLink = "https://www.abola.pt/";

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
      coverLink,
      news
    });

  } catch (error) {
    res.status(200).json({
      cover: "/abola.png",
      coverLink: "https://www.abola.pt/",
      news: []
    });
  }
}
