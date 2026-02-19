export default async function handler(req, res) {
  try {
    const response = await fetch("https://www.record.pt/rss/futebol/sporting");
    const xml = await response.text();

    // Extrair o primeiro item
    const itemMatch = xml.match(/<item>([\s\S]*?)<\/item>/);

    if (!itemMatch) {
      return res.status(500).json({ error: "Sem notícias encontradas." });
    }

    const item = itemMatch[1];

    const titleMatch = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/);
    const linkMatch = item.match(/<link>(.*?)<\/link>/);

    if (!titleMatch || !linkMatch) {
      return res.status(500).json({ error: "Erro ao processar notícia." });
    }

    const title = titleMatch[1];
    const link = linkMatch[1];

    res.status(200).json({ title, link });

  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar notícia." });
  }
}
