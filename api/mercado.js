module.exports = async (req, res) => {

  async function isFootballer(name) {
    try {
      const r = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`
      );
      if (!r.ok) return false;

      const d = await r.json();
      if (!d.extract) return false;

      return d.extract.toLowerCase().includes("footballer");
    } catch {
      return false;
    }
  }

  async function fetchRSS(query) {
    try {

      const response = await fetch(
        `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=pt-PT&gl=PT&ceid=PT:pt`,
        { headers: { "User-Agent": "Mozilla/5.0" } }
      );

      const xml = await response.text();
      const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];

      const results = [];

      for (const item of items.slice(0, 8)) {

        const rawTitle = item[1].match(/<title>(.*?)<\/title>/)?.[1] || "";
        const link = item[1].match(/<link>(.*?)<\/link>/)?.[1] || "#";
        const pubDate = item[1].match(/<pubDate>(.*?)<\/pubDate>/)?.[1];

        const title = rawTitle.replace(/<!\[CDATA\[|\]\]>/g, "");
        const lower = title.toLowerCase();

        if (!lower.includes("sporting")) continue;

        const pub = pubDate ? new Date(pubDate) : null;
        const formattedDate = pub
          ? pub.toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit" }) +
            " - " +
            pub.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })
          : "";

        // Extrair possível jogador (2 palavras com maiúscula)
        const nameMatch = title.match(/([A-ZÁÉÍÓÚÂÊÔÃÕÇ][\p{L}]+(?:\s[A-ZÁÉÍÓÚÂÊÔÃÕÇ][\p{L}]+)?)/u);
        if (!nameMatch) continue;

        const playerName = nameMatch[1];

        // Confirmar que é mesmo futebolista
        const validPlayer = await isFootballer(playerName);
        if (!validPlayer) continue;

        /* ========= DETETAR TIPO ========= */

        let type = "entrada";

        if (
          lower.includes("a receber") ||
          lower.includes("vend") ||
          lower.includes("venda") ||
          lower.includes("rumo a") ||
          lower.includes("para o arsenal") ||
          lower.includes("deixa o sporting")
        ) {
          type = "saida";
        }

        /* ========= DETETAR STATUS ========= */

        let status = "rumor";

        if (
          lower.includes("oficial") ||
          lower.includes("confirma") ||
          lower.includes("confirmado") ||
          lower.includes("assina") ||
          lower.includes("é reforço") ||
          lower.includes("contratado")
        ) {
          status = "oficial";
        }

        results.push({
          title,
          link,
          formattedDate,
          playerName,
          fromClub: type === "entrada" ? "?" : "Sporting Clube de Portugal",
          toClub: type === "entrada" ? "Sporting Clube de Portugal" : "?",
          type,
          status
        });
      }

      return results;

    } catch (error) {
      console.error(error);
      return [];
    }
  }

  res.status(200).json({
    sporting: await fetchRSS("Sporting transferência"),
    nacional: await fetchRSS("Sporting mercado"),
    internacional: await fetchRSS("Sporting internacional transferência")
  });

};
