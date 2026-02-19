module.exports = async (req, res) => {
  res.status(200).json({
    cover: "https://upload.wikimedia.org/wikipedia/commons/4/4f/O_Jogo_logo.png",
    news: [
      {
        title: "Prognóstico Moreirense vs Sporting",
        link: "https://www.ojogo.pt"
      },
      {
        title: "Sporting CP vence",
        link: "https://www.ojogo.pt"
      }
    ]
  });
};
