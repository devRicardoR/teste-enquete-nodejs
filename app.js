const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const bodyParser = require('body-parser');
const path = require('path');

// Configurações
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.set('io', io);

// Rotas
const enqueteRoutes = require('./routes/enqueteRoutes');
app.use('/', enqueteRoutes);

// Inicia o servidor
http.listen(3000, () => {
    console.log('Servidor rodando em http://localhost:3000');
});