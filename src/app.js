const express = require('express');
const app = express();
const path = require('path');
const hbs = require('hbs');
const bodyParser = require('body-parser');
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

app.get('/login', (req, res) => {
    res.render('../template/views/login.hbs');
});

app.post('/validarLogin', (req, res) => {
    res.render('../template/views/index.hbs', {
        usuario: req.body.usuario,
        contrasena: req.body.contrasena,
        operacion: 'Login'   
    });
});

app.get('/registroUsuario', (req, res) => {
    res.render('../template/views/registroUsuario.hbs');
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

app.post('/resultadoCreacionCurso', (req, res) => {
    res.render('../template/views/resultadoCreacionCurso.hbs',{
        informacionCurso: {
            id:             Number(req.body.idCurso),
            nombre:         req.body.nombre,
            descripcion:    req.body.descripcion,
            valor:          req.body.valor,
            modalidad:      req.body.listaModalidad,
            intensidad:     req.body.intesidad,
            estado:         'Disponible'
        }
    });
});
    
app.get('/verInscritos', (req, res) => {
    res.render('../template/views/inscritos.hbs');
});

app.post('/cerrarCurso', (req, res) => {
    res.render('../template/views/resultadoBorrarEstudiante.hbs',{
        info: {
            idCurso:        req.body.idCursoCerrado,
            idEstudiante:   req.body.idEstudiante
        }
    });
});

app.get('/administrarUsuarios', (req, res) => {
    res.render('../template/views/administrarUsuarios.hbs');
});

app.post('/administrarUsuarios', (req, res) => {
    if(req.body.operacion == 'enviar'){
        res.render('../template/views/administrarUsuarios.hbs', {
            idUsuario: req.body.idUsuario,
            operacion: req.body.operacion,
            datosActualizar: req.body
        });
    }else{
        res.render('../template/views/administrarUsuarios.hbs', {
            idUsuario: req.body.idUsuario,
            operacion: req.body.operacion,
            datosActualizar: ''
        });
    }
});

app.get('/eliminarInscripcion', (req, res) => {
    res.render('../template/views/eliminarInscripcion.hbs');
});


app.post('/eliminarInscripcion', (req, res) => {
    res.render('../template/views/eliminarInscripcion.hbs', {
        idCurso: req.body.listaDesplegable
    });
});

app.get('*', (req, res) => {
    res.render('../template/views/error.hbs');
});

app.listen(3000, () => {
    console.log('Escuchando en el puerto 3000');
});