module.exports = async (req, res) => {

  function simplifyTitle(title) {
    // Remove coisas entre pipes e partes longas
    title = title.split("|")[0];

    // Remove expressões desnecessárias
    title = title
      .replace(/oficialmente|confirmado|segundo.*|revela.*|garante.*/i, "")
      .trim();

    // Limita tamanho
    if (title.length > 70) {
      title = title.substring(0, 67) + "...";
    }

    return title;
  }

  async function fetchRSS(query) {
    try {
      const response = await fetch(
        `https://news.google.com/rss/search?q=${query}&hl=pt-PT&gl=PT&ceid=PT:pt`,
        { headers: { "User-Agent": "Mozilla/5.0" } }
      );

      const xml = await response.text();
      const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];

      return items.slice(0, 5).map(item => {
        const rawTitle = item[1].match(/<title>(.*?)<\/title>/)?.[1] || "";
        const link = item[1].match(/<link>(.*?)<\/link>/)?.[1] || "#";

        const cleanTitle = rawTitle.replace(/<!\[CDATA\[|\]\]>/g, "");
        const shortTitle = simplifyTitle(cleanTitle);

        return { title: shortTitle, link };
      });

    } catch {
      return [];
    }
  }

  res.status(200).json({
    sporting: await fetchRSS("Sporting mercado transferências"),
    nacional: await fetchRSS("Liga Portugal mercado transferências"),
    internacional: await fetchRSS("mercado transferências internacional futebol")
  });
};
