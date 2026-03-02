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

        /* ===== EXTRAÇÃO MELHORADA ===== */

        let playerName = null;
        let fromClub = null;
        let toClub = "Sporting CP";

        const stopWords = [
          "Sporting","Liga","Transferência","Transferências","Mercado",
          "Diretor","Negócios","Fecho","Se","As","Janela"
        ];

        let match = title.match(/por\s+([A-ZÁÉÍÓÚÂÊÔÃÕÇ][a-záéíóúâêôãõç]+(?:\s[A-ZÁÉÍÓÚÂÊÔÃÕÇ][a-záéíóúâêôãõç]+)?)/);

        if (match && !stopWords.includes(match[1])) {
          playerName = match[1];
        }

        if (!playerName) {
          match = title.match(/de\s+([A-ZÁÉÍÓÚÂÊÔÃÕÇ][a-záéíóúâêôãõç]+(?:\s[A-ZÁÉÍÓÚÂÊÔÃÕÇ][a-záéíóúâêôãõç]+)?)/);
          if (match && !stopWords.includes(match[1])) {
            playerName = match[1];
          }
        }

        if (!playerName) {
          match = title.match(/^([A-ZÁÉÍÓÚÂÊÔÃÕÇ][a-záéíóúâêôãõç]+(?:\s[A-ZÁÉÍÓÚÂÊÔÃÕÇ][a-záéíóúâêôãõç]+)?)/);
          if (match && !stopWords.includes(match[1])) {
            playerName = match[1];
          }
        }

        const isSaida = title.toLowerCase().includes("vend") ||
                        title.toLowerCase().includes("sai") ||
                        title.toLowerCase().includes("rumo");

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

    } catch (error) {
      console.error(error);
      return [];
    }
  }

  res.status(200).json({
    sporting: await fetchRSS("Sporting transferência"),
    nacional: await fetchRSS("Liga Portugal transferência"),
    internacional: await fetchRSS("transferência internacional futebol")
  });

};
