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


const eliminar = (nombre) => {
    consultarUsuariosRegistrados();
    let nuevo = listaEstudiantes.filter(mat => mat.nombre != nombre);
    if (nuevo.length == listaEstudiantes.length) {
    } else {
        listaEstudiantes = nuevo;
        guardar();
    }
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