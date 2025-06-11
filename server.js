console.log('Hier komt je server voor Sprint 12.')
 
import express from 'express' // Externe bibliotheek
import { Liquid } from 'liquidjs'; // Importeerd liquid uit de bibliotheek
import 'dotenv/config' // Importeerd dotenv uit de bibliotheek, dotevn zorgt ervoor dat je de variabelen uit het env bestand lokaal kunt lezen
console.log(process.env.API_KEY)

const app = express() // Express zorgt voor een aanroep voor het starten van een nieuwe webserver, zodat je door middel van app een route kan aanmaken
app.use(express.static('public'))
app.use(express.urlencoded({extended: true}))

const engine = new Liquid()
app.engine('liquid', engine.express()); 
app.set('views', './views')
app.set('view engine', 'liquid');

app.get('/', async (req, res) => { // HTTP GET-verzoek

    // Link naar data voor de mensen details
    const qersResponse = await fetch ('https://the-sprint-api.onrender.com/people', {
        headers: {
            'X-API-Key':`${process.env.API_KEY}`
        }
    });

    // Link naar data voor de chatfunctie
    const chatsResponse = await fetch ('https://fdnd.directus.app/items/messages/')
    const chatResponseJSON = await chatsResponse.json();
    console.log('Volledige API-response:', chatResponseJSON);

    const data = await qersResponse.json();
    res.render('index.liquid', { qers:data,  chat:chatResponseJSON.data}); 
});


app.set('port', process.env.PORT || 8000)
app.listen(app.get('port'), function () {
  console.log(`Application started on http://localhost:${app.get('port')}`)
})