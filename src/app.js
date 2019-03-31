const express = require('express');
const app = express();
const path = require('path');
const hbs = require('hbs');

const directoriopublico = path.join(__dirname, '../public');
const directoriopartials = path.join(__dirname, '../template/partials');
const dirNode_modules = path.join(__dirname , '../node_modules');

hbs.registerPartials(directoriopartials);

app.use(express.static(directoriopublico));
//app.use(bodyParser.urlencoded({extended: false}));

app.use('/css', express.static(dirNode_modules + '/bootstrap/dist/css'));
app.use('/js', express.static(dirNode_modules + '/jquery/dist'));
app.use('/js', express.static(dirNode_modules + '/popper.js/dist'));
app.use('/js', express.static(dirNode_modules + '/bootstrap/dist/js'));

app.set('view engine', 'hbs');

app.get('/', (req, res) => {
    res.render('../template/views/index.hbs');
});

app.get('*', (req, res) => {
    res.render('../template/views/error.hbs');
});

app.listen(3000, () => {
    console.log('Escuchando en el puerto 3000');
});