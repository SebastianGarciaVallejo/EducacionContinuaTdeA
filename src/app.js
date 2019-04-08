const express = require('express');
const app = express();
const path = require('path');
const hbs = require('hbs');
const bodyParser = require('body-parser');
const port = process.env.port || 3000;
require('./helpers/helper.js')

const directoriopublico = path.join(__dirname, '../public');
const directoriopartials = path.join(__dirname, '../template/partials');
const dirNode_modules = path.join(__dirname , '../node_modules');

hbs.registerPartials(directoriopartials);

app.use(express.static(directoriopublico));
app.use(bodyParser.urlencoded({extended: false}));

app.use('/css', express.static(dirNode_modules + '/bootstrap/dist/css'));
app.use('/js', express.static(dirNode_modules + '/jquery/dist'));
app.use('/js', express.static(dirNode_modules + '/popper.js/dist'));
app.use('/js', express.static(dirNode_modules + '/bootstrap/dist/js'));

app.set('view engine', 'hbs');

app.get('/', (req, res) => {
    res.render('../template/views/index.hbs');
});

app.get('/registroUsuario', (req, res) => {
    res.render('../template/views/registroUsuario.hbs');
});

app.listen(port,() => {
    console.log('Servidor en el puerto ' + port);
});
app.post('/resultadoOperacion', (req, res) => {
    res.render('../template/views/resultadoOperacion.hbs',{
        usuario:{
            operacion: 'registroUsuario',
            primerNombre: req.body.nombre1,
            segundoNombre: req.body.nombre2,
            primerApellido: req.body.apellido1,
            segundoApellido: req.body.apellido2,
            id: req.body.id,
            telefono: req.body.telefono,
            email: req.body.email,
            direccion: req.body.direccion,
            tipo: 'Aspirante'
        }
    });
});

app.get('/verCursos', (req, res) => {
    res.render('../template/views/listaDeCursos.hbs');
});

app.get('/inscribirCurso', (req, res) => {
    res.render('../template/views/inscripcion.hbs');
});

app.post('/resultadoInscripcion', (req, res) => {
    res.render('../template/views/resultadoInscripcion.hbs',{
        idUsuario: req.body.idUsuario,
        idCurso: req.body.listaDesplegable
    });
});

app.get('/crearCurso', (req, res) => {
    res.render('../template/views/crearCurso.hbs');
});


//resultadoCreacionCurso
app.post('/resultadoCreacionCurso', (req, res) => {
    res.render('../template/views/resultadoCreacionCurso.hbs',{
        informacionCurso: {
            id:             req.body.idCurso,
            nombre:         req.body.nombre,
            descripcion:    req.body.descripcion,
            valor:          req.body.valor,
            modalidad:      req.body.listaModalidad,
            intensidad:     req.body.intesidad,
            estado:         'Disponible'
        }
    });
});
    






app.get('*', (req, res) => {
    res.render('../template/views/error.hbs');
});

app.listen(3000, () => {
    console.log('Escuchando en el puerto 3000');
});