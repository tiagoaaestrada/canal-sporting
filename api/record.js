export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  res.status(200).json({
    cover: "/record.png",
    coverLink: "https://www.record.pt",
    news: [
      {
        title: "Sporting vence FC Porto e conquista a Taça de Portugal",
        link: "https://www.record.pt"
      },
      {
        title: "Irmão de Rodrigo Ribeiro marca golo nos juvenis",
        link: "https://www.record.pt"
      },
      {
        title: "Nota artística - Sporting",
        link: "https://www.record.pt"
      }
    ]
  });
}
