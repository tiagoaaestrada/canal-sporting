module.exports = async (req, res) => {
  try {
    const rssUrl = "https://rsshub.app/twitter/user/SportingCP";

    const response = await fetch(rssUrl);
    const xml = await response.text();

    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];

    const news = items.slice(0, 5).map(item => {
      const title = item[1].match(/<title>(.*?)<\/title>/)?.[1] || "";
      const link = item[1].match(/<link>(.*?)<\/link>/)?.[1] || "#";

      return { title, link };
    });

    res.status(200).json({
      cover: "/x.png",
      coverLink: "https://x.com/SportingCP",
      news
    });

  } catch (error) {
    res.status(200).json({
      cover: "/x.png",
      coverLink: "https://x.com/SportingCP",
      news: []
    });
  }
};
