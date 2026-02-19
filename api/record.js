module.exports = async (req, res) => {
  try {
    const response = await fetch("https://www.record.pt/capas");
    const html = await response.text();

    // Procurar a imagem da capa no HTML
    const match = html.match(/https:\/\/.*?\.jpg/);

    if (!match) {
      return res.status(500).json({ error: "Capa não encontrada" });
    }

    let cover = match[1];

// substituir versão pequena por maior
cover = cover.replace("80x100", "748x933");

    res.status(200).json({
      cover: coverUrl
    });

  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar capa" });
  }
};
