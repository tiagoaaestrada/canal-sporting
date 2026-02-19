export default async function handler(req, res) {
  try {
    const rssUrl =
      "https://news.google.com/rss/search?q=Sporting+CP&hl=pt-PT&gl=PT&ceid=PT:pt";

    const response = await fetch(rssUrl);
    const text = await response.text();

    const titleMatch = text.match(/<title>(.*?)<\/title>/g);

    if (!titleMatch || titleMatch.length < 2) {
      return res.status(500).json({ error: "Sem notícias" });
    }

    const latestTitle = titleMatch[1]
      .replace("<title>", "")
      .replace("</title>", "");

    res.status(200).json({
      title: latestTitle,
    });
  } catch (error) {
    res.status(500).json({ error: "Erro ao carregar notícia." });
  }
}
