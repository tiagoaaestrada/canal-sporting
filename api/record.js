module.exports = async (req, res) => {
  try {
    const response = await fetch("https://www.record.pt/rss/sporting");
    const xml = await response.text();

    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];

    const news = items.slice(0, 3).map(item => {
      const titleMatch = item[1].match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/);
      const linkMatch = item[1].match(/<link>(.*?)<\/link>/);

      return {
        title: titleMatch ? titleMatch[1] : "Sem título",
        link: linkMatch ? linkMatch[1] : "#"
      };
    });

    res.status(200).json({
      cover: "/record.png", // usa a tua imagem estável
      news
    });

  } catch (error) {
    res.status(500).json({
      cover: "/record.png",
      news: []
    });
  }
};
