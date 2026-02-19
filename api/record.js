module.exports = (req, res) => {
  res.status(200).json({
    cover: "https://upload.wikimedia.org/wikipedia/commons/5/5e/Record_logo.png",
    news: [
      {
        title: "Operação Renovações: Sporting tem (quase) todo o plantel seguro...",
        link: "https://www.record.pt/futebol/futebol-nacional/liga-betclic/sporting"
      },
      {
        title: "Sporting com dois jogos à segunda-feira",
        link: "https://www.record.pt/futebol/futebol-nacional/liga-betclic/sporting"
      },
      {
        title: "Sporting regressa aos treinos com quatro reforços",
        link: "https://www.record.pt/futebol/futebol-nacional/liga-betclic/sporting"
      }
    ]
  });
};
