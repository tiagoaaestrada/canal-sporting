export default async function handler(req, res) {
  try {

    const competitions = {
      "Primeira Liga": "PPL",
      "UEFA Champions League": "CL"
    };

    const resultados = {};
    let totalGolos = 0;

    for (const [nome, codigo] of Object.entries(competitions)) {

      const response = await fetch(
        `https://api.football-data.org/v4/competitions/${codigo}/scorers?season=2025`,
        {
          headers: {
            "X-Auth-Token": process.env.FOOTBALL_API_KEY
          }
        }
      );

      const data = await response.json();

      const jogadoresSporting = data.scorers.filter(s =>
        s.team.name === "Sporting Clube de Portugal"
      );

      resultados[nome] = jogadoresSporting.map(j => ({
        player: j.player.name,
        goals: j.goals
      }));

      totalGolos += jogadoresSporting.reduce((sum, j) => sum + j.goals, 0);
    }

    res.status(200).json({
      totalGolos,
      competicoes: resultados
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
