//Require
require('../config/config.js');
require('../helpers/helper.js')
const express = require('express');
const app = express();
const path = require('path');
const hbs = require('hbs');
const bodyParser = require('body-parser');
const session = require('express-session');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const COORDINADOR = 'Coordinador';
const ASPIRANTE = 'Aspirante';

//Directory
const directoriopublico = path.join(__dirname, '../../public');
const directoriopartials = path.join(__dirname, '../../template/partials');
const dirNode_modules = path.join(__dirname, '../../node_modules');
const Estudiante = require('./../../src/models/estudiante');
const Curso = require('./../../src/models/curso');
const CursoXEstudiante = require('./../../src/models/cursoxestudiante');


hbs.registerPartials(directoriopartials);

app.use(express.static(directoriopublico));
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/css', express.static(dirNode_modules + '/bootstrap/dist/css'));
app.use('/js', express.static(dirNode_modules + '/jquery/dist'));
app.use('/js', express.static(dirNode_modules + '/popper.js/dist'));
app.use('/js', express.static(dirNode_modules + '/bootstrap/dist/js'));
app.set('view engine', 'hbs');

//Conexion con Mongo
mongoose.connect(process.env.URLDB, {useNewUrlParser: true}, (err, resultado) => {
	if (err){
		return console.log(error)
	}
	console.log("conectado")
});

//Inicializador Session
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
}));

app.use((req, res, next) => {
    if (req.session.nombre) {
        res.locals.sesion = true,
        res.locals.nombre = req.session.nombre,
        res.locals.tipo   = req.session.tipo,
        res.locals.idEstudiante     = req.session.idEstudiante
    }
    next();
})
// Manejador Index
app.get('/', (req, res) => {
    res.render('../template/views/index.hbs');
});

app.get('/cerrarSession', (req, res) => {
    req.session.destroy(function (err) {
        // cannot access session here
        console.log('La session no puede ser destruida');
    })
    res.render('../template/views/index.hbs', {
        tipo: ''
    });
});

app.get('/verCursos', (req, res) => {
    console.log('VerCursos')
    console.log(req.session.tipo );
        if (req.session.tipo == COORDINADOR) {
            Curso.find(function (err, resultado) {
                if (err) {
                    console.log(err);
                }
                res.render('../template/views/listaDeCursos.hbs', {
                    listaCursos: resultado
                });
            })
        } else {
            Curso.find({ estado: 'Disponible' }, (err, resultado) => {
                if (err) {
                    console.log(err);
                }
                console.log(resultado);
                if (resultado) {
                    res.render('../template/views/listaDeCursos.hbs', {
                        listaCursos: resultado
                    });
                }

            })
        }
});

// Login
app.get('/login', (req, res) => {
    res.render('../template/views/login.hbs');
});

app.post('/validarLogin', (req, res) => {
    //Busca documento en la base de datos.
    Estudiante.findOne({ documento: req.body.usuario }, (err, resultado) => {
        if (err) {
            return console.log(err);
        }

        if (!resultado) {
            console.log('No encontro: ' + req.body.contrasena);
            return res.render('../template/views/index.hbs', {
                mensaje: "Usuario no encontrado"
            })
        }

        if (!bcrypt.compareSync(req.body.contrasena, resultado.password)) {
            console.log('No encontro en Bcrypt: ' + req.body.contrasena);
            return res.render('../template/views/index.hbs', {
                mensaje: "Usuario no encontrado"
            })
        }

        req.session.nombre = resultado.nombre;
        req.session.tipo = resultado.tipoEstudiante;
        req.session.idEstudiante = resultado.documento;
        console.log(req.session);
        return res.render('../template/views/index.hbs', {
            mensaje: "Bienvenido: " + req.session.nombre,
            tipo: req.session.tipo
        })
    });

});
// Fin Logica Login

// Registrar Usuario
app.get('/registroUsuario', (req, res) => {
    res.render('../template/views/registroUsuario.hbs');
});

app.post('/resultadoOperacion', (req, res) => {

    Estudiante.findOne({ documento: req.body.id }, (err, resultado) => {
        if (err) {
            console.log('Ocurrio un error al consultar la base de datos');
        }

        console.log('ID:' + req.body.id);
        if (resultado) {
            res.render('../template/views/error.hbs', {
                mensaje: 'Se presento un error al guardar los datos',
            });
        } else {

            let estudiante = new Estudiante({
                nombre: req.body.nombre1,
                telefono: req.body.telefono,
                correo: req.body.email,
                documento: req.body.id,
                password: bcrypt.hashSync(req.body.password, 10),
                tipoEstudiante: 'Aspirante'
            });

            estudiante.save((err, resultado) => {
                if (err) {
                    console.log('Error');
                } else {
                    console.log('Guardo con Exito');
                }
            });
        }

        res.render('../template/views/resultadoOperacion.hbs', {
            usuario: {
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

    })
});
//Fin Registrar Usuario

app.post('/resultadoCreacionCurso', (req, res) => {
    res.render('../template/views/resultadoCreacionCurso.hbs', {
        informacionCurso: {
            id: req.body.idCurso,
            nombre: req.body.nombre,
            descripcion: req.body.descripcion,
            valor: req.body.valor,
            modalidad: req.body.listaModalidad,
            intensidad: req.body.intesidad,
            estado: 'Disponible'
        }
    });
});
// Fin Crear Cursos 


/*
Logica para inscrpcion de curso.
*/
app.get('/inscribirCurso', (req, res) => {
    Curso.find((err, resultado) => {

        if (err) {
            res.render('../template/views/error.hbs', {
                mensaje: 'El documento ya se encuentra registrado en Base de datos',
            });
            console.log('Ocurrio un error al consultar la base de datos');
        } else if (resultado) {
            let texto = `<div class="form-group col-md-3">
            <label for="sel1">Seleccionar curso:</label>
            <select class="form-control" required name="listaDesplegable">`;

            resultado.forEach(curso => {
                texto = texto + `<option value="${curso.id}">${curso.nombre}</option>`;
            });
            texto = texto + `</select></div>`;
            res.render('../template/views/inscripcion.hbs',{
                listadoCursos   :   texto
            });
        }
    })
});

/*
Logica para inscrpcion de curso.
*/
app.get('/borrarCurso', (req, res) => {
    res.render('../template/views/borrarCurso.hbs', {
        nombre: req.session.nombre
    });

});

app.post('/accionBorrar', (req, res) => {
    CursoXEstudiante.findOneAndDelete(
        {
            idCurso: req.body.idCurso,
            idEstudiante: req.session.idEstudiante,
        }, (err, resultado) => {
            if (err) {
                res.render('../template/views/error.hbs', {
                    mensaje: 'No se puede borrar el curso',
                });
                console.log('Ocurrio un error al consultar la base de datos');
            }
            console.log(resultado);
            if (resultado) {
                res.render('../template/views/exito.hbs', {
                    mensaje: 'Se elimino correctamente el registro.',
                });
            }else{
                res.render('../template/views/error.hbs', {
                    mensaje: 'El curso o estudiante seleccionado no existen.',
                }); 
            }
        })
});


function obtenerCursosInscritos(cursoXEstudiante,cadena,callback,response) {
    let texto = cadena;
    let longitudObjeto = Object.keys(cursoXEstudiante).length;
            console.log('Longitud: ' + longitudObjeto);
            console.log(Object.keys(cursoXEstudiante));
    if(longitudObjeto > 0 ){
        //console.log(cursoXEstudiante[0]);
        Curso.findOne({ id: cursoXEstudiante[longitudObjeto-1].idCurso }, function (err, resultadoCurso) {
        //console.log('Este es el resultado: ' + resultadoCurso);

            texto = texto +
                '<tr>' +'<td>' + resultadoCurso.id  + '</td>' +
                '<td>' + resultadoCurso.nombre      + '</td>' +
                '<td>' + resultadoCurso.descripcion + '</td>' +
                '<td>' + resultadoCurso.valor       + '</td>' +
                '<td>' + resultadoCurso.modalidad   + '</td>' +
                '<td>' + resultadoCurso.intensidad  + '</td>' +
                '<td>' + resultadoCurso.estado      + '</td>' +'</tr>';

            console.log('Nombre Curso:' + resultadoCurso.nombre);
            
            delete cursoXEstudiante[longitudObjeto-1];
            console.log('Longitud: ' + longitudObjeto);
            obtenerCursosInscritos(cursoXEstudiante,texto, render,response);
            //console.log(cursoXEstudiante);
            //return texto /*+ obtenerCursosInscritos(cursoXEstudiante.prototype.shift())*/;
        });
    }else{
    console.log('voy a llamar al callback');
        callback(null,texto,response);
    }

    //return texto /*+ obtenerCursosInscritos(cursoXEstudiante.prototype.shift())*/;
}

function render(err, resultado,response) {
    console.log('Callback: ' + resultado);
    resultado = resultado + '</tbody></table>';
    response.render('../template/views/listaDeCursosInscritos.hbs', {
        cursos: resultado,
        });
}

app.get('/verCursosInscritos', (req, res) => {
    let cadena;
    cadena = '<table class="table table-striped table-hover table-dark">\
                <thead class="thead-dark">\
                    <th>Id</th>\
                    <th>Nombre</th>\
                    <th>Descripción</th>\
                    <th>Valor</th>\
                    <th>Modalidad</th>\
                    <th>Intensidad</th>\
                    <th>Estado</th>\
                </thead>\
                <tbody>';
    if (req.session.tipo == ASPIRANTE) {
        console.log('Id estudiante: ' + req.session.idEstudiante);
        CursoXEstudiante.find({ idEstudiante: req.session.idEstudiante }, function (err, resultado) {
            if (err) {
                console.log(err);
            }
            if (resultado.length > 0) {
                console.log('ObtenerCursosInscritos: ' + obtenerCursosInscritos(resultado,cadena,render,res));
            }else{
                console.log('Entramos 1');
                res.render('../template/views/error.hbs', {
                    mensaje: 'No existen resultados para la consulta ejecutada.',
                });
            }
        })
    }else{
        console.log('Entramos 2');
        res.render('../template/views/error.hbs', {
            mensaje: 'No puede consultar la pagina solicitada.',
        });
    }
});
/*
Logica inscripcion de cursos.
*/
app.post('/resultadoInscripcion', (req, res) => {
    CursoXEstudiante.findOne(
        {
            idCurso: req.body.listaDesplegable,
            idEstudiante: req.session.idEstudiante,
        }, (err, resultado) => {
            if (err) {
                res.render('../template/views/error.hbs', {
                    mensaje: 'El documento ya se encuentra registrado en Base de datos',
                });
                console.log('Ocurrio un error al consultar la base de datos');
            }

            console.log('ID:' + req.body.id);
            if (resultado) {
                console.log('Entramos a resultado');
                res.render('../template/views/error.hbs', {
                    mensaje: 'El documento ya se encuentra registrado en Base de datos',
                });
            } else {
                let cursoxestudiante = new CursoXEstudiante({
                    idCurso: req.body.listaDesplegable,
                    idEstudiante: req.session.idEstudiante
                });

                cursoxestudiante.save((err, resultado) => {
                    if (err) {
                        console.log('Problemas al guardar el curso.');
                    } else {

                        console.log('Guardado con exito.');
                    }

                });

                res.render('../template/views/resultadoInscripcion.hbs', {
                    mensaje: 'El usuario se registro correctamente al curso'
                });
            }
        })


});



// Logica Error
/*
app.get('*', (req, res) => {
    res.render('../template/views/error.hbs');
});
*/
module.exports = app