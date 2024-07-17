//Programa: Display LCD 16x2 e modulo I2C
//Incluir biblioteca GSM SIM800L
#include <SoftwareSerial.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

#define TRIG 7
#define ECHO 6
#define LED 13
#define TX_PIN 10
#define RX_PIN 11


float distancia;
float distAnterior = 0.0;

//Inicializa o display no endereco 0x27
LiquidCrystal_I2C lcd(0x27,16,2);
SoftwareSerial serialGSM(TX_PIN, RX_PIN);

void setup() {
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  pinMode(LED, OUTPUT);

  // Iniciar Display LCD
  lcd.init();

  // Inicia comunicacao serial com o GSM
  serialGSM.listen();
  serialGSM.begin(9600);
  delay(1000);

  Serial.begin(9600);
}

void loop() {
  digitalWrite(TRIG,1);
  delayMicroseconds(10);
  digitalWrite(TRIG,0);
  
  distancia = pulseIn(ECHO,1) / 58.0;

  if(distancia != distAnterior){
    Serial.print(distancia);
    Serial.println(" cm");
    distAnterior = distancia;
  }

  if(distancia <= 50) {
    digitalWrite(LED, HIGH);
    serialGSM.begin(9600);
    delay(1000);
    serialGSM.println("ATD+5551983363606;");
    Serial.println("Enviando mensagem");
    delay(1000);
  } else if (distancia > 10) {
    digitalWrite(LED, LOW);
  }

  lcd.setBacklight(HIGH);
  lcd.setCursor(0,0);
  lcd.print("Nivel da Agua");
  lcd.setCursor(0,1);
  lcd.print(distancia);
  
  delay(1000);
}
