module.exports = (req, res) => {
  res.status(200).json({
    cover: "https://static.globalnoticias.pt/ojogo/image.jpg",
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
