module.exports = async (req, res) => {
  try {
    const baseUrl = "https://www.vercapas.com/storage/capas/o-jogo/";

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const formatDate = (date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}.jpg`;
    };

    const todayUrl = baseUrl + formatDate(today);
    const yesterdayUrl = baseUrl + formatDate(yesterday);

    let imageUrl = todayUrl;

    const testToday = await fetch(todayUrl, { method: "HEAD" });

    if (!testToday.ok) {
      imageUrl = yesterdayUrl;
    }

    // Buscar imagem real
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();

    // Enviar imagem como resposta
    res.setHeader("Content-Type", "image/jpeg");
    res.status(200).send(Buffer.from(imageBuffer));

  } catch (error) {
    res.status(404).send("Imagem não encontrada");
  }
};
