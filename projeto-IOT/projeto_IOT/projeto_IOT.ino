#include <SoftwareSerial.h>

//Programa: Display LCD 16x2 e modulo I2C
#include <LiquidCrystal_I2C.h>

#define TRIG 7
#define ECHO 6
#define LED 5

float distancia;
float distAnterior = 0.0;

//Inicializa o display no endereco 0x27
LiquidCrystal_I2C lcd(0x27, 16, 2);

void setup() {
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  pinMode(LED, OUTPUT);

  lcd.init();
  lcd.clear();
  lcd.backlight();

  Serial.begin(9600);
}

void loop() {
  digitalWrite(TRIG, 1);
  delayMicroseconds(10);
  digitalWrite(TRIG, 0);

  distancia = pulseIn(ECHO, 1) / 58.0;

  if (distancia < 10) {
    digitalWrite(LED, HIGH);
  } else {
    digitalWrite(LED, LOW);
  }

  lcd.setCursor(2, 0);
  lcd.print("NIVEL DA AGUA");

  lcd.setCursor(2, 1);
  lcd.print(distancia);

  Serial.println(distancia);
  delay(1000);
}
