export default async function handler(req, res) {
  try {
    const rssUrl = "https://www.record.pt/rss/futebol/futebol-nacional/liga-betclic/sporting";

    const response = await fetch(rssUrl);
    const text = await response.text();

    const items = text.match(/<item>([\s\S]*?)<\/item>/);

    if (!items) {
      return res.status(200).json({ error: "Sem notícias encontradas." });
    }

    const titleMatch = items[0].match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/);
    const linkMatch = items[0].match(/<link>(.*?)<\/link>/);

    const title = titleMatch ? titleMatch[1] : "Sem título";
    const link = linkMatch ? linkMatch[1] : "#";

    res.status(200).json({
      title,
      link
    });

  } catch (error) {
    res.status(500).json({ error: "Erro a obter RSS." });
  }
}
