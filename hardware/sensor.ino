#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h> // Make sure to install "ArduinoJson" by Benoit Blanchon via Library Manager
#include <SPI.h>
#include <SD.h>
#include <DHT.h>
#include <Wire.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include "FS.h"
#include "SPIFFS.h"

// Hardware Configuration Pin Definitions
#define SD_CS_PIN    5
#define DHT_PIN      14   
#define LDR_PIN      34   
#define DHT_TYPE     DHT22

// Network Settings
const char* ssid = "S23";
const char* password = "abcd1245";
const char* serverEndpoint = "http://YOUR_BACKEND_IP_OR_URL/api/telemetry";

// Geolocation API Configurations (Google Geolocation Endpoint example)
// 100% Free IP Geolocation Endpoint (No API Key Required)
const char* geoEndpoint = "http://ip-api.com/json/";
const char* geolocationApiKey = "";

DHT dht(DHT_PIN, DHT_TYPE);
Adafruit_MPU6050 mpu;

// Dynamic Location Variables calculated by the ESP32
float currentLat = 0.0000;
float currentLng = 0.0000;

const size_t SPIFFS_MAX_CAPACITY = 3 * 1024 * 1024;

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n--- Initializing Edge Geolocation & Logging System ---");

  dht.begin();
  if (!mpu.begin()) Serial.println("Warning: MPU-6050 not detected.");
  if (!SPIFFS.begin(true)) Serial.println("SPIFFS Mount Failed!");
  if (!SD.begin(SD_CS_PIN)) Serial.println("SD Module not detected.");

  WiFi.begin(ssid, password);
  Serial.print("Connecting to Wi-Fi");
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 10) {
    delay(1000);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nConnected! IP: " + WiFi.localIP().toString());
    
    // Trigger the on-chip location calculation immediately upon network connection
    updateLocationOnChip();
    
    syncOfflineData();
  } else {
    Serial.println("\nRunning in OFFLINE mode. Using last known/default coordinates.");
  }
}

void loop() {
  float temp = dht.readTemperature();
  float hum = dht.readHumidity();
  int lightRaw = analogRead(LDR_PIN);

  // Periodically re-scan location every few cycles if needed, or stick to initial lock
  if (WiFi.status() == WL_CONNECTED && currentLat == 0.0000) {
    updateLocationOnChip();
  }

  // Construct the final payload containing the coordinates resolved by the ESP32
  String payload = "{\"lat\":" + String(currentLat, 4) + 
                   ",\"lng\":" + String(currentLng, 4) + 
                   ",\"temp\":" + String(temp) + 
                   ",\"humidity\":" + String(hum) + 
                   ",\"light\":" + String(lightRaw) + 
                   ",\"timestamp\":" + String(millis()) + "}";

  if (WiFi.status() == WL_CONNECTED) {
    bool success = sendTelemetryToServer(payload);
    if (!success) {
      handleOfflineStorage(payload);
    } else {
      syncOfflineData();
    }
  } else {
    handleOfflineStorage(payload);
  }

  delay(5000); 
}

// 🌐 The Self-Contained Edge Geolocation Engine
// 🌐 Free, Zero-Key Edge Geolocation Engine
void updateLocationOnChip() {
  Serial.println("\nQuerying network routing coordinates for geolocation...");

  HTTPClient http;
  // Connect directly to the free ip-api endpoint
  http.begin(geoEndpoint);

  int httpResponseCode = http.GET();
  
  if (httpResponseCode == 200) {
    String response = http.getString();
    
    // Allocate memory to parse the flat incoming JSON payload
    StaticJsonDocument<512> replyDoc;
    DeserializationError error = deserializeJson(replyDoc, response);
    
    if (!error) {
      // Check if the API successfully resolved the network routing location
      String status = replyDoc["status"];
      if (status == "success") {
        currentLat = replyDoc["lat"];
        currentLng = replyDoc["lon"];
        
        Serial.print("🎯 Location Resolved On-Chip (IP-Based): Lat: ");
        Serial.print(currentLat, 4);
        Serial.print(" | Lng: ");
        Serial.println(currentLng, 4);
        Serial.print("📍 Region: ");
        Serial.print((const char*)replyDoc["city"]);
        Serial.print(", ");
        Serial.println((const char*)replyDoc["regionName"]);
      } else {
        Serial.println("Error: Geolocation endpoint returned a failing status.");
      }
    } else {
      Serial.println("Error parsing incoming geolocation JSON data.");
    }
  } else {
    Serial.print("Error communicating with Geolocation API. HTTP Code: ");
    Serial.println(httpResponseCode);
  }
  http.end();
}

bool sendTelemetryToServer(String jsonPayload) {
  HTTPClient http;
  http.begin(serverEndpoint);
  http.addHeader("Content-Type", "application/json");
  int httpResponseCode = http.POST(jsonPayload);
  http.end();
  return (httpResponseCode == 200 || httpResponseCode == 201);
}

void handleOfflineStorage(String payload) {
  size_t usedSPIFFS = SPIFFS.usedBytes();
  if (usedSPIFFS < SPIFFS_MAX_CAPACITY) {
    File spiffsFile = SPIFFS.open("/backup.json", FILE_APPEND);
    if (spiffsFile) {
      spiffsFile.println(payload);
      spiffsFile.close();
      Serial.println("✓ Telemetry backed up to Internal Flash Memory.");
    }
  } else {
    File sdFile = SD.open("/overflow.json", FILE_APPEND);
    if (sdFile) {
      sdFile.println(payload);
      sdFile.close();
      Serial.println("⚠ Storage Cascade: Telemetry backed up to MicroSD Card.");
    }
  }
}

void syncOfflineData() {
  if (SPIFFS.exists("/backup.json")) {
    File spiffsFile = SPIFFS.open("/backup.json", FILE_READ);
    if (spiffsFile) {
      while (spiffsFile.available()) {
        String line = spiffsFile.readStringUntil('\n');
        line.trim();
        if (line.length() > 0) sendTelemetryToServer(line);
      }
      spiffsFile.close();
      SPIFFS.remove("/backup.json");
      Serial.println("✓ Internal Flash synchronized.");
    }
  }
  if (SD.exists("/overflow.json")) {
    File sdFile = SD.open("/overflow.json", FILE_READ);
    if (sdFile) {
      while (sdFile.available()) {
        String line = sdFile.readStringUntil('\n');
        line.trim();
        if (line.length() > 0) sendTelemetryToServer(line);
      }
      sdFile.close();
      SD.remove("/overflow.json");
      Serial.println("✓ External SD storage synchronized.");
    }
  }
}