module.exports = (req, res) => {
  res.status(200).json({
    title: "Sporting vence por 3-0 no último jogo!",
    link: "https://www.record.pt"
  });
};
