#include <EEPROM.h>

// —— CONFIG ——
const int   NUM_SENSORS       = 5;
const int   sensorPins[NUM_SENSORS] = { A0, A1, A2, A3, A4 };
const int   ledPins   [NUM_SENSORS] = { 2, 3, 4, 5, 6 };    // LEDs for ENTER/EXIT feedback
const int   CALIB_SAMPLES     = 200;

// thresholds & smoothing (adjustable & persistent)
float enterThresh           = 2.0f;   // % to trigger ENTER
float exitThresh            = 1.0f;   // % to trigger EXIT
float alphaRise             = 0.1f;   // EMA factor on rising edge
float alphaFall             = 0.5f;   // EMA factor on falling edge

// timing
const unsigned long PLOT_INTERVAL      = 100;   // ms between plot lines
const unsigned long FAST_SCAN_INTERVAL = 20;    // when active
const unsigned long SLOW_SCAN_INTERVAL = 500;   // when idle

// EEPROM layout for offsets + tuning persistence
const int   EEPROM_FLAG_ADDR      = 0;
const byte  CALIB_DONE_FLAG       = 0xAA;
const int   EEPROM_OFFSET_START   = 1;    // bytes 1–10 hold zero offsets

const int   EEPROM_TUNE_FLAG_ADDR = 20;
const byte  TUNE_DONE_FLAG        = 0x55;
const int   EEPROM_ENTER_ADDR     = 21;                // 4 bytes
const int   EEPROM_EXIT_ADDR      = EEPROM_ENTER_ADDR + sizeof(float);       // 25
const int   EEPROM_ALPHAR_ADDR    = EEPROM_EXIT_ADDR  + sizeof(float);       // 29
const int   EEPROM_ALPHAF_ADDR    = EEPROM_ALPHAR_ADDR + sizeof(float);       // 33

float FULL_SCALE_FORCE;   // chosen at runtime: 5, 15 or 50 N

int   zeroOffset[NUM_SENSORS];
float smoothedPct[NUM_SENSORS];
bool  inAlert[NUM_SENSORS];
float instPct[NUM_SENSORS];  // latest instantaneous % for plotting

unsigned long lastScan = 0;
unsigned long lastPlot = 0;

//— sensor conversion functions —
float rawToNewtons(int y) {
  return 0.3202f * exp(0.0077f * y) - 0.32f;
}

float forceToPercent(float f) {
  float pct = (f / FULL_SCALE_FORCE) * 100.0f;
  return pct < 0.0f ? 0.0f :
         pct > 100.0f ? 100.0f :
         pct;
}

// average “zero” baseline
int calibrateZero(int pin) {
  long sum = 0;
  for (int i = 0; i < CALIB_SAMPLES; i++) {
    sum += analogRead(pin);
    delay(2);
  }
  return sum / CALIB_SAMPLES;
}

struct Sensor {
  uint8_t pin;
  int     zeroOffset;
  float   smoothedPct;
  bool    inAlert;

  Sensor(uint8_t p)
    : pin(p), zeroOffset(0),
      smoothedPct(0), inAlert(false)
  {}

  void begin() {
    // load or compute zero-offset
    if (EEPROM.read(EEPROM_FLAG_ADDR) == CALIB_DONE_FLAG) {
      byte hi = EEPROM.read(EEPROM_OFFSET_START + (pin - A0)*2);
      byte lo = EEPROM.read(EEPROM_OFFSET_START + (pin - A0)*2 + 1);
      zeroOffset = (hi << 8) | lo;
    } else {
      zeroOffset = calibrateZero(pin);
      int val = zeroOffset;
      EEPROM.write(EEPROM_OFFSET_START + (pin - A0)*2,     highByte(val));
      EEPROM.write(EEPROM_OFFSET_START + (pin - A0)*2 + 1, lowByte(val));
    }
    Serial.print("Sensor "); Serial.print(pin - A0);
    Serial.print(" zeroOffset = "); Serial.println(zeroOffset);

    // prime smoothing & alert
    int raw0 = max(analogRead(pin) - zeroOffset, 0);
    float pct0 = forceToPercent(rawToNewtons(raw0));
    smoothedPct = pct0;
    inAlert     = (pct0 >= enterThresh);
    instPct[pin - A0] = pct0;
  }

  void updateAndReport() {
    int idx = pin - A0;
    int raw = max(analogRead(pin) - zeroOffset, 0);
    float pct = forceToPercent(rawToNewtons(raw));
    instPct[idx] = pct;

    // EMA smoothing with asymmetric α
    float alpha = (pct > smoothedPct) ? alphaRise : alphaFall;
    smoothedPct = alpha * pct + (1 - alpha) * smoothedPct;

    // hysteresis ENTER / EXIT + LED feedback
    if (!inAlert && smoothedPct >= enterThresh) {
      Serial.print("Sensor "); Serial.print(idx);
      Serial.print(" ENTER: raw="); Serial.print(raw);
      Serial.print(", pct="); Serial.print(pct, 1);
      Serial.println("%");
      digitalWrite(ledPins[idx], HIGH);
      inAlert = true;
    }
    else if (inAlert && smoothedPct <= exitThresh) {
      Serial.print("Sensor "); Serial.print(idx);
      Serial.print(" EXIT:  raw="); Serial.print(raw);
      Serial.print(", pct="); Serial.print(pct, 1);
      Serial.println("%");
      digitalWrite(ledPins[idx], LOW);
      inAlert = false;
    }
  }
};

Sensor sensors[NUM_SENSORS] = {
  Sensor(A0), Sensor(A1), Sensor(A2),
  Sensor(A3), Sensor(A4)
};

void setup() {
  Serial.begin(9600);
  while (!Serial);

  // prepare LED pins
  for (int i = 0; i < NUM_SENSORS; i++) {
    pinMode(ledPins[i], OUTPUT);
    digitalWrite(ledPins[i], LOW);
  }

  // choose full-scale
  Serial.println("\nChoose full-scale range:");
  Serial.println("  1 →  5 N");
  Serial.println("  2 → 15 N");
  Serial.println("  3 → 50 N");
  Serial.print("Enter 1,2 or 3: ");
  while (!Serial.available());
  char c = Serial.read();
  FULL_SCALE_FORCE = (c == '2' ? 15.0f : (c == '3' ? 50.0f : 5.0f));
  Serial.print("Using full-scale = "); Serial.print(FULL_SCALE_FORCE, 1);
  Serial.println(" N\n");

  // calibration persistence flag
  if (EEPROM.read(EEPROM_FLAG_ADDR) != CALIB_DONE_FLAG) {
    EEPROM.write(EEPROM_FLAG_ADDR, CALIB_DONE_FLAG);
    Serial.println("Performing initial calibration...");
  } else {
    Serial.println("Loading calibration from EEPROM...");
  }

  // load or prime tuning params
  if (EEPROM.read(EEPROM_TUNE_FLAG_ADDR) == TUNE_DONE_FLAG) {
    EEPROM.get(EEPROM_ENTER_ADDR,   enterThresh);
    EEPROM.get(EEPROM_EXIT_ADDR,    exitThresh);
    EEPROM.get(EEPROM_ALPHAR_ADDR,  alphaRise);
    EEPROM.get(EEPROM_ALPHAF_ADDR,  alphaFall);
    Serial.println("Loaded tuning from EEPROM:");
    Serial.print(" ENTER_THRESH="); Serial.println(enterThresh);
    Serial.print(" EXIT_THRESH=");  Serial.println(exitThresh);
    Serial.print(" ALPHA_RISE=");  Serial.println(alphaRise);
    Serial.print(" ALPHA_FALL=");  Serial.println(alphaFall);
  } else {
    Serial.println("Using default tuning values.");
  }

  // initialize sensors
  for (auto &s : sensors) s.begin();

  // help menu
  Serial.println("\nEnter commands:");
  Serial.println("  ET x   → set ENTER threshold (%)");
  Serial.println("  XT x   → set EXIT threshold (%)");
  Serial.println("  AR x   → set ALPHA_RISE");
  Serial.println("  AF x   → set ALPHA_FALL");
  Serial.println("e.g. ET 3.5  ⏎\n");
  Serial.setTimeout(50);
}

void loop() {
  unsigned long now = millis();

  // handle tuning commands
  if (Serial.available()) {
    String cmd = Serial.readStringUntil('\n');
    cmd.trim();
    if (cmd.startsWith("ET ")) {
      enterThresh = cmd.substring(3).toFloat();
      EEPROM.put(EEPROM_ENTER_ADDR, enterThresh);
      EEPROM.write(EEPROM_TUNE_FLAG_ADDR, TUNE_DONE_FLAG);
      Serial.print("ENTER threshold set to "); Serial.print(enterThresh); Serial.println("%");
    }
    else if (cmd.startsWith("XT ")) {
      exitThresh = cmd.substring(3).toFloat();
      EEPROM.put(EEPROM_EXIT_ADDR, exitThresh);
      EEPROM.write(EEPROM_TUNE_FLAG_ADDR, TUNE_DONE_FLAG);
      Serial.print("EXIT threshold set to "); Serial.print(exitThresh); Serial.println("%");
    }
    else if (cmd.startsWith("AR ")) {
      alphaRise = cmd.substring(3).toFloat();
      EEPROM.put(EEPROM_ALPHAR_ADDR, alphaRise);
      EEPROM.write(EEPROM_TUNE_FLAG_ADDR, TUNE_DONE_FLAG);
      Serial.print("ALPHA_RISE set to "); Serial.println(alphaRise);
    }
    else if (cmd.startsWith("AF ")) {
      alphaFall = cmd.substring(3).toFloat();
      EEPROM.put(EEPROM_ALPHAF_ADDR, alphaFall);
      EEPROM.write(EEPROM_TUNE_FLAG_ADDR, TUNE_DONE_FLAG);
      Serial.print("ALPHA_FALL set to "); Serial.println(alphaFall);
    }
    else {
      Serial.println("Unknown command");
    }
  }

  // dynamic sampling interval
  bool anyActive = false;
  for (int i = 0; i < NUM_SENSORS; i++) {
    if (instPct[i] > exitThresh) { anyActive = true; break; }
  }
  unsigned long scanInterval = anyActive ? FAST_SCAN_INTERVAL : SLOW_SCAN_INTERVAL;

  // ENTER/EXIT detection & reporting
  if (now - lastScan >= scanInterval) {
    for (auto &s : sensors) s.updateAndReport();
    lastScan = now;
  }

  // Serial Plotter output
  if (now - lastPlot >= PLOT_INTERVAL) {
    for (int i = 0; i < NUM_SENSORS; i++) {
      Serial.print(instPct[i], 1);
      if (i < NUM_SENSORS - 1) Serial.print('\t');
    }
    Serial.println();
    lastPlot = now;
  }
}
