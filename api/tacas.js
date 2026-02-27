export default async function handler(req, res) {
  try {

    const agora = new Date();

    const url = "https://www.zerozero.pt/equipa/sporting/jogos?grp=1&ond=&epoca_id=155&compet_id_jogos=9&comfim=0&equipa_1=16&menu=allmatches&type=season";

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    const html = await response.text();

    const linhas = html.split('<tr data-lj="h2"');

    let jogos = [];

    for (let linha of linhas) {

      if (!linha.includes("Taça de Portugal")) continue;

      // Data
      const dataMatch = linha.match(/<td class="double"\s*>(.*?)<\/td>/);
      if (!dataMatch) continue;

      const data = dataMatch[1].trim();

      // Hora
      const horaMatch = linha.match(/<\/td><td>(\d{2}:\d{2})<\/td>/);
      const hora = horaMatch ? horaMatch[1] : "00:00";

      const date = new Date(`${data}T${hora}:00`);

      // Adversário
      const teamMatch = linha.match(/<td class="text".*?>(.*?)<\/a>/);
      if (!teamMatch) continue;

      const adversario = teamMatch[1]
        .replace(/<.*?>/g, "")
        .trim();

      // Resultado
      const resultMatch = linha.match(/<td class="result">.*?>(.*?)<\/a>/);
      let score = { home: null, away: null };

      if (resultMatch) {
        const marcador = resultMatch[1];
        const scoreMatch = marcador.match(/(\d+)-(\d+)/);
        if (scoreMatch) {
          score = {
            home: parseInt(scoreMatch[1]),
            away: parseInt(scoreMatch[2])
          };
        }
      }

      // Fase
      const faseMatch = linha.match(/<td class="away">(.*?)<\/td>/);
      const fase = faseMatch ? faseMatch[1] : "";

      // Casa ou Fora
      const casaForaMatch = linha.match(/\((C|F)\)/);
      const casa = casaForaMatch && casaForaMatch[1] === "C";

      const homeTeam = casa ? "Sporting Clube de Portugal" : adversario;
      const awayTeam = casa ? adversario : "Sporting Clube de Portugal";

      jogos.push({
        date,
        competition: "Taça de Portugal",
        fase,
        homeTeam,
        awayTeam,
        score
      });
    }

    const porJogar = jogos
      .filter(j => j.score.home === null)
      .sort((a,b) => new Date(a.date) - new Date(b.date));

    const jogados = jogos
      .filter(j => j.score.home !== null)
      .sort((a,b) => new Date(b.date) - new Date(a.date));

    res.status(200).json({
      jogos: { porJogar, jogados }
    });

  } catch (error) {

    res.status(500).json({
      error: "Erro ao carregar Taça de Portugal",
      detalhe: error.message
    });

  }
}
