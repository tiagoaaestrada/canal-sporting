module.exports = async (req, res) => {
  try {
    const newsResponse = await fetch(
      "https://news.google.com/rss/search?q=Sporting+site:abola.pt&hl=pt-PT&gl=PT&ceid=PT:pt",
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
      cover: "/abola.png",
      news
    });

  } catch (error) {
    res.status(200).json({
      cover: "/abola.png",
      news: []
    });
  }
};
