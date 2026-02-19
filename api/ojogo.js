export default async function handler(req, res) {
  try {
    const response = await fetch(
      "https://news.google.com/rss/search?q=Sporting+site:ojogo.pt&hl=pt-PT&gl=PT&ceid=PT:pt"
    );

    const xml = await response.text();

    const cover = "https://www.ojogo.pt/assets/img/ojogo-logo.png";

    const news = [];

    const items = xml.split("<item>").slice(0, 4);

    items.forEach(item => {
      const title = item.split("<title>")[1]?.split("</title>")[0] || "Sem título";
      const link = item.split("<link>")[1]?.split("</link>")[0] || "#";

      news.push({ title, link });
    });

    res.status(200).json({ cover, news });

  } catch (error) {
    res.status(500).json({ error: "Erro O Jogo" });
  }
}
