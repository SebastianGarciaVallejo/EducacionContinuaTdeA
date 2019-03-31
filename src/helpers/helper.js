const hbs = require('hbs');
const fs = require('fs'); 
listaUsuarios = [];
listaCursos = [];

hbs.registerHelper('registarUsuario', (usuario) => {
    let respuesta = insertarUsuario(usuario);
    return respuesta;
});

hbs.registerHelper('listarCursos', () => {
    

    try {
        listaCursos = require('../../cursos.json');
    } catch(error){
            listaCursos = [];
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

const consultarUsuariosRegistrados = () => {
    try {
    listaUsuarios = require('../../usuarios.json');
    } catch(error){
        listaUsuarios = [];
    }
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