module.exports = async (req, res) => {
  try {
    const response = await fetch("https://www.record.pt/rss/sporting");
    const xml = await response.text();

    // =============================
    // CAPA DO DIA
    // =============================
    const coverPage = await fetch("https://www.record.pt/capas");
    const coverHtml = await coverPage.text();

    const coverMatch = coverHtml.match(/(https:\/\/cdn\.record\.pt\/images\/\d{4}-\d{2}\/img_.*?\.jpg)/);

    let cover = null;

    if (coverMatch) {
      cover = coverMatch[1];

      // substituir thumbnail por versão grande
      cover = cover.replace("80x100", "748x933");
    }

    // =============================
    // NOTÍCIAS (RSS)
    // =============================
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];

    const news = items.slice(0, 3).map(item => {
      const titleMatch = item[1].match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/);
      const linkMatch = item[1].match(/<link>(.*?)<\/link>/);

      return {
        title: titleMatch ? titleMatch[1] : "Sem título",
        link: linkMatch ? linkMatch[1] : "#"
      };
    });

    res.status(200).json({
      cover,
      news
    });

  } catch (error) {
    res.status(500).json({ error: "Erro ao carregar Record." });
  }
};
