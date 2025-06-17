console.log('✅ Serverbestand gestart');
 
import express from 'express' // Externe bibliotheek
import { Liquid } from 'liquidjs'; // Importeerd liquid uit de bibliotheek
import 'dotenv/config' // Importeerd dotenv uit de bibliotheek, dotevn zorgt ervoor dat je de variabelen uit het env bestand lokaal kunt lezen
import fetch from 'node-fetch';

console.log(process.env.API_KEY)

const app = express() // Express zorgt voor een aanroep voor het starten van een nieuwe webserver, zodat je door middel van app een route kan aanmaken
app.use(express.static('public'))
app.use(express.urlencoded({extended: true}))

const engine = new Liquid()
app.engine('liquid', engine.express()); 
app.set('views', './views')
app.set('view engine', 'liquid');


// Data ophalen en filteren
app.get('/', async (req, res) => {
  console.log('📥 Route / is aangeroepen');

  // Ik ga de data ophalen van de mensen van Q42
  const qersResponse = await fetch('https://the-sprint-api.onrender.com/people', {
    // Ik ga de sleutel van de Q42 databse toevoegen om de data in te zien
    headers: {
      'X-API-Key': `${process.env.API_KEY}`
    }
  });

  const data = await qersResponse.json();

  // Ik ga de data ophalen voor de chatberichten
  const response = await fetch('https://fdnd.directus.app/items/messages?filter[from][_eq]=148&sort=-created');
  const json = await response.json();

  // Verwijs naar de name attribute in de input namelijk categorie
  let selected = req.query.categorie;
  // In deze regel worden de filter opties in strings gezet zodat er meerdere filters geselecteerd kunnen worden. Typeof geeft aan wat voor waarde de selected is, in dit geval dus een string === maakt een vergelijking tussen selected en een string
  if (typeof selected === 'string') selected = [selected];

  // tag.split(',') zorgt ervoor dat wanneer er een , in de array zit, deze 2 opties worden gesplits als 2 losse arrays
  // .map(t => t.trim()) zorgt ervoor dat alle spaties uit de arrays worden gehaald
  // .flatMap(...) past bovenstaande bewerking toe op elke string in de array en voegt dit samen
  const normalizeTags = tags => {
    return tags.flatMap(tag => tag.split(',').map(t => t.trim()));
  };

  // Filteren op tags
  const filteredQers = selected
  ? data.filter(person => {
      // person.tags ? ... : ... een korte manier van een if-else. normalizeTags(person.tags) als person.tags bestaat, voeg normalizeTags toe om de code op te schonen voor gebruik
      const tags = person.tags ? normalizeTags(person.tags) : [];
      // tags.some(...) checkt of de array of arrays voldoen aan bepaalde voorwaarden. tag => selected.includes(tag) kijtk of elke tag voorkomt in de geselecteerde array 
      return tags.some(tag => selected.includes(tag));
    })
  : data;

  // Render de pagina met filters en chats
  res.render('index.liquid', {
    qers: filteredQers,     // personen (gefilterd)
    chats: json.data,       // chatberichten
    tags: selected || []    // filters
  });
});

  // Post in chat
  app.post ('/', async function (req, res){
  
    const postChat = await fetch ('https://fdnd.directus.app/items/messages/', {
      method: 'POST',
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({
        text: req.body.text,
        for: "Q42",
        from: "148"
      })
    })
  
    res.redirect(303, '/')
  })

app.set('port', process.env.PORT || 8000)
app.listen(app.get('port'), function () {
  console.log(`Application started on http://localhost:${app.get('port')}`)
})