//Require
require('./config/config');
const express = require('express');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Estudiante = require('../src/models/estudiante');
const Curso      = require('../src/models/curso');
app.use(require('./routes/index'));

app.get('/login', (req, res) => {
    //console.log(__dirname);
    res.render('../template/views/login.hbs');
});

app.get('/registroUsuario', (req, res) => {
    res.render('../template/views/registroUsuario.hbs');
});


app.get('/crearCurso', (req, res) => {
    res.render('../template/views/crearCurso.hbs');
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

app.listen(process.env.PORT,() => {
    console.log('Servidor en el puerto ' + process.env.PORT);
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