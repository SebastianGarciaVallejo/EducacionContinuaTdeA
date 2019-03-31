const hbs = require('hbs');
const fs = require('fs'); 
listaUsuarios = [];
listaCursos = [];
listaUsuriosPorCurso = [];

hbs.registerHelper('registarUsuario', (usuario) => {
    let respuesta = insertarUsuario(usuario);
    return respuesta;
});

hbs.registerHelper('listarCursos', () => {
    consultarCursos();
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

    listaCursos.forEach(curso => {
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
    let usuarioXCurso = {
        idCurso:        informacionCurso[0].id,
        nombreCurso:    informacionCurso[0].nombre,
        idUsuario:      informacionUsuario[0].id,
        nombreUsuario:  informacionUsuario[0].primerNombre,
        email:          informacionUsuario[0].email,
        telefono:       informacionUsuario[0].telefono
    };
    let duplicado = listaUsuriosPorCurso.find(registro => registro.idCurso == usuarioXCurso.idCurso
                                                    && registro.idUsuario == usuarioXCurso.idUsuario)
    if(!duplicado){
        listaUsuriosPorCurso.push(usuarioXCurso);
        guardarUsuarioPorCurso();
        mensaje = "Se ha inscrito en el curso satisfactoriamente.";
    }else {
        mensaje = 'El aspirante ' + usuarioXCurso.nombreUsuario + ' con número de identificación ' +
                  usuarioXCurso.idUsuario + ' ya esta inscrito en el curso ' + usuarioXCurso.nombreCurso;
    }
    return mensaje;
});

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