const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const estudianteSchema = new Schema({
    nombre : {
        type    : String,
        require : true 
    },
    password : {
        type    : String,
        require : true 
    },
    telefono : {
        type    : Number,
        require : true 
    },
    documento : {
        type    : Number,
        require : true 
    },
    correo      : {
        type    : String,   
        require : true 
    },
    tipoEstudiante      : {
        type    : String,   
        require : true 
    },
});

const Estudiante = mongoose.model('Estudiante', estudianteSchema);

module.exports = Estudiante