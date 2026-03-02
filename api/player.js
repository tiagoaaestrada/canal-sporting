module.exports = async (req, res) => {

  const name = req.query.name;
  if (!name) return res.status(400).json({ error: "No name" });

  try {

    const response = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`
    );

    if (!response.ok) {
      return res.json({ error: "Not found" });
    }

    const data = await response.json();

    const extract = data.extract || "";

    // Idade (ano nascimento)
    let age = null;
    const birthMatch = extract.match(/\((born\s(\d{4})|\d{1,2}\s\w+\s(\d{4}))\)/);
    if (birthMatch) {
      const year = birthMatch[2] || birthMatch[3];
      if (year) {
        age = new Date().getFullYear() - parseInt(year);
      }
    }

    // Nacionalidade (primeira palavra antes de footballer)
    let nationality = null;
    const natMatch = extract.match(/is a (\w+)/);
    if (natMatch) {
      nationality = natMatch[1];
    }

    // Posição
    let position = null;
    if (extract.includes("forward")) position = "Forward";
    if (extract.includes("midfielder")) position = "Midfielder";
    if (extract.includes("defender")) position = "Defender";
    if (extract.includes("goalkeeper")) position = "Goalkeeper";

    res.json({
      name: data.title,
      image: data.thumbnail?.source || null,
      age,
      nationality,
      position
    });

  } catch (error) {
    res.status(500).json({ error: "Wikipedia error" });
  }
};
