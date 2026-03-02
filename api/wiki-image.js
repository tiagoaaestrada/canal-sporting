export default async function handler(req, res) {
  const { name } = req.query;

  if (!name) {
    return res.status(400).json({ error: "Nome em falta" });
  }

  try {
    const response = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`
    );

    const data = await response.json();

    if (data.thumbnail && data.thumbnail.source) {
      return res.status(200).json({ image: data.thumbnail.source });
    }

    return res.status(200).json({ image: null });

  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar imagem" });
  }
}
