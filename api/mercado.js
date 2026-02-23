module.exports = async (req, res) => {

  function formatTransfer(title) {
    // Remove fonte no final
    title = title.split("|")[0].trim();

    // Tentar capturar valores tipo 20M, 5 milhões, etc.
    const valueMatch = title.match(/(\d+\s?M|milhões?|\d+\s?milhões?)/i);
    const value = valueMatch ? valueMatch[0] : "";

    // Simplificação básica
    title = title
      .replace(/oficial|confirmado|segundo.*|revela.*|garante.*/i, "")
      .replace(/\s+/g, " ")
      .trim();

    // Limitar tamanho
    if (title.length > 80) {
      title = title.substring(0, 77) + "...";
    }

    return value ? `${title} (${value})` : title;
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
        const shortTitle = formatTransfer(cleanTitle);

        return { title: shortTitle, link };
      });

    } catch {
      return [];
    }
  }

  res.status(200).json({
    sporting: await fetchRSS("Sporting transferência confirmado"),
    nacional: await fetchRSS("Liga Portugal transferência confirmado"),
    internacional: await fetchRSS("transferência internacional confirmado futebol")
  });
};
