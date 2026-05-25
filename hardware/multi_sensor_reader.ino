#include <OneWire.h>
#include <DallasTemperature.h>
#include <DHT.h>
#include <Adafruit_BMP280.h>
#include <BH1750.h>
#include <MPU6050.h>  // or use ADXL345 library
#include <Wire.h>
#include <vector>

// Pin definitions
#define DS18B20_PIN 4
#define DHT_PIN 5
#define DHT_TYPE DHT22
#define ACCEL_SDA 21
#define ACCEL_SCL 22

// Create sensor objects
OneWire oneWire(DS18B20_PIN);
DallasTemperature tempSensor(&oneWire);
DHT dhtSensor(DHT_PIN, DHT_TYPE);
Adafruit_BMP280 bmp280;
BH1750 lightSensor;
MPU6050 accelSensor;

// Data structure
struct SensorReading {
    float temperature;
    float humidity;
    float pressure;
    float light;
    float accel_x, accel_y, accel_z;
    float accel_magnitude;
    uint32_t timestamp;
    uint8_t sensor_health;  // bitmask: bit 0=temp, 1=humid, 2=press, 3=light, 4=accel
};

// History for cross-validation
std::vector<SensorReading> sensorHistory;
const int HISTORY_SIZE = 10;

class MultiSensorValidator {
public:
    SensorReading readAllSensors() {
        SensorReading reading;
        reading.timestamp = millis();
        reading.sensor_health = 0b11111;  // All healthy initially
        
        // Temperature (OneWire)
        tempSensor.requestTemperatures();
        reading.temperature = tempSensor.getTempCByIndex(0);
        if (reading.temperature == -127.0) {  // Error code
            reading.sensor_health &= ~(1 << 0);  // Mark unhealthy
        }
        
        // Humidity
        reading.humidity = dhtSensor.readHumidity();
        if (isnan(reading.humidity)) {
            reading.sensor_health &= ~(1 << 1);
        }
        
        // Pressure
        reading.pressure = bmp280.readPressure();
        if (reading.pressure == 0) {
            reading.sensor_health &= ~(1 << 2);
        }
        
        // Light (Lux)
        reading.light = lightSensor.readLightLevel();
        if (reading.light < 0) {
            reading.sensor_health &= ~(1 << 3);
        }
        
        // Acceleration
        int16_t ax, ay, az;
        accelSensor.getAcceleration(&ax, &ay, &az);
        reading.accel_x = ax / 16384.0;  // Convert to g
        reading.accel_y = ay / 16384.0;
        reading.accel_z = az / 16384.0;
        reading.accel_magnitude = sqrt(ax*ax + ay*ay + az*az) / 16384.0;
        if (reading.accel_magnitude == 0) {
            reading.sensor_health &= ~(1 << 4);
        }
        
        return reading;
    }
    
    bool validateReadings(const SensorReading& reading) {
        // Count healthy sensors
        int healthy_count = 0;
        for (int i = 0; i < 5; i++) {
            if (reading.sensor_health & (1 << i)) {
                healthy_count++;
            }
        }
        
        // Need at least 3 sensors
        if (healthy_count < 3) {
            Serial.println("⚠ WARNING: Less than 3 sensors healthy!");
            return false;
        }
        
        // Cross-validation checks
        if (sensorHistory.size() > 0) {
            SensorReading prev = sensorHistory.back();
            
            // Check 1: Temperature change rate (max 5°C per minute)
            float temp_change_rate = abs(reading.temperature - prev.temperature) / 
                                    ((reading.timestamp - prev.timestamp) / 60000.0);
            if (temp_change_rate > 5.0) {
                Serial.println("⚠ Anomaly: Unrealistic temperature change rate!");
                return false;
            }
            
            // Check 2: Pressure change (altitude shouldn't jump)
            float pressure_delta = abs(reading.pressure - prev.pressure);
            if (pressure_delta > 100) {  // hPa
                Serial.println("⚠ Anomaly: Sudden pressure change!");
                return false;
            }
            
            // Check 3: Temperature-Humidity consistency
            // At 0°C with 5% RH is physically impossible (sensor malfunction)
            if (reading.temperature < 5 && reading.humidity < 10) {
                Serial.println("⚠ Sensor malfunction: Impossible T-H combination!");
                return false;
            }
        }
        
        // Store in history
        sensorHistory.push_back(reading);
        if (sensorHistory.size() > HISTORY_SIZE) {
            sensorHistory.erase(sensorHistory.begin());
        }
        
        return true;
    }
    
    void printReadings(const SensorReading& reading) {
        Serial.print("Temperature: ");
        Serial.print(reading.temperature);
        Serial.println("°C");
        
        Serial.print("Humidity: ");
        Serial.print(reading.humidity);
        Serial.println("%");
        
        Serial.print("Pressure: ");
        Serial.print(reading.pressure);
        Serial.println(" Pa");
        
        Serial.print("Light: ");
        Serial.print(reading.light);
        Serial.println(" Lux");
        
        Serial.print("Acceleration: ");
        Serial.print(reading.accel_magnitude);
        Serial.println(" g");
        
        Serial.print("Sensor Health: ");
        Serial.println(reading.sensor_health, BIN);
        Serial.println("---");
    }
};

MultiSensorValidator validator;

void setup() {
    Serial.begin(115200);
    delay(1000);
    
    // Initialize sensors
    tempSensor.begin();
    dhtSensor.begin();
    Wire.begin(ACCEL_SDA, ACCEL_SCL);
    bmp280.begin(0x76);
    lightSensor.begin();
    accelSensor.initialize();
    
    Serial.println("✓ All sensors initialized");
}

void loop() {
    // Read all sensors
    SensorReading reading = validator.readAllSensors();
    
    // Validate readings
    if (validator.validateReadings(reading)) {
        Serial.println("✓ Readings valid");
        validator.printReadings(reading);
        
        // Send to blockchain
        sendToBlockchain(reading);
    } else {
        Serial.println("✗ Readings invalid - skipping this cycle");
    }
    
    delay(60000);  // Read every minute
}

void sendToBlockchain(const SensorReading& reading) {
    // Will implement in next section
}
