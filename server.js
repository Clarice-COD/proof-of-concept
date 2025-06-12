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

app.get('/', async (req, res) => {
    console.log('📥 Route / is aangeroepen');
        const qersResponse = await fetch('https://the-sprint-api.onrender.com/people', {
            headers: {
                'X-API-Key': `${process.env.API_KEY}`
            }
        });
        const data = await qersResponse.json();

        const response = await fetch('https://fdnd.directus.app/items/messages?filter[from][_eq]=148');
        const json = await response.json();

        console.log('🔎 Chat response JSON:', json.data);

        res.render('index.liquid', { qers: data, chats: json.data });
});

// app.get('/chat', async (req, res) => {
// console.log('📥 Route /chat is aangeroepen');

//       const response = await fetch('https://fdnd.directus.app/items/messages/');
//       const json = await response.json();
//       console.log('🔎 Chat response JSON:', JSON.stringify(json, null, 2));
//       res.render('chat.liquid', { chat: json.data || [] });
//   });

app.set('port', process.env.PORT || 8000)
app.listen(app.get('port'), function () {
  console.log(`Application started on http://localhost:${app.get('port')}`)
})