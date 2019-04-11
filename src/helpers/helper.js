const hbs = require('hbs');
const fs = require('fs'); 
listaUsuarios = [];
listaCursos = [];
listaUsuriosPorCurso = [];
usuarioLogin = undefined;
contrasenaLogin = undefined;
rol = undefined;

hbs.registerHelper('opcionesMenuPorRol', (usuario, contrasena, operacion) => {

    if(operacion == 'Login'){
        usuarioLogin = usuario;
        contrasenaLogin = contrasena;
    }
    let menu = '';
    let abrirMenu =`<div class="container">
    <div class="row">
        <div class="col-lg-12">
            <nav class="navbar navbar-expand-lg navbar navbar-dark bg-dark">
                <a class="navbar-brand" href="#"></a>
                <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav">`;

    let inicio=`<li class="nav-item active">
                    <a class="nav-link" href="/">INICIO<span class="sr-only">(current)</span></a>
                </li>`;

    let login=  `<li class="nav-item">
                    <a class="nav-link" href="/login">LOGIN</a>
                </li>`;

    let crearCurso=`<li class="nav-item">
                        <a class="nav-link" href="/crearCurso">CREAR CURSO</a>
                    </li>`;

    let registrarme=`<li class="nav-item">
                        <a class="nav-link" href="/registroUsuario">REGISTRARME</a>
                    </li>`;

    let verCursos=  `<li class="nav-item">
                        <a class="nav-link" href="/verCursos">VER CURSOS</a>
                    </li>`;

    let inscribirCurso= `<li class="nav-item">
                            <a class="nav-link" href="/inscribirCurso">INSCRIBIR</a>
                        </li>`;

    let verInscritos =  `<li class="nav-item">
                            <a class="nav-link" href="/verInscritos">VER INSCRITOS</a>
                        </li>`;
    
    let administrarUsuarios=`<li class="nav-item">
                                <a class="nav-link" href="/administrarUsuarios">ADMINISTRAR USUARIOS</a>
                            </li>`;

    let cerrarMenu=                     `</ul>
                                    </div>
                                </nav>
                            </div>
                        </div>
                    </div>`;

    if(usuarioLogin != undefined && contrasenaLogin != undefined)
    {
        let informacionUsuario = obtenerInformacionUsuario(usuarioLogin);
        if(informacionUsuario.length == 0){
            console.log('Menu Inicial');
            menu = abrirMenu + inicio + registrarme + login + cerrarMenu;
        }else {
            if(informacionUsuario[0].tipo == 'Aspirante'){
                console.log('Menu Aspirante');
                rol = 'Aspirante';
                menu = abrirMenu + inicio + verCursos + inscribirCurso + /*eliminarInscripcion*/ cerrarMenu;
            }else if(informacionUsuario[0].tipo == 'Coordinador'){
                console.log('Menu Coordinador');
                rol = 'Coordinador';
                menu = abrirMenu +  inicio + crearCurso + verCursos + verInscritos + administrarUsuarios + cerrarMenu;
            }
        }
    }else{
        console.log('Menu Inicial');
        menu = abrirMenu + inicio + registrarme + login + cerrarMenu;
    }
    return menu;
});


hbs.registerHelper('registarUsuario', (usuario) => {
    let respuesta = insertarUsuario(usuario);
    return respuesta;
});


hbs.registerHelper('listarCursos', () => {
    consultarCursos();
    let listaFiltrada =[];
    if(rol == 'Aspirante') {
        listaFiltrada = listaCursos.filter(registro => registro.estado === "Disponible");
    }else if (rol == 'Coordinador'){
        listaFiltrada = listaCursos;
    }
    let texto = '<table class="table table-striped table-hover table-dark">\
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
    listaFiltrada.forEach(curso => {
        texto = texto +
                '<tr>' +
                '<td>' + curso.id + '</td>' +
                '<td>' + curso.nombre + '</td>' +
                '<td>' + curso.descripcion + '</td>' +
                '<td>' + curso.valor + '</td>' +
                '<td>' + curso.modalidad + '</td>' +
                '<td>' + curso.intensidad + '</td>' +
                '<td>' + curso.estado + '</td>' +
                '</tr>';
    });
    texto = texto + '</tbody></table>';
    return texto;
});


hbs.registerHelper('listaDesplegableCursos', () => {
    consultarCursos();
    let texto =`<div class="form-group col-md-3">
                    <label for="sel1">Seleccionar curso:</label>
                    <select class="form-control" required name="listaDesplegable">`;

    listaCursos.forEach(curso => {
        texto = texto + `<option value="${curso.id}">${curso.nombre}</option>`;
    });                
    texto = texto + `</select></div>`;
    return texto;
});


hbs.registerHelper('inscibriUsuarioEnCurso', (idUsuario, idCurso) => {
    consultarEstudiantesPorCurso();
    let mensaje = 'Todo Bien';
    let informacionUsuario = obtenerInformacionUsuario(idUsuario);
    if(informacionUsuario.length == 0){
        mensaje = 'La persona con el documento no esta inscrita.';
    }
    let informacionCurso = obtenerInformacionCurso(idCurso);

    if(informacionCurso.length > 0 && informacionUsuario.length > 0){
        let duplicado = listaUsuriosPorCurso.find(registro => registro.idCurso == informacionCurso[0].id
            && registro.idUsuario == informacionUsuario[0].id)
        if(!duplicado) {
            let usuarioXCurso = {
                idCurso:        informacionCurso[0].id,
                nombreCurso:    informacionCurso[0].nombre,
                idUsuario:      informacionUsuario[0].id,
                nombreUsuario:  informacionUsuario[0].primerNombre,
                email:          informacionUsuario[0].email,
                telefono:       informacionUsuario[0].telefono
            };
            listaUsuriosPorCurso.push(usuarioXCurso);
            guardarUsuarioPorCurso();
            mensaje = "Se ha inscrito en el curso satisfactoriamente.";
        } else {
            mensaje = 'El aspirante ' + informacionUsuario[0].primerNombre + ' con número de identificación ' +
            informacionUsuario[0].id + ' ya esta inscrito en el curso ' + informacionCurso[0].nombre;
        }
    }else{
        mensaje = 'No existe un estudiante registrado en el sistema con la identificacion ingresada';
    }
    return mensaje;
});


hbs.registerHelper('crearCurso', (informacionCurso)=>{
    consultarCursos();
    let respuesta = '';
    let duplicado = listaCursos.find(registro => registro.id == informacionCurso.id)
    if(!duplicado){
        listaCursos.push(informacionCurso);
        guardarCurso();
        respuesta = "Se ha registrado el curso satisfactoriamente.";
    }else {
        respuesta = 'Ya existe un curso registrado con el número de identificacion: ' + informacionCurso.id;
    }
    return respuesta;
});


hbs.registerHelper('listar2', () => {
    consultarCursos();
    const listaFiltrada = listaCursos.filter(registro => registro.estado === "Disponible");
    let texto = '<div class="accordion" id="accordionAdminCurs">';
    i = 1;
    listaFiltrada.forEach(curso => {
        texto = texto +
            `<div class="card">
                <div class="card-header" id="heading${i}">
                    <h2 class="mb-0">
                        <button class="btn btn-link" type="button" data-toggle="collapse" 
                            data-target="#collapse${i}" aria-expanded="true" 
                            aria-controls="collapse${i}">
                            ${curso.nombre}
                        </button>
                    </h2>
                </div>
                <div id="collapse${i}" class="collapse" aria-labelledby="heading${i}" data-parent="#accordionAdminCurs">
                    <div class="card-body">
                        <form class="form-inline" action="cerrarCurso" method="post">
                        <input class="form-control" name="idCursoCerrado" value=${curso.id} type="hidden">
                            <table class='table table-striped' name="tabla">
                                <thead class='thead-dark'>
                                    <th>id</th>
                                    <th>Nombre Completo</th>
                                    <th>Correo</th>
                                    <th>Telefono</th>
                                    <th>Eliminar</th>
                                </thead>
                                <tbody>`
                                    + estudianteMatriculado(curso.id) +
                                `</tbody> 
                            </table>
                        </form>
                    </div>
                </div>
            </div>`;
        i = i + 1;
    })
    texto = texto + '</div>';
    return texto;
});


hbs.registerHelper('administrarUsuario', (idUsuario, operacion, datosActualizar)=>{
    let html = 
            `<br>
            <form action="/administrarUsuarios" method="post">
                <div class="form-row">
                    <div class="form-group col-md-3"></div>

                    <div class="form-group col-md-2">
                    <label for="inputEmail4">Identificacion Usuario:</label>
                    </div>

                    <div class="form-group col-md-2">
                    <input type="text" class="form-control" name="idUsuario" required>
                    </div>

                    <div class="form-group col-md-2">
                        <button class="btn btn-primary" name="operacion" value="consultar">Consultar</button>
                    </div>

                    <div class="form-group col-md-3"></div>   
                </div>
            </form>`;

    if(operacion == 'consultar') {
        let datosUsuario = obtenerInformacionUsuario(idUsuario);

        if(datosUsuario.length > 0) {
            let listaRoles = ['Aspirante','Profesor', 'Coordinador'];
            let opcionesLista='';

            listaRoles.forEach(rol => {
                if(rol == datosUsuario[0].tipo){
                    opcionesLista = opcionesLista + `<option value="${rol}" selected>${rol}</option>`;
                }
                else{
                    opcionesLista = opcionesLista + `<option value="${rol}">${rol}</option>`;
                }
            });
            html = 
            `<br>
            <form action="/administrarUsuarios" method="post">
                <div class="form-row">
                    <div class="form-group col-md-2"></div>
                    <div class="form-group col-md-2">
                    <label for="inputEmail4">Primer Nombre</label>
                    <input type="text" class="form-control" name="nombre1" value="${datosUsuario[0].primerNombre}" required>
                    </div>
                    <div class="form-group col-md-1"></div>
                    <div class="form-group col-md-2">
                    <label for="inputPassword4">Segundo Nombre</label>
                    <input type="text" class="form-control" name="nombre2" value="${datosUsuario[0].segundoNombre}">
                    </div>
                    <div class="form-group col-md-1"></div>
                    <div class="form-group col-md-2">
                    <label for="inputPassword4">Primer Apellido</label>
                    <input type="text" class="form-control" name="apellido1" value="${datosUsuario[0].primerApellido}" required>
                    </div>
                    <div class="form-group col-md-2"></div>
                    <br><br>        
                </div>

                <div class="form-row">
                <div class="form-group col-md-2"></div>
                <div class="form-group col-md-2">
                    <label for="inputEmail4">Segundo Apellido</label>
                    <input type="text" class="form-control" name="apellido2" value="${datosUsuario[0].segundoApellido}" required>
                </div>
                <div class="form-group col-md-1"></div>
                <div class="form-group col-md-2">
                    <label for="inputPassword4">Documento de identidad</label>
                    <input type="number" class="form-control" required name="documento" value="${datosUsuario[0].id}">
                </div>
                <div class="form-group col-md-1"></div>
                <div class="form-group col-md-2">
                    <label for="inputPassword4">Telefono</label>
                    <input type="number" class="form-control" name="telefono" value="${datosUsuario[0].telefono}">
                </div>
                <div class="form-group col-md-2"></div>
                </div>

                <div class="form-row">
                    <div class="form-group col-md-2"></div>
                    <div class="form-group col-md-2">
                    <label for="inputPassword4">Email</label>
                    <input type="email" class="form-control" name="email" required value="${datosUsuario[0].email}">
                    </div> 
                    <div class="form-group col-md-1"></div>
                    <div class="form-group col-md-2">
                        <label for="inputEmail4">Direccón</label>
                        <input type="text" class="form-control" name="direccion" value="${datosUsuario[0].direccion}">
                    </div>
                    <div class="form-group col-md-1"></div>
                    <div class="form-group col-md-2">
                        <label for="inputEmail4">Rol</label>
                        <select class="form-control" name="listaDesplegable" required>
                            ${opcionesLista}
                        </select>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group col-md-5"></div>
                    <div class="form-group col-md-1">
                        <button class="btn btn-primary" name="operacion" value="enviar">Enviar</button>
                    </div>      
                </div>
            </form>`;
        }else{
            html = `<div class="alert alert-danger" role="alert">No exite un usuario con el id indicado</div>` + html;
        }
    }else if (operacion == 'enviar') {
        let actualizacionExitosa = actualizarUsuario(datosActualizar);
        if(actualizacionExitosa) {
            html = `<div class="alert alert-success" role="alert">La información del usuario ha sido actualizada!</div>` + html;
        }
        else{
            html = `<div class="alert alert-danger" role="alert">Ocurrio un error actualizando la información</div>` + html;
        }
    }
    return html;
});


let estudianteMatriculado = (idCurso) => {
    let texto = '';
    consultarEstudiantesPorCurso();
    consultarUsuariosRegistrados();
    let listaFiltrada = listaUsuriosPorCurso.filter(registro => registro.idCurso === idCurso);

    listaFiltrada.forEach(usuario => {
        let estudiante = listaUsuarios.find(user => user.id === usuario.idUsuario)
        texto = texto +
            '<tr>' +
            '<td>' + estudiante.id + '</td>' +
            '<td>' + estudiante.primerNombre + ' ' + estudiante.segundoNombre + ' ' 
                  + estudiante.primerApellido + ' ' + estudiante.segundoApellido  + '</td>' +
            '<td>' + estudiante.email + '</td>' +
            '<td>' + estudiante.telefono + '</td>' +
            '<td>' + '<button type="submit" name="button" class="btn btn-danger">Cerrar Curso<i class="fa fa-angle-right"></i></button>'+ '</td>' +
            '<tr>'
            + '<tr>'
            + `<input class="form-control" name="idEstudiante" value=${estudiante.id} type="hidden"></input>`;
            + '</tr>';
    });
    return texto;
}


hbs.registerHelper('borrarEstudiante', (infoMatricula) => {
    consultarEstudiantesPorCurso();
    let mensaje = '';
    let registro = listaUsuriosPorCurso.filter(mat => mat.idCurso != infoMatricula.idCurso && 
                                                    mat.idUsuario != infoMatricula.idEstudiante);
    if (registro.length == listaUsuriosPorCurso.length) {
        mensaje = 'No existe un estudiante con el nombre indicado';
    } else {
        listaUsuriosPorCurso = registro;
        guardarUsuarioPorCurso();
        mensaje = 'El ha eliminado el alumno del curso satisfactoriamente';
    }
    return mensaje;
});


const actualizarUsuario = (datosActualizar) => {
    consultarUsuariosRegistrados();
    let encontrado = listaUsuarios.find(buscar => buscar.id == datosActualizar.documento)
    let seActualizo = false;
    if(!encontrado) {
        seActualizo = false;
    } else{
        encontrado.id = datosActualizar.documento,
        encontrado.primerNombre = datosActualizar.nombre1,
        encontrado.segundoNombre = datosActualizar.nombre2,
        encontrado.primerApellido = datosActualizar.apellido1,
        encontrado.segundoApellido = datosActualizar.apellido2,
        encontrado.telefono = datosActualizar.telefono,
        encontrado.email = datosActualizar.email,
        encontrado.direccion = datosActualizar.direccion,
        encontrado.tipo = datosActualizar.listaDesplegable
        guardarUsuario();
        seActualizo = true;
    }
    return seActualizo;
}


const consultarEstudiantesPorCurso = () => {
    try {
        listaUsuriosPorCurso = require('../../usuariosPorCurso.json');
    } catch(error){
        listaUsuriosPorCurso = [];
    }
}


const consultarCursos = () => {
    try {
        listaCursos = require('../../cursos.json');
    } catch(error){
            listaCursos = [];
    }
}


const obtenerInformacionCurso = (idCurso) => {
    consultarCursos();
    let curso = listaCursos.filter(cur => cur.id == idCurso);
    return curso;
}


const consultarUsuariosRegistrados = () => {
    try {
    listaUsuarios = require('../../usuarios.json');
    } catch(error){
        listaUsuarios = [];
    }
}


const obtenerInformacionUsuario = (idUsuario) => {
    consultarUsuariosRegistrados();
    let usuario = listaUsuarios.filter(usr => usr.id == idUsuario);
    return usuario;
}


const insertarUsuario = (usuarioAInsertar) => {
    consultarUsuariosRegistrados();
    let respuesta = '';
    let usuario = {
        id: usuarioAInsertar.id,
        primerNombre: usuarioAInsertar.primerNombre,
        segundoNombre: usuarioAInsertar.segundoNombre,
        primerApellido: usuarioAInsertar.primerApellido,
        segundoApellido: usuarioAInsertar.segundoApellido,
        telefono: usuarioAInsertar.telefono,
        email: usuarioAInsertar.email,
        direccion: usuarioAInsertar.direccion,
        tipo: usuarioAInsertar.tipo
    };
    let duplicado = listaUsuarios.find(registro => registro.id == usuario.id)
    if(!duplicado){
        listaUsuarios.push(usuario);
        guardarUsuario();
        respuesta = "Se ha registrado satisfactoriamente.";
        return respuesta;
    }else {
        respuesta = 'Ya existe una persona registrada con el número de identificacion: ' + usuario.id;
        return respuesta;
    }
}


const guardarUsuario = () => {
    let datos = JSON.stringify(listaUsuarios);
    fs.writeFile('usuarios.json', datos, (err) => {
       if (err) throw (err);
    });
}


const guardarUsuarioPorCurso = () => {
    let datos = JSON.stringify(listaUsuriosPorCurso);
    fs.writeFile('usuariosPorCurso.json', datos, (err) => {
       if (err) throw (err);
    });
}


const guardarCurso = () => {
    let datos = JSON.stringify(listaCursos);
    fs.writeFile('cursos.json', datos, (err) => {
       if (err) throw (err);
    });
}