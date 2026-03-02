const html = await response.text();
const $ = cheerio.load(html);

// Mostrar todas as classes principais encontradas
let classes = [];

$("*").each((i, el) => {
  const className = $(el).attr("class");
  if (className) {
    classes.push(className);
  }
});

return res.status(200).json(classes.slice(0, 100));