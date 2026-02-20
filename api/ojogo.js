module.exports = async (req, res) => {
  try {
    const baseUrl = "https://www.vercapas.com/storage/capas/o-jogo/";

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const formatDate = (date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}.jpg`;
    };

    const todayUrl = baseUrl + formatDate(today);
    const yesterdayUrl = baseUrl + formatDate(yesterday);

    // Testar se imagem de hoje existe
    let cover = todayUrl;

    const testToday = await fetch(todayUrl, { method: "HEAD" });

    if (!testToday.ok) {
      // Se não existir, usar ontem
      cover = yesterdayUrl;
    }

    // Notícias
    const newsResponse = await fetch(
      "https://news.google.com/rss/search?q=Sporting+site:ojogo.pt&hl=pt-PT&gl=PT&ceid=PT:pt",
      { headers: { "User-Agent": "Mozilla/5.0" } }
    );

    const xml = await newsResponse.text();
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];

    const news = items.slice(0, 3).map(item => {
      const titleMatch = item[1].match(/<title>(.*?)<\/title>/);
      const linkMatch = item[1].match(/<link>(.*?)<\/link>/);

      const title = titleMatch
        ? titleMatch[1].replace(/<!\[CDATA\[|\]\]>/g, "")
        : "Sem título";

      const link = linkMatch ? linkMatch[1] : "#";

      return { title, link };
    });

    res.status(200).json({
      cover,
      coverLink: "https://loja.ojogo.pt/edicao-do-dia",
      news
    });

  } catch (error) {
    res.status(200).json({
      cover: "/ojogo.png",
      coverLink: "https://loja.ojogo.pt/edicao-do-dia",
      news: []
    });
  }
};
