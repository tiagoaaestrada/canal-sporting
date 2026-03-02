module.exports = async (req, res) => {

  async function fetchRSS(query) {
    try {
      const response = await fetch(
        `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=pt-PT&gl=PT&ceid=PT:pt`,
        { headers: { "User-Agent": "Mozilla/5.0" } }
      );

      const xml = await response.text();
      const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];

      return items.slice(0,5).map(item => {

        const rawTitle = item[1].match(/<title>(.*?)<\/title>/)?.[1] || "";
        const link = item[1].match(/<link>(.*?)<\/link>/)?.[1] || "#";
        const pubDate = item[1].match(/<pubDate>(.*?)<\/pubDate>/)?.[1];

        const dateObj = pubDate ? new Date(pubDate) : null;

        const formattedDate = dateObj
          ? dateObj.toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit" }) +
            " - " +
            dateObj.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })
          : "";

        const title = rawTitle.replace(/<!\[CDATA\[|\]\]>/g, "");

        /* ===== EXTRAÇÃO INTELIGENTE ===== */

        let playerName = null;
        let fromClub = null;
        let toClub = null;

        // Detectar jogador (palavras com maiúscula seguidas)
        const playerMatch = title.match(/([A-ZÁÉÍÓÚÂÊÔÃÕÇ][a-záéíóúâêôãõç]+(?:\s[A-ZÁÉÍÓÚÂÊÔÃÕÇ][a-záéíóúâêôãõç]+)?)/);
        if (playerMatch) {
          playerName = playerMatch[1];
        }

        // Detectar saída
        const isSaida = title.toLowerCase().includes("vend") ||
                        title.toLowerCase().includes("sai") ||
                        title.toLowerCase().includes("rumo") ||
                        title.toLowerCase().includes("arsenal") ||
                        title.toLowerCase().includes("manchester");

        // Sporting como destino padrão
        toClub = "Sporting CP";

        return {
          title,
          link,
          formattedDate,
          playerName,
          fromClub,
          toClub,
          type: isSaida ? "saida" : "entrada",
          status: "rumor"
        };

      });

    } catch {
      return [];
    }
  }

  res.status(200).json({
    sporting: await fetchRSS("Sporting transferência"),
    nacional: await fetchRSS("Liga Portugal transferência"),
    internacional: await fetchRSS("transferência internacional futebol")
  });

};
