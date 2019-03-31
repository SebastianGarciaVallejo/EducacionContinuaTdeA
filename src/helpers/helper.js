const hbs = require('hbs');
const fs = require('fs'); 
listaUsuarios = [];

hbs.registerHelper('registarUsuario', (usuario) => {
    let respuesta = insertarUsuario(usuario);
    return respuesta;
});


const consultarUsuariosRegistrados = () => {
    try {
    listaUsuarios = require('../../usuarios.json');
    console.log('Estoy en el try');
    //listaEstudiantes = JSON.parse(fs.readFileSync('listado.json'));
    // Esta funcion se utiliza cuando el archivo se actualiza asincronamentre.
    } catch(error){
        listaUsuarios = [];
        console.log('Estoy en el catch');
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
    console.log('Datos:');
    console.log(datos);

    fs.writeFile('usuarios.json', datos, (err) => {
       if (err) throw (err);
       console.log('Archivo creado con exito');
    });
}