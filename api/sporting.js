module.exports = async (req, res) => {
  try {
    const rssUrl =
      "https://news.google.com/rss/search?q=Sporting+CP+site:record.pt&hl=pt-PT&gl=PT&ceid=PT:pt";

    const response = await fetch(rssUrl);
    const xml = await response.text();

    const itemMatch = xml.match(/<item>([\s\S]*?)<\/item>/);

    if (!itemMatch) {
      return res.status(404).json({ error: "Sem notícias encontradas." });
    }

    const item = itemMatch[1];

    const titleMatch = item.match(/<title>(.*?)<\/title>/);
    const linkMatch = item.match(/<link>(.*?)<\/link>/);

    const title = titleMatch ? titleMatch[1] : "Sem título";
    const link = linkMatch ? linkMatch[1] : "#";

    res.status(200).json({ title, link });

  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar notícia." });
  }
};
