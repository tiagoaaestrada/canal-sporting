module.exports = async (req, res) => {

  const sources = [
    { name: "Record", url: "https://news.google.com/rss/search?q=Sporting+site:record.pt&hl=pt-PT&gl=PT&ceid=PT:pt" },
    { name: "A Bola", url: "https://news.google.com/rss/search?q=Sporting+site:abola.pt&hl=pt-PT&gl=PT&ceid=PT:pt" },
    { name: "O Jogo", url: "https://news.google.com/rss/search?q=Sporting+site:ojogo.pt&hl=pt-PT&gl=PT&ceid=PT:pt" },
    { name: "Mais Futebol", url: "https://news.google.com/rss/search?q=Sporting+site:maisfutebol.iol.pt&hl=pt-PT&gl=PT&ceid=PT:pt" }
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
        const titleMatch = item[1].match(/<title>(.*?)<\/title>/);
        const linkMatch = item[1].match(/<link>(.*?)<\/link>/);
        const pubDateMatch = item[1].match(/<pubDate>(.*?)<\/pubDate>/);

        if (titleMatch && linkMatch && pubDateMatch) {

          const rawDate = new Date(pubDateMatch[1]);

          const formattedDate =
            rawDate.toLocaleDateString("pt-PT", {
              day: "2-digit",
              month: "2-digit"
            }) +
            " - " +
            rawDate.toLocaleTimeString("pt-PT", {
              hour: "2-digit",
              minute: "2-digit"
            });

          allNews.push({
            title: titleMatch[1].replace(/<!\[CDATA\[|\]\]>/g, ""),
            link: linkMatch[1],
            source: source.name,
            date: rawDate.getTime(), // para ordenar corretamente
            formattedDate
          });
        }
      });

    } catch (err) {
      console.error("Erro feed:", source.name);
    }
  }

  // 🔥 ORDENAR POR DATA REAL (mais recente primeiro)
  allNews.sort((a, b) => b.date - a.date);

  res.status(200).json(allNews.slice(0, 20));
};
