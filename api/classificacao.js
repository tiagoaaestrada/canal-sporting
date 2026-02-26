export default async function handler(req, res) {
  try {
    const url =
      "https://www.ligaportugal.pt/calendars-ics/ligaportugalbetclic.ics";

    const response = await fetch(url);
    const icsText = await response.text();

    const events = icsText.split("BEGIN:VEVENT");

    // Devolve os primeiros 3 eventos completos
    res.status(200).json({
      sample: events.slice(1, 4)
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
