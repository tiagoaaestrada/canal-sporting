module.exports = (req, res) => {
  res.status(200).json({
    cover: "https://upload.wikimedia.org/wikipedia/commons/1/1b/A_Bola_logo.png",
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
