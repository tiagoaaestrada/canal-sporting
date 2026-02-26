export default async function handler(req, res) {
  try {
    const url =
      "https://www.ligaportugal.pt/api/v2/competition/standings?competition=ligaportugalbetclic&season=20252026&round=24";

    const response = await fetch(url);
    const data = await response.json();

    if (!data || !data.standings) {
      return res.status(500).json({ error: "Classificação não disponível" });
    }

    // Extrair a tabela
    const tabela = data.standings;

    // Formatar para o frontend
    const classificacao = tabela.map(team => ({
      position: team.rank,
      team: team.team,
      played: team.matches,
      won: team.wins,
      draw: team.draws,
      lost: team.losses,
      goalDifference: team.goalsFor - team.goalsAgainst,
      points: team.points
    }));

    res.status(200).json({ "Primeira Liga": classificacao });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
