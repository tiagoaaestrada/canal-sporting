module.exports = async (req, res) => {
  res.status(200).json({
    cover: "https://www.abola.pt/img/capas/abola.jpg",
    news: [
      {
        title: "Eleições Sporting: Varandas apresenta programa de ação",
        link: "https://www.abola.pt"
      }
    ]
  });
};
