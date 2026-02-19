module.exports = async (req, res) => {
  try {
    const response = await fetch(
      "https://news.google.com/rss/search?q=Sporting+site:record.pt&hl=pt-PT&gl=PT&ceid=PT:pt",
      {
        headers: { "User-Agent": "Mozilla/5.0" }
      }
    );

    const xml = await response.text();

    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];

    const news = items.slice(0, 3).map(item => {
      const titleMatch = item[1].match(/<title>(.*?)<\/title>/);
      const linkMatch = item[1].match(/<link>(.*?)<\/link>/);

      const title = titleMatch ? titleMatch[1].replace(/<!\[CDATA\[|\]\]>/g, "") : "Sem título";
      const link = linkMatch ? linkMatch[1] : "#";

      return { title, link };
    });

    res.status(200).json({
      cover: "/record.png",
      news
    });

  } catch (error) {
    res.status(200).json({
      cover: "/record.png",
      news: []
    });
  }
};
