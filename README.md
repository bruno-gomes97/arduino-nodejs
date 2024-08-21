# Sistema de Comunicação de Emergência

Este projeto visa desenvolver um sistema de comunicação de emergência utilizando um Arduino, sensor ultrassônico e um display LCD. O sensor ultrassônico é utilizado para captar o nível de água em tempo real e enviar esses dados para um aplicativo móvel, permitindo que a população acompanhe o nível da água remotamente.

<hr>

### 📋 Componentes necessários
Arduino UNO, Sensor Ultrassônico (HC-SR04), Display LCD 16x2 e Placa de Ensaio (Protoboard).

### ⚙️ Conexões
Conecte os pinos GND (negativo) e 5v (positivo) do arduino em uma placa Protoboard. Conecte os pinos SDA e SCL do LCD aos pinos SDA e SCL do Arduino e os prinos GND (negativo) e VCC (positivo) na Protoboard. Em seguida, conecte o sensor ultrassônico, com o pino TRIG conectado ao pino 7 do Arduino e o pino ECHO conectado ao pino 6 do Arduino, os pinos GND (negativo) e VCC (positivo) na Protoboard. Conecte os pinos do. Carregue o código na placa Arduino Uno e execute o programa.

<hr>

## 🚀 Tecnologias Utilizadas
* **Front-end:** HTML5, CSS3, JavaScript
* **Back-end:** Node.js, Express.js
* **Banco de Dados:** MongoDB Compass
* **Outras Ferramentas:** Git, npm

<hr>

### ⚙️ Instalação
* Node.js
* npm (geralmente instalado junto com o Node.js)
* MongoDB

### Arduino IDE

```ruby

#include <LiquidCrystal_I2C.h>

#define TRIG 7
#define ECHO 6
#define LED 5

float distancia;
float distAnterior = 0.0;

LiquidCrystal_I2C lcd(0x27,16,2);

void setup() {
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  pinMode(LED, OUTPUT);

  lcd.init(); 
  lcd.clear();
  lcd.backlight();

  Serial.begin(9600);
}

void loop(){
  digitalWrite(TRIG, 1);
  delayMicroseconds(10);
  digitalWrite(TRIG, 0);

  distancia = pulseIn(ECHO, 1) / 58.0;

  if (distancia != distAnterior || distancia < 50) {
    if (distancia != distAnterior) {
        Serial.println(distancia);
        distAnterior = distancia;
    }

    if (distancia < 10) {
        digitalWrite(LED, HIGH);
    } else {
        digitalWrite(LED, LOW);
    }
  }

  lcd.setCursor(2,0);
  lcd.print("NIVEL DA AGUA");
  
  lcd.setCursor(2,1);
  lcd.print(distancia);
  
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
