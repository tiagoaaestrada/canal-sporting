module.exports = async (req, res) => {

  async function fetchRSS(query) {
    const response = await fetch(
      `https://news.google.com/rss/search?q=${query}&hl=pt-PT&gl=PT&ceid=PT:pt`,
      { headers: { "User-Agent": "Mozilla/5.0" } }
    );

    const xml = await response.text();
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];

    return items.slice(0,5).map(item => {
      const title = item[1].match(/<title>(.*?)<\/title>/)?.[1] || "";
      const link = item[1].match(/<link>(.*?)<\/link>/)?.[1] || "#";
      return { title, link };
    });
  }

  res.status(200).json({
    sporting: await fetchRSS("Sporting mercado transferências"),
    nacional: await fetchRSS("Liga Portugal mercado transferências"),
    internacional: await fetchRSS("mercado transferências internacional futebol")
  });
};
