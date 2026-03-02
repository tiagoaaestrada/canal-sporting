module.exports = async (req, res) => {

  async function fetchRSS(query, tipoPadrao = "entrada") {
    try {
      const response = await fetch(
        `https://news.google.com/rss/search?q=${query}&hl=pt-PT&gl=PT&ceid=PT:pt`,
        { headers: { "User-Agent": "Mozilla/5.0" } }
      );

      const xml = await response.text();
      const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];

      return items.slice(0,5).map(item => {

        const rawTitle = item[1].match(/<title>(.*?)<\/title>/)?.[1] || "";
        const cleanTitle = rawTitle.replace(/<!\[CDATA\[|\]\]>/g, "");
        const link = item[1].match(/<link>(.*?)<\/link>/)?.[1] || "#";
        const pubDate = item[1].match(/<pubDate>(.*?)<\/pubDate>/)?.[1];

        const dateObj = pubDate ? new Date(pubDate) : null;

        const formattedDate = dateObj
          ? dateObj.toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit" }) +
            " - " +
            dateObj.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })
          : "";

        /* ================= EXTRAÇÃO SIMPLES ================= */

        // Tenta extrair primeiro nome como jogador
        const playerMatch = cleanTitle.match(/^([A-ZÁÉÍÓÚÂÊÔÃÕÇ][a-záéíóúâêôãõç]+(?:\s[A-ZÁÉÍÓÚÂÊÔÃÕÇ][a-záéíóúâêôãõç]+)*)/);
        const playerName = playerMatch ? playerMatch[1] : null;

        // Detectar tipo (entrada ou saída)
        const tipo = cleanTitle.toLowerCase().includes("sai")
          ? "saida"
          : tipoPadrao;

        // Status (muito simples)
        const status = cleanTitle.toLowerCase().includes("oficial")
          ? "oficial"
          : "rumor";

        return {
          title: cleanTitle,
          link,
          formattedDate,

          // NOVOS CAMPOS
          playerName,
          fromClub: null,
          toClub: "Sporting CP",
          type: tipo,
          status: status,

          playerPhoto: null,
          fromLogo: null,
          toLogo: null
        };
      });

    } catch {
      return [];
    }
  }

  res.status(200).json({
    sporting: await fetchRSS("Sporting transferência", "entrada"),
    nacional: await fetchRSS("Liga Portugal transferência"),
    internacional: await fetchRSS("transferência internacional futebol")
  });
};
