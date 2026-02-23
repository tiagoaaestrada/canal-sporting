module.exports = async (req, res) => {

  const sources = [
    { name: "Record", url: "https://news.google.com/rss/search?q=Sporting+site:record.pt&hl=pt-PT&gl=PT&ceid=PT:pt" },
    { name: "A Bola", url: "https://news.google.com/rss/search?q=Sporting+site:abola.pt&hl=pt-PT&gl=PT&ceid=PT:pt" },
    { name: "O Jogo", url: "https://news.google.com/rss/search?q=Sporting+site:ojogo.pt&hl=pt-PT&gl=PT&ceid=PT:pt" },
    { name: "Mais Futebol", url: "https://news.google.com/rss/search?q=Sporting&hl=pt-PT&gl=PT&ceid=PT:pt" }
  ];

  let allNews = [];

  for (const source of sources) {
    try {
      const response = await fetch(source.url, {
        headers: { "User-Agent": "Mozilla/5.0" }
      });

      const xml = await response.text();
      const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];

      items.slice(0, 6).forEach(item => {

        const title = item[1].match(/<title>(.*?)<\/title>/)?.[1];
        const link = item[1].match(/<link>(.*?)<\/link>/)?.[1];
        const pubDate = item[1].match(/<pubDate>(.*?)<\/pubDate>/)?.[1];

        if (!title || !link || !pubDate) return;

        const dateObj = new Date(pubDate);

        allNews.push({
          title: title.replace(/<!\[CDATA\[|\]\]>/g, ""),
          link,
          source: source.name,
          timestamp: dateObj.getTime(),
          formattedDate:
            dateObj.toLocaleDateString("pt-PT", {
              day: "2-digit",
              month: "2-digit"
            }) +
            " - " +
            dateObj.toLocaleTimeString("pt-PT", {
              hour: "2-digit",
              minute: "2-digit"
            })
        });

      });

    } catch (err) {
      console.log("Erro em:", source.name);
    }
  }

  // ordenar por timestamp real
  allNews.sort((a, b) => b.timestamp - a.timestamp);

  res.status(200).json(allNews.slice(0, 20));
};
