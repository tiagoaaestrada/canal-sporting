module.exports = async (req, res) => {
  res.status(200).json({
    cover: "https://upload.wikimedia.org/wikipedia/commons/1/13/A_Bola_logo.png",
    news: [
      {
        title: "Eleições Sporting: Varandas apresenta programa",
        link: "https://www.abola.pt"
      },
      {
        title: "Sporting: três pérolas da formação",
        link: "https://www.abola.pt"
      }
    ]
  });
};
