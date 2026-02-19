export default async function handler(req, res) {
  try {
    const imageUrl = "https://cdn.abola.pt/images/2026-02/abola_capa.jpg";

    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();

    res.setHeader("Content-Type", "image/jpeg");
    res.status(200).send(Buffer.from(imageBuffer));

  } catch (error) {
    res.status(500).json({ error: "Erro ao carregar capa A Bola" });
  }
}
