export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  res.status(200).json({
    cover: "/abola.png",
    coverLink: "https://www.abola.pt",
    news: [
      {
        title: "Lesão de Kochochvili preocupa Sporting",
        link: "https://www.abola.pt"
      },
      {
        title: "«Merecemos a Taça» diz treinador",
        link: "https://www.abola.pt"
      },
      {
        title: "Mercado Sporting: Arsenal atento",
        link: "https://www.abola.pt"
      }
    ]
  });
}
