module.exports = async (req, res) => {
  const rss = "https://news.google.com/rss/search?q=Sporting+CP+site:abola.pt&hl=pt-PT&gl=PT&ceid=PT:pt";

  const response = await fetch(rss);
  const text = await response.text();

  const items = text.match(/<item>(.*?)<\/item>/gs);

  if (!items) {
    return res.status(500).json({ error: "Sem notícias A Bola." });
  }

  const noticias = items.slice(0, 5).map(item => {
    const title = item.match(/<title>(.*?)<\/title>/)?.[1];
    const link = item.match(/<link>(.*?)<\/link>/)?.[1];
    return { title, link };
  });

  res.status(200).json(noticias);
};
