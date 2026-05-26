#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h> 
#include <SPI.h>
#include <SD.h>
#include <Wire.h>
#include "FS.h"
#include "SPIFFS.h"

// Project Modular Header Inclusions
#include "pins_and_objects.h"
#include "anomaly_detector.hpp"

// Define Hardware Objects
OneWire oneWire(DS18B20_PIN);
DallasTemperature tempSensor(&oneWire);
DHT dhtSensor(DHT_PIN, DHT_TYPE);
Adafruit_BMP280 bmp280;
BH1750 lightSensor;
MPU6050 accelSensor;

// Network Configurations
const char* ssid = "S23";
const char* password = "abcd1245";
const char* serverEndpoint = "http://YOUR_BACKEND_IP_OR_URL/api/telemetry";
const char* blockchainEndpoint = "http://YOUR_GANACHE_IP:7545"; // Local Ganache Node Endpoint
const char* geoEndpoint = "http://ip-api.com/json/";

// Application Core Engine Instances
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
    tempSensor.begin();
    dhtSensor.begin();
    Wire.begin(ACCEL_SDA, ACCEL_SCL);
    
    if (!bmp280.begin(0x76)) Serial.println("Warning: BMP280 not detected.");
    if (!lightSensor.begin()) Serial.println("Warning: BH1750 not detected.");
    accelSensor.initialize();
    
    if (!SPIFFS.begin(true)) Serial.println("SPIFFS Mount Failed!");
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
    // Step 1: Data Acquisition & Structural Diagnostics
    SensorReading cleanReading = readAllSensors();
    
    if (validateReadings(cleanReading)) {
        Serial.println("✓ Hardware verification checks cleared.");
        
        // Step 2: Push metrics into rolling memory window and run Edge ML Inference
        mlDetector.addReading(cleanReading.temperature, cleanReading.humidity, cleanReading.pressure, cleanReading.light, cleanReading.accel_magnitude);
        LightweightAnomalyDetector::AnomalyResult mlResult = mlDetector.detectAnomaly();
        
        // Routinely try fetching location coordinates if not already resolved
        if (WiFi.status() == WL_CONNECTED && currentLat == 0.0000) {
            updateLocationOnChip();
        }

        // Step 3: Construct Central Unified Telemetry Package
        StaticJsonDocument<512> doc;
        doc["lat"] = currentLat;
        doc["lng"] = currentLng;
        doc["temp"] = cleanReading.temperature;
        doc["humidity"] = cleanReading.humidity;
        doc["pressure"] = cleanReading.pressure;
        doc["light"] = cleanReading.light;
        doc["accel"] = cleanReading.accel_magnitude;
        doc["anomalyScore"] = mlResult.anomalyScore;
        doc["isAnomaly"] = mlResult.isAnomaly;
        doc["statusMessage"] = mlResult.reason;
        doc["timestamp"] = millis();

        String payload;
        serializeJson(doc, payload);

        // Step 4: THE INTEGRATED GATEKEEPER ROUTING (Separation of Concerns)
        if (WiFi.status() == WL_CONNECTED) {
            // Path A: Always stream real-time JSON out to FastAPI over standard HTTP WebSockets pipeline
            bool webServerSuccess = sendTelemetryToServer(payload);
            
            // Path B: Only commit ledger entries during ML Verified Risk states
            if (mlResult.isAnomaly) {
                Serial.println("⚠ CRITICAL RISK STATE DETECTED! Initiating Blockchain Anchor...");
                bool txSuccess = triggerBlockchainTransaction(cleanReading.temperature, currentLat, currentLng, mlResult.anomalyScore, mlResult.reason);
                if (!txSuccess) {
                    handleOfflineStorage(payload);
                }
            } else if (webServerSuccess) {
                // If network connection is clear and baseline transport succeeded, look for past debt
                syncOfflineData();
            }
        } else {
            // If offline, cascade directly to local Flash file buffering configurations
            handleOfflineStorage(payload);
        }
    } else {
        Serial.println("✗ Environmental frame rejected due to physical inconsistencies.");
    }

    delay(5000); // Sample telemetry every 5 seconds for responsive edge tracking
}

SensorReading readAllSensors() {
    SensorReading reading;
    reading.timestamp = millis();
    reading.sensor_health = 0b11111; 
    
    tempSensor.requestTemperatures();
    reading.temperature = tempSensor.getTempCByIndex(0);
    if (reading.temperature == -127.0) reading.sensor_health &= ~(1 << 0);
    
    reading.humidity = dhtSensor.readHumidity();
    if (isnan(reading.humidity)) reading.sensor_health &= ~(1 << 1);
    
    reading.pressure = bmp280.readPressure();
    if (reading.pressure == 0) reading.sensor_health &= ~(1 << 2);
    
    reading.light = lightSensor.readLightLevel();
    if (reading.light < 0) reading.sensor_health &= ~(1 << 3);
    
    int16_t ax, ay, az;
    accelSensor.getAcceleration(&ax, &ay, &az);
    reading.accel_magnitude = sqrt((float)ax*ax + (float)ay*ay + (float)az*az) / 16384.0;
    if (reading.accel_magnitude == 0) reading.sensor_health &= ~(1 << 4);
    
    return reading;
}

bool validateReadings(const SensorReading& reading) {
    int healthy_count = 0;
    for (int i = 0; i < 5; i++) {
        if (reading.sensor_health & (1 << i)) healthy_count++;
    }
    if (healthy_count < 3) return false;
    
    if (sensorHistory.size() > 0) {
        SensorReading prev = sensorHistory.back();
        float temp_change_rate = abs(reading.temperature - prev.temperature) / ((reading.timestamp - prev.timestamp) / 60000.0);
        if (temp_change_rate > 5.0) return false;
        
        float pressure_delta = abs(reading.pressure - prev.pressure);
        if (pressure_delta > 10000) return false; // Adjusted threshold for Pa instead of hPa
        
        if (reading.temperature < 5 && reading.humidity < 10) return false;
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

// 🔐 Web3 Bridge Integration Execution Hook
bool triggerBlockchainTransaction(float temp, float lat, float lng, float score, String reason) {
    HTTPClient http;
    http.begin(blockchainEndpoint);
    http.addHeader("Content-Type", "application/json");
    
    // Scale standard decimal temperature down into a fixed uint scaling factor for contract safety (e.g. 5.5°C -> 55)
    int scaledTemp = (int)(temp * 10);
    String geoCoordinates = String(lat, 4) + "," + String(lng, 4);

    // Formulate native JSON-RPC format payload to invoke contract logData function via web3
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