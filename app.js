const express = require('express');
const http = require('http');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const socketIo = require('socket.io');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const accountSid = CONTA_SID;
const authToken = TOKEN_AUTENT;

const client = require('twilio')(accountSid, authToken);

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

let alertEnviado = false;

io.on('connection', (socket) => {
    console.log('Node.js is listening');

    // Enviar dados da porta serial para o cliente
    parser.on('data', (data) => {
        console.log(data);
        socket.emit('data', data);

        if (data < 10 && !alertEnviado) {
            async function sendSMS(to, from, body) {
                try {
                    if (!body) {
                        throw new Error('O corpo da mensagem é obrigatório.');
                    }

                    const message = await client.messages.create({
                        body: body,
                        from: from,
                        to: to
                    });
                    console.log(message.sid);
                } catch (error) {
                    console.error('RestException [Error]:', error);
                }
            }

            // instanciar objeto Date() para adicionar dia e hora
            const data = new Date();
            const dia = data.getDate();
            const mes = data.getMonth() + 1;
            const ano = data.getFullYear();
            const hora = data.getHours();
            const minuto = data.getMinutes() > 10 ? Number(`0${data.getMinutes()}`) : data.getMinutes();
            
            // enviar a mensagem de alerta
            sendSMS(NUM_CEL, NUM_TWILIO, `ALERTA DE ENCHENTE!\nÚltima atualização: ${dia}/${mes}/${ano} - ${hora}:${minuto}`);

            alertEnviado = true;

            // Redefinir o estado do alerta após 5 minutos
            setTimeout(() => {
                alertEnviado = false;
            }, 300000); // 300000 milissegundos = 5 minutos
        }
    });
});

// Inicia o servidor na porta 3000
server.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
