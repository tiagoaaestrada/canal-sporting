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
      const title = item[1].match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/);
      const link = item[1].match(/<link>(.*?)<\/link>/);

      return {
        title: title ? title[1] : "Sem título",
        link: link ? link[1] : "#"
      };
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
