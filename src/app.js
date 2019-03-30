const express = require('express');
const app = express();



app.get('/', (req, res) => {
    res.render('../template/views/index.hbs');
});

app.listen(3000, () => {
    console.log('Escuchando en el puerto 3000');
});