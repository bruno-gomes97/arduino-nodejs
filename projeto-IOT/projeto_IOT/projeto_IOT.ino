
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
