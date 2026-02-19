export default async function handler(req, res) {
  try {
    const response = await fetch("https://www.record.pt/rss/futebol/sporting");
    const xml = await response.text();

    const titleMatch = xml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/);

    if (!titleMatch) {
      return res.status(500).json({ error: "Notícia não encontrada" });
    }

    const title = titleMatch[1];

    res.status(200).json({ title });
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar notícia" });
  }
}
