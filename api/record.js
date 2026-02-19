module.exports = async (req, res) => {
  try {
    const response = await fetch("https://www.record.pt/rss/sporting", {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    const xml = await response.text();

    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];

    if (items.length === 0) {
      return res.status(200).json({
        cover: "/record.png",
        news: []
      });
    }

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
