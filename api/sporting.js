import fs from "fs";
import path from "path";

export default function handler(req, res) {
  try {
    const filePath = path.join(process.cwd(), "data", "jogos-2025-2026.json");
    const fileData = fs.readFileSync(filePath, "utf-8");
    const jogos = JSON.parse(fileData);

    // Ordenar cronologicamente
    jogos.sort((a,b) => new Date(a.date) - new Date(b.date));

    const porJogar = jogos.filter(j => j.score.home === null);
    const jogados = jogos.filter(j => j.score.home !== null);

    res.status(200).json({
      todos: jogos,
      porJogar,
      jogados
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
