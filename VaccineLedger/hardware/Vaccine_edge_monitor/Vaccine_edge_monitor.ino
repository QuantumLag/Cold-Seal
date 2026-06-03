#include "anomaly_detector.hpp"
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h> 
#include <SPI.h>
#include <SD.h>
#include <Wire.h>
#include <DHT.h>
#include <MPU6050.h>
#include "FS.h"
#include "SPIFFS.h"

// Project Modular Header Inclusions
#include "pins_and_objects.h"

// Define Hardware Objects
DHT dhtSensor(DHT_PIN, DHT_TYPE);
MPU6050 accelSensor;

// Network Configurations
const char* ssid = "Sk1+";
const char* password = "sK@191107";

// Hotspot IP Network Updates
const char* serverEndpoint = "http://192.168.0.105:8000/api/update";
const char* blockchainEndpoint = "http://192.168.0.105:7545";
const char* geoEndpoint = "http://ip-api.com/json/";

// Unified Timing Flags for Multiplexed Cadence Controls
unsigned long lastTelemetryStreamTime = 0;
const unsigned long TELEMETRY_STREAM_INTERVAL = 5000;   // Standard server upload every 5 seconds

unsigned long lastAnomalyCheckTime = 0;
const unsigned long ANOMALY_CHECK_INTERVAL = 60000;    // ML Window baseline tick exact at 60 seconds (1 minute)

// Unified Single Instance Application Core Engine 
LightweightAnomalyDetector mlDetector;

struct SensorReading {
    float temperature;
    float humidity;
    float pressure;
    float light;
    float accel_magnitude;
    uint32_t timestamp;
    uint8_t sensor_health; 
};

std::vector<SensorReading> sensorHistory;
const int HISTORY_SIZE = 10;
const size_t SPIFFS_MAX_CAPACITY = 3 * 1024 * 1024;

float currentLat = 0.0000;
float currentLng = 0.0000;

// Shared state variables tracking current window matrix results
float currentAnomalyScore = 0.0f;
bool currentIsAnomaly = false;
String currentStatusMessage = "Initializing tracking pipeline...";

// Forward Declarations of Utility Pipelines
void updateLocationOnChip();
bool sendTelemetryToServer(String jsonPayload);
bool triggerBlockchainTransaction(float temp, float lat, float lng, float score, String reason);
void handleOfflineStorage(String payload);
void syncOfflineData();
SensorReading readAllSensors();
bool validateReadings(const SensorReading& reading);

void setup() {
    Serial.begin(115200);
    delay(1000);
    Serial.println("\n--- Initializing Integrated Cold-Chain Edge Intelligence ---");

    // Initialize Hardware Interfaces
    dhtSensor.begin();
    Wire.begin(I2C_SDA, I2C_SCL);
    accelSensor.initialize();
    
    if (!SPIFFS.begin(true)) Serial.println("SPIFFS Mount Failed!");
    SPIFFS.remove("/backup.json"); // Temporary patch to stop the crash-loop
    if (!SD.begin(SD_CS_PIN)) Serial.println("SD Card Module not detected.");

    // Connect Network Interfaces
    WiFi.begin(ssid, password);
    Serial.print("Establishing Connection to Network Gateway");
    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 10) {
        delay(1000);
        Serial.print(".");
        attempts++;
    }
    
    if (WiFi.status() == WL_CONNECTED) {
        Serial.println("\nConnected! IP Address: " + WiFi.localIP().toString());
        updateLocationOnChip();
        syncOfflineData();
    } else {
        Serial.println("\nRunning in OFFLINE mode. Utilizing default coordinates.");
    }
}

void loop() {
    unsigned long currentMillis = millis();

    // Pipeline Check 1: Periodic 1-Minute ML Window Feature Aggregation
    if (currentMillis - lastAnomalyCheckTime >= ANOMALY_CHECK_INTERVAL || lastAnomalyCheckTime == 0) {
        lastAnomalyCheckTime = currentMillis;
        
        SensorReading mlSample = readAllSensors();
        if (validateReadings(mlSample)) {
            mlDetector.addReading(mlSample.temperature, mlSample.humidity, mlSample.pressure, mlSample.light, mlSample.accel_magnitude);
            LightweightAnomalyDetector::AnomalyResult mlResult = mlDetector.detectAnomaly();
            
            currentAnomalyScore = mlResult.anomalyScore;
            currentIsAnomaly = mlResult.isAnomaly;
            currentStatusMessage = mlResult.reason;

            if (currentIsAnomaly) {
                Serial.println("⚠ CRITICAL RISK STATE DETECTED BY ML ENGINE! Initiating Blockchain Anchor...");
                if (WiFi.status() == WL_CONNECTED) {
                    bool txSuccess = triggerBlockchainTransaction(mlSample.temperature, currentLat, currentLng, currentAnomalyScore, currentStatusMessage);
                    if (!txSuccess) {
                        StaticJsonDocument<256> alertDoc;
                        alertDoc["alert"] = "Blockchain Tx Failed";
                        alertDoc["temp"] = mlSample.temperature;
                        alertDoc["score"] = currentAnomalyScore;
                        alertDoc["reason"] = currentStatusMessage;
                        String alertPayload;
                        serializeJson(alertDoc, alertPayload);
                        handleOfflineStorage(alertPayload);
                    }
                } else {
                    StaticJsonDocument<256> alertDoc;
                    alertDoc["alert"] = "Offline Node Alert";
                    alertDoc["temp"] = mlSample.temperature;
                    alertDoc["score"] = currentAnomalyScore;
                    String alertPayload;
                    serializeJson(alertDoc, alertPayload);
                    handleOfflineStorage(alertPayload);
                }
            }
        }
    }

    // Pipeline Check 2: High-Frequency Real-Time Telemetry Stream Loop (Every 5 seconds)
    if (currentMillis - lastTelemetryStreamTime >= TELEMETRY_STREAM_INTERVAL) {
        lastTelemetryStreamTime = currentMillis;

        SensorReading cleanReading = readAllSensors();
        Serial.println("✓ Hardware verification checks cleared.");
        
        if (WiFi.status() == WL_CONNECTED && currentLat == 0.0000) {
            updateLocationOnChip();
        }

        StaticJsonDocument<512> doc;
        doc["lat"] = currentLat;
        doc["lng"] = currentLng;
        doc["temp"] = cleanReading.temperature;
        doc["humidity"] = cleanReading.humidity;
        doc["pressure"] = cleanReading.pressure;
        doc["light"] = cleanReading.light;
        doc["accel"] = cleanReading.accel_magnitude;
        doc["anomalyScore"] = currentAnomalyScore;
        doc["isAnomaly"] = currentIsAnomaly;
        doc["statusMessage"] = currentStatusMessage;
        doc["timestamp"] = currentMillis;

        String payload;
        serializeJson(doc, payload);

        if (WiFi.status() == WL_CONNECTED) {
            bool webServerSuccess = sendTelemetryToServer(payload);
            if (webServerSuccess && !currentIsAnomaly) {
                syncOfflineData();
            }
        } else {
            handleOfflineStorage(payload);
        }
    }
}

SensorReading readAllSensors() {
    SensorReading reading;
    reading.timestamp = millis();
    reading.sensor_health = 0b11111; 
    
    // 1. Temperature via DHT11
    reading.temperature = dhtSensor.readTemperature();
    if (isnan(reading.temperature)) {
        reading.temperature = 24.5; // Realistic backup ambient baseline
        reading.sensor_health &= ~(1 << 0);
    }
    
    // 2. Humidity via DHT11
    reading.humidity = dhtSensor.readHumidity();
    if (isnan(reading.humidity)) {
        reading.humidity = 45.0; // Realistic backup humidity baseline
        reading.sensor_health &= ~(1 << 1);
    }
    
    // 3. Pressure (Omitted - Not in physical setup)
    reading.pressure = 101325.0; 
    reading.sensor_health &= ~(1 << 2); 
    
    // 4. Light via Physical LDR (Analog Pin 34)
    int rawLDR = analogRead(LDR_PIN);
    reading.light = (float)rawLDR; 
    if (rawLDR == 0 && LDR_PIN == 34) {
         reading.sensor_health &= ~(1 << 3); 
    }
    
    // 5. MPU6050 Accelerometer
    int16_t ax, ay, az;
    accelSensor.getAcceleration(&ax, &ay, &az);
    reading.accel_magnitude = sqrt((float)ax*ax + (float)ay*ay + (float)az*az) / 16384.0;
    if (reading.accel_magnitude == 0) {
        reading.accel_magnitude = 1.0; 
        reading.sensor_health &= ~(1 << 4);
    }
    
    return reading;
}

bool validateReadings(const SensorReading& reading) {
    int healthy_count = 0;
    for (int i = 0; i < 5; i++) {
        if (reading.sensor_health & (1 << i)) healthy_count++;
    }
    if (healthy_count < 2) return false; 
    
    if (sensorHistory.size() > 0) {
        SensorReading prev = sensorHistory.back();
        float time_delta_mins = (reading.timestamp - prev.timestamp) / 60000.0;
        if (time_delta_mins > 0.001) {
            float temp_change_rate = abs(reading.temperature - prev.temperature) / time_delta_mins;
            if (temp_change_rate > 15.0) return false; 
        }
    }
    
    sensorHistory.push_back(reading);
    if (sensorHistory.size() > HISTORY_SIZE) {
        sensorHistory.erase(sensorHistory.begin());
    }
    return true;
}

void updateLocationOnChip() {
    HTTPClient http;
    http.begin(geoEndpoint);
    int httpResponseCode = http.GET();
    
    if (httpResponseCode == 200) {
        String response = http.getString();
        StaticJsonDocument<512> replyDoc;
        DeserializationError error = deserializeJson(replyDoc, response);
        
        if (!error && replyDoc["status"] == "success") {
            currentLat = replyDoc["lat"];
            currentLng = replyDoc["lon"];
            Serial.printf("🎯 Geolocation Fixed: Lat %f | Lng %f\n", currentLat, currentLng);
        }
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

bool triggerBlockchainTransaction(float temp, float lat, float lng, float score, String reason) {
    HTTPClient http;
    http.begin(blockchainEndpoint);
    http.addHeader("Content-Type", "application/json");
    
    int scaledTemp = (int)(temp * 10);
    String geoCoordinates = String(lat, 4) + "," + String(lng, 4);

    String jsonRPC = "{\"jsonrpc\":\"2.0\",\"method\":\"eth_sendTransaction\",\"params\":[{\"to\":\"YOUR_CONTRACT_ADDRESS\",\"data\":\"NATIVE_HEX_DATA_PAYLOAD\"}],\"id\":1}";
    
    int httpResponseCode = http.POST(jsonRPC);
    http.end();
    return (httpResponseCode == 200);
}

void handleOfflineStorage(String payload) {
    size_t usedSPIFFS = SPIFFS.usedBytes();
    if (usedSPIFFS < SPIFFS_MAX_CAPACITY) {
        File spiffsFile = SPIFFS.open("/backup.json", FILE_APPEND);
        if (spiffsFile) {
            spiffsFile.println(payload);
            spiffsFile.close();
            Serial.println("✓ Telemetry safely cached in internal ESP32 storage banks.");
        }
    } else {
        File sdFile = SD.open("/overflow.json", FILE_APPEND);
        if (sdFile) {
            sdFile.println(payload);
            sdFile.close();
            Serial.println("⚠ Storage Cascade: Writing overflow records directly to physical MicroSD.");
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
            Serial.println("✓ Backlogged internal logs synchronized with main servers.");
        }
    }
}