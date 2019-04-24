const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cursoXEstudiante = new Schema({
    idCurso : {
        type    : Number,
        require : true 
    },
    idEstudiante : {
        type    : Number,
        require : true 
    } 
});

const CursoXEstudiante = mongoose.model('CursoXEstudiante', cursoXEstudiante);

module.exports = CursoXEstudiante