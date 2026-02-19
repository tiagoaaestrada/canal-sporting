module.exports = (req, res) => {
  res.status(200).json({
    cover: "https://static.abola.pt/img/capas/abola.jpg",
    news: [
      {
        title: "Eleições Sporting: Varandas apresenta programa",
        link: "https://www.abola.pt/clubes/sporting"
      },
      {
        title: "Sporting: três pérolas da formação",
        link: "https://www.abola.pt/clubes/sporting"
      },
      {
        title: "Varandas confirma continuidade do projeto",
        link: "https://www.abola.pt/clubes/sporting"
      }
    ]
  });
};
