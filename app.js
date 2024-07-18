const express = require('express');
const http = require('http');
const fs = require('fs');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const socketIo = require('socket.io');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');

// Cria uma instância do Express
const app = express();

//configurando o middleware body-parser para analisar dados do formulario HTML
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Conectando ao banco de dados MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/projeto_IOT');
const conexao = mongoose.connection;

conexao.on('error', console.error.bind(console, 'Erro de conexão com o MongoDB:'));
conexao.once('open', () => {
    console.log('Conectado ao banco de dados MongoDB');
});

// Definindo o schema e o modelo para os documentos de clientes
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true }
})

const User = mongoose.model('User', userSchema);

// Configuração para servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'server')));

// Servir o arquivo index.html
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Rota para processar o formulário via AJAX
app.post('/formulario', async (req, res) => {
    try {
      const { name, phone } = req.body;
      const newUser = new User({ name, phone });
      const savedUser = await newUser.save();
      res.json({ success: true, message: `Usuário ${savedUser.name} cadastrado com sucesso!` });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
  });

//rota para lidar com o envio do formulario
app.post('/formulario'), (req, res) => {
    const name = req.body.name;
    const phone = req.body.phone;
    res.send(`Usuário: ${name}, phone: ${phone}`)
}

// Rota para o caminho raiz
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html'); // Envia o arquivo HTML
});

// Cria o servidor HTTP
const server = http.createServer(app);

// Configura o Socket.IO
const io = socketIo(server);

// Configura a porta serial
const port = new SerialPort({ path: 'COM5', baudRate: 9600 });
const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

io.on('connection', (socket) => {
    console.log('Node.js is listening');

    // Enviar dados da porta serial para o cliente
    parser.on('data', (data) => {
        console.log(data);
        socket.emit('data', data);
    });
});

// Inicia o servidor na porta 3000
server.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
