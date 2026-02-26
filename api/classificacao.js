export default async function handler(req, res) {
  try {
    const url =
      "https://www.ligaportugal.pt/api/v2/competition/standings?competition=ligaportugalbetclic&season=20252026&round=24";

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    const data = await response.json();

    // DEVOLVE TUDO PARA INSPECIONAR
    res.status(200).json(data);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
