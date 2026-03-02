module.exports = async (req, res) => {

  const { name } = req.query;

  if (!name) {
    return res.status(400).json({ error: "Nome em falta" });
  }

  try {

    const response = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`,
      {
        headers: {
          "User-Agent": "CanalSportingApp/1.0"
        }
      }
    );

    if (!response.ok) {
      return res.status(200).json({ image: null });
    }

    const data = await response.json();

    if (data.thumbnail && data.thumbnail.source) {
      return res.status(200).json({ image: data.thumbnail.source });
    }

    return res.status(200).json({ image: null });

  } catch (error) {
    console.error("Erro Wikipedia:", error);
    return res.status(500).json({ error: "Erro Wikipedia" });
  }

};
