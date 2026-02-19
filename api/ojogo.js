module.exports = (req, res) => {
  res.status(200).json({
    cover: "https://upload.wikimedia.org/wikipedia/commons/3/3f/O_Jogo_logo.png",
    news: [
      {
        title: "Prognóstico Moreirense vs Sporting",
        link: "https://www.ojogo.pt/futebol/1a-liga/sporting"
      },
      {
        title: "Sporting CP vence e mantém liderança",
        link: "https://www.ojogo.pt/futebol/1a-liga/sporting"
      },
      {
        title: "Quatro jogadores da equipa B treinam com A",
        link: "https://www.ojogo.pt/futebol/1a-liga/sporting"
      }
    ]
  });
};
