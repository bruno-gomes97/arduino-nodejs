const express = require('express');
const http = require('http');
const fs = require('fs');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const socketIo = require('socket.io');

// Cria uma instância do Express
const app = express();

// Servir o arquivo index.html
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
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
