export default async function handler(req, res) {

  const url = "https://www.zerozero.pt/equipa/sporting/jogos";

  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Accept-Language": "pt-PT,pt;q=0.9"
    }
  });

  const html = await response.text();

  res.status(200).json({
    length: html.length,
    preview: html.slice(0, 2000)
  });

}
