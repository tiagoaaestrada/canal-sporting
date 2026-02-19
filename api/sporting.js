export default async function handler(req, res) {
  try {
    const response = await fetch(
      "https://news.google.com/rss/search?q=Sporting+CP&hl=pt-PT&gl=PT&ceid=PT:pt"
    );

    const xml = await response.text();

    const itemMatch = xml.match(/<item>([\s\S]*?)<\/item>/);

    if (!itemMatch) {
      return res.status(404).json({ error: "Sem notícias encontradas." });
    }

    const item = itemMatch[1];

    const titleMatch = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/);
    const linkMatch = item.match(/<link>(.*?)<\/link>/);

    const title = titleMatch ? titleMatch[1] : "Sem título";
    const link = linkMatch ? linkMatch[1] : "#";

    res.status(200).json({ title, link });
  } catch (error) {
    res.status(500).json({ error: "Erro interno." });
  }
}
