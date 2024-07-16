# Sistema de Comunicação de Emergência

Para enfrentar este problema de comunicação e alerta, desenvolvemos um sistema de comunicação de emergência inovador. Este sistema utiliza sensores para monitorar o nível da água em áreas propensas a enchentes. Quando o nível da água atinge um ponto crítico, uma mensagem de alerta é imediatamente enviada aos moradores cadastrados através de um aplicativo. Dentro do aplicativo estará infomações como: nível da água em tempo real e números de emergência.

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
</body>
<script>
    const socket = io();

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
