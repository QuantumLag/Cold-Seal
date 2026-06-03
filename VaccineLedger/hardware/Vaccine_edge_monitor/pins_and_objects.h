#ifndef PINS_AND_OBJECTS_H
#define PINS_AND_OBJECTS_H

// ==========================================
// 1. HARDWARE PIN CONFIGURATION (Direct Pins)
// ==========================================
#define SD_CS_PIN     5    // MicroSD Card Chip Select (SPI)
#define DHT_PIN       4    // Temp/Humidity Sensor Data (Digital)
#define LDR_PIN       34   // Photoresistor Light Sensor (Analog)

// ==========================================
// 2. HARDWARE PIN CONFIGURATION (Fixed I2C)
// ==========================================
// Note: MPU6050 Accelerometer uses the ESP32 hardware I2C bus.
// Libraries use these pins automatically via Wire.begin().
#define I2C_SDA       21   // MPU6050 Data Line (Hardware Fixed)
#define I2C_SCL       22   // MPU6050 Clock Line (Hardware Fixed)

// ==========================================
// 3. PHYSICAL SENSOR SPECIFICATIONS
// ==========================================
#define DHT_TYPE      DHT11 

#endif