module.exports = async (req, res) => {
  res.status(200).json({
    cover: "https://www.record.pt/resources/capas/record.jpg",
    news: [
      {
        title: "Operação Renovações: Sporting tem (quase) todo o plantel seguro mas ainda há casos...",
        link: "https://www.record.pt/futebol/futebol-nacional/liga-betclic/sporting"
      }
    ]
  });
};
