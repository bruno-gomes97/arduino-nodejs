# Sistema de Comunicação de Emergência

Este projeto visa desenvolver um sistema de comunicação de emergência utilizando um Arduino, sensor ultrassônico e um display LCD. O sensor ultrassônico é utilizado para captar o nível de água em tempo real e enviar esses dados para um aplicativo móvel, permitindo que a população acompanhe o nível da água remotamente.

<hr>

### 📋 Componentes necessários
Arduino UNO, Sensor ultrassônico, Display LCD, Placa de Ensaio (Protoboard) e Potenciômetro 10k.

### ⚙️ Conexões
Conecte os pinos GND (negativo) e 5v (positivo) do arduino em uma placa Protoboard. Conecte os pinos SDA e SCL do LCD aos pinos SDA e SCL do Arduino e o pino V0 ao pino do meio (limpador) do potenciômetro. Em seguida, conecte o sensor ultrassônico, com o pino TRIG conectado ao pino 7 do Arduino e o pino ECHO conectado ao pino 6 do Arduino. Conecte os pinos do terminal 1 (negativo) e o terminal 2 (positivo) do potenciômetro na Protoboard, respectivamente. Carregue o código na placa Arduino Uno e execute o programa.

<hr>

## 🚀 Começando

### HTML e Javascript

Criar um arquivo chamado `index.html`

```ruby
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AlertNet Solution</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.1.2/socket.io.js"></script>
</head>
<style>
    body,
    html {
        margin: 0;
        padding: 0;
        overflow: hidden;
        text-align: center;
        background-color: #90bfde;
        font-family: Arial, Helvetica, sans-serif
    }

    #nivelAgua {
        background-color: #fff;
        font-size: 20px;
        font-weight: bold;
        width: 100px;
        height: 30px;
        margin: 0 auto;
        padding: 1rem;
        border-radius: 5px;
    }

    #contato {
        background-color: #fff;
        width: 30%;
        padding: 1rem;
        border-radius: 5px;
        margin: 10px auto;
    }

    #contato ul li {
        list-style: none;
        font-size: 18px;
        margin: 5px 0;
        font-weight: bold;
    }

    form {
        width: 13%;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 10px;
        text-align: start;
    }

    form label {
        font-size: 18px;
    }

    form input {
        padding: 10px;
        border-radius: 5px;
        border: none;
    }

    form button {
        padding: 10px;
        font-weight: bold;
        font-size: 18px;
        border: 2px solid #90bfde;
        border-radius: 5px;
        background-color: #fff;
        color: #000;
        cursor: pointer;
    }
</style>
<body>
    <header>
        <div id="logo">
            <img src="logo.jpg" alt="Imagem logo empresa">
        </div>
    </header>

    <h1>NÍVEL DA ÁGUA EM TEMPO REAL:</h1>

    <div id="nivelAgua"></div>

    <section id="contato">
        <h2>CONTATOS</h2>
        <h3>Serviços de Urgência</h3>
        <ul>
            <li>Polícia Militar: 190</li>
            <li>Corpo de Bombeiros: 193</li>
            <li>Serviço de Atendimento Móvel de Urgência: 192</li>
            <li>Defesa civíl: 190</li>
        </ul>
    </section>

    <h2>Cadastre seu número aqui para receber as notificações:</h2>
    <form action="/formulario" method="post" id="form">
        <label for="name">Nome:</label>
        <input type="text" id="name" name="name" placeholder="Digite seu nome">
        <label for="phone">Telefone:</label>
        <input type="text" id="phone" name="phone" placeholder="Digite seu telefone">
        <button type="submit">Enviar</button>
    </form>
</body>
<script>
    const socket = io();
    const form = document.getElementById("form");

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new FormData(form);

        fetch('/formulario', {
            method: 'POST',
            body: JSON.stringify(Object.fromEntries(formData)),
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert(data.message);
                    form.reset(); // Limpa os campos do formulário
                } else {
                    alert('Erro ao salvar os dados: ' + data.message);
                }
            })
            .catch(error => {
                alert('Erro ao enviar o formulário: ' + error.message);
            });
    })

    socket.on('data', function (data) {
        console.log(data);

        document.getElementById('nivelAgua').innerHTML = data;

        if(data > 30) {
            document.getElementById('nivelAgua').style.background = 'red';
        }

        if(data < 30) {
            document.getElementById('nivelAgua').style.background = 'white';
        }
    })
</script>

</html>
```
O código acima cria uma página da web com informações do nível da água em tempo real e uma lista de contatos para emergência. Quando o nível da água que está sendo captado pelo sensor ultrassônico estiver maior que 30, o quadrado ficará vermelho e isso mostra que está em zona de risco.

### Node.js Server

Antes de configurarmos o servidor Node.js, precisamos saber o nome da porta serial à qual o seu Arduino está conectado. Você pode encontrar o nome da sua porta serial, em um Mac, usando o Terminal e digitando o seguinte comando:

```
ls /dev/{tty,cu}.*
```
Ou usando o próprio Arduino IDE

```
Barra de ferramentas > Tools > Port > COM "número da porto" Ex.: COM5
```
Criar um arquivo chamado `app.js`

```ruby
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


```
O código acima escuta uma mensagem do Arduino através da porta USB e então envia uma mensagem para o HTML/JavaScript usando Socket.io.

### Arduino IDE

```ruby

#define TRIG 7
#define ECHO 6

float distancia;
float distAnterior = 0.0;

void setup() {
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  Serial.begin(9600);
}

void loop() {
  digitalWrite(TRIG,1);
  delayMicroseconds(10);
  digitalWrite(TRIG,0);
  
  distancia = pulseIn(ECHO,1) / 58.0;

  if(distancia != distAnterior){
    Serial.println(distancia);
    distAnterior = distancia;
  }
  
  delay(100);
}

```

Você precisará montar o seguinte circuito usando seu Arduino:

<img src="https://github.com/bruno-gomes97/arduino-nodejs/blob/main/img/prot_tinkercad.png" alt="Imagem prototipo">

> <p>Visualize o circuito no Tinkercad:</p>
> <p>https://www.tinkercad.com/things/5a78ONb0fTA-sistema-de-comunicacao-de-emergencia/editel</p>


<hr>

## 🛠️ Construído com

* [Visual Studio Code](http://(https://code.visualstudio.com/))
* [Tinkercad](https://https://www.tinkercad.com/) 
* [Arduino IDE](https://https://www.arduino.cc/en/software) 
* [Nodejs](https://https://nodejs.org/pt)
* [SerialPort NPM](https://https://www.npmjs.com/package/serialport)
* [Socket.io](https://https://(https://socket.io/))
* [MongoDB Compass](https://www.mongodb.com/products/tools/compass)
