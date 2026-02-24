export default async function handler(req, res) {
  try {

    const headers = {
      "x-apisports-key": process.env.APISPORTS_KEY
    };

    const response = await fetch(
      "https://v3.football.api-sports.io/players?team=228&season=2025",
      { headers }
    );

    const data = await response.json();

    const jogadores = data.response.map(player => ({
      nome: player.player.name,
      foto: player.player.photo,
      jogos: player.statistics[0]?.games.appearences || 0,
      golos: player.statistics[0]?.goals.total || 0,
      assistencias: player.statistics[0]?.goals.assists || 0
    }));

    res.status(200).json(jogadores);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
