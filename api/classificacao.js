export default async function handler(req, res) {
  res.status(200).json({
    key: process.env.API_FOOTBALL_KEY || "SEM KEY"
  });
}
