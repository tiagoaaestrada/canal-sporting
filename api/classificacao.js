export default async function handler(req, res) {
  res.status(200).json({
    key: process.env.FOOTBALL_DATA_KEY || "SEM KEY"
  });
}
