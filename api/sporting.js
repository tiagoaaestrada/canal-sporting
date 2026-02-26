export default async function handler(req, res) {
  const API_KEY = process.env.API_FOOTBALL_KEY;

  const test = await fetch(
    `https://v3.football.api-sports.io/fixtures?team=228&season=2025`,
    {
      headers: { "x-apisports-key": API_KEY }
    }
  );

  const data = await test.json();
  res.status(200).json(data);
}
