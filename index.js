const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

app.get('/', (req,res) => {
    res.send('Hello world!');

});

app.get('/deshow', (req,res) => {
    res.json([{nombre: 'Camilo'}, {nombre:'Alejandra' }])

});


app.post('/deshow', (req,res) => {
    console.log(req.body);
    

    res.send('Datos recibidos');

});

app.listen(port, ()=> {
    console.log(`Servidor corriende en http://localhost:${port}`);
    
})