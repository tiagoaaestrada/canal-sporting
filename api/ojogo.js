module.exports = async (req, res) => {
  res.status(200).json({
    cover: "https://www.ojogo.pt/img/capas/ojogo.jpg",
    news: [
      {
        title: "Prognóstico Moreirense vs Sporting CP",
        link: "https://www.ojogo.pt"
      }
    ]
  });
};
