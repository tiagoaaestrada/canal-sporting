export default async function handler(req, res) {
  try {
    const url =
      "https://www.ligaportugal.pt/calendars-ics/ligaportugalbetclic.ics";

    const response = await fetch(url);
    const icsText = await response.text();

    const events = icsText.split("BEGIN:VEVENT");

    const tabela = {};

    for (const event of events) {
      if (!event.includes("SUMMARY:")) continue;

      const summaryMatch = event.match(/SUMMARY:(.*)/);
      if (!summaryMatch) continue;

      const summary = summaryMatch[1];

      // Procurar resultado no formato: Equipa A 2-1 Equipa B
      const resultMatch = summary.match(/(.+?) (\d+)-(\d+) (.+)/);
      if (!resultMatch) continue;

      const home = resultMatch[1].trim();
      const homeGoals = parseInt(resultMatch[2]);
      const awayGoals = parseInt(resultMatch[3]);
      const away = resultMatch[4].trim();

      // Inicializar equipas
      if (!tabela[home]) {
        tabela[home] = initTeam();
      }
      if (!tabela[away]) {
        tabela[away] = initTeam();
      }

      tabela[home].played++;
      tabela[away].played++;

      tabela[home].goalsFor += homeGoals;
      tabela[home].goalsAgainst += awayGoals;

      tabela[away].goalsFor += awayGoals;
      tabela[away].goalsAgainst += homeGoals;

      if (homeGoals > awayGoals) {
        tabela[home].won++;
        tabela[home].points += 3;
        tabela[away].lost++;
      } else if (homeGoals < awayGoals) {
        tabela[away].won++;
        tabela[away].points += 3;
        tabela[home].lost++;
      } else {
        tabela[home].draw++;
        tabela[away].draw++;
        tabela[home].points++;
        tabela[away].points++;
      }
    }

    const classificacao = Object.entries(tabela)
      .map(([team, stats]) => ({
        team,
        ...stats,
        goalDifference: stats.goalsFor - stats.goalsAgainst
      }))
      .sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDifference !== a.goalDifference)
          return b.goalDifference - a.goalDifference;
        return b.goalsFor - a.goalsFor;
      })
      .map((team, index) => ({
        position: index + 1,
        ...team
      }));

    res.status(200).json({
      "Primeira Liga": classificacao
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao calcular classificação" });
  }
}

function initTeam() {
  return {
    played: 0,
    won: 0,
    draw: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    points: 0
  };
}
