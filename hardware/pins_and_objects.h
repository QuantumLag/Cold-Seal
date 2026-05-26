#ifndef PINS_AND_OBJECTS_H
#define PINS_AND_OBJECTS_H

#include <OneWire.h>
#include <DallasTemperature.h>
#include <DHT.h>
#include <Adafruit_BMP280.h>
#include <BH1750.h>
#include <MPU6050.h>

// Hardware Pin Configuration
#define SD_CS_PIN     5
#define DHT_PIN       14   
#define LDR_PIN       34   
#define DS18B20_PIN   4
#define DHT_TYPE      DHT22
#define ACCEL_SDA     21
#define ACCEL_SCL     22

// Hardware Peripheral Instances
extern OneWire oneWire;
extern DallasTemperature tempSensor;
extern DHT dhtSensor;
extern Adafruit_BMP280 bmp280;
extern BH1750 lightSensor;
extern MPU6050 accelSensor;

#endif