export const TEMPERATURE_RAW_SCALE = 10;

export const TEMPERATURE_SAFE_MIN_RAW = 20;
export const TEMPERATURE_SAFE_MAX_RAW = 80;

export const TEMPERATURE_SAFE_MIN_C = TEMPERATURE_SAFE_MIN_RAW / TEMPERATURE_RAW_SCALE;
export const TEMPERATURE_SAFE_MAX_C = TEMPERATURE_SAFE_MAX_RAW / TEMPERATURE_RAW_SCALE;

export const TEMPERATURE_WARNING_BUFFER_C = 0.5;

export const TEMP_STATUS_SAFE = '✅ SAFE';
export const TEMP_STATUS_BREACH = '🚨 BREACH';

export function rawTemperatureToCelsius(rawTemperature: number) {
  return rawTemperature / TEMPERATURE_RAW_SCALE;
}

export function getTemperatureStatus(rawTemperature: number) {
  return rawTemperature < TEMPERATURE_SAFE_MIN_RAW || rawTemperature > TEMPERATURE_SAFE_MAX_RAW
    ? TEMP_STATUS_BREACH
    : TEMP_STATUS_SAFE;
}
