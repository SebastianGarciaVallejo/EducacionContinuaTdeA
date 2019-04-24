process.env.PORT = process.env.PORT || 5000;
process.env.NODE_ENV = process.env.NODE_ENV || 'local';

let urlDB
if (process.env.NODE_ENV === 'local'){
	urlDB = 'mongodb://localhost:27017/asignatura';
}
else {
    //urlDB = 'mongodb+srv://nodejstdea:nodejstdea@nodejstdea-4jn4i.mongodb.net/asignatura?retryWrites=true'
    urlDB = 'mongodb+srv://jecarvajal:jecarvajal@jecarvajal-gqpw2.mongodb.net/asignatura?retryWrites=true'
}

process.env.URLDB = urlDB