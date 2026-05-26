#ifndef ANOMALY_DETECTOR_HPP
#define ANOMALY_DETECTOR_HPP

#include <Arduino.h> 
#include <vector>
#include <cmath>
#include <deque>
#include "config_parameters.h"  // Imports FEATURE_COUNT, SCALER_MEAN, SCALER_STD, etc.

class LightweightAnomalyDetector {
private:
    std::deque<float> tempHistory;
    std::deque<float> humidHistory;
    std::deque<float> pressureHistory;
    std::deque<float> lightHistory;
    std::deque<float> accelHistory;
    
    // Evaluates spatial variance signature over the full reconstructed feature map
    float calculateWindowAnomalyScore(const double* flattenedFeatures) {
        double absolute_variance_sum = 0.0;
        
        // Accumulate rolling Z-score variances across all 300 sequential window metrics
        for (int i = 0; i < FEATURE_COUNT; i++) {
            absolute_variance_sum += std::abs(flattenedFeatures[i]);
        }
        
        // Normalize against vector size and transform to a standardized 0.0 - 1.0 boundary
        double mean_deviation = absolute_variance_sum / (double)FEATURE_COUNT;
        float anomaly_score = 1.0f - std::exp(-static_cast<float>(mean_deviation) * 0.65f);
        
        return anomaly_score;
    }
    
public:
    void addReading(float temp, float humid, float pressure, float light, float accel) {
        tempHistory.push_back(temp);
        humidHistory.push_back(humid);
        pressureHistory.push_back(pressure);
        lightHistory.push_back(light);
        accelHistory.push_back(accel);
        
        // Enforce rigid 60-step cold chain window tracking limits
        if (tempHistory.size() > WINDOW_SIZE) {
            tempHistory.pop_front();
            humidHistory.pop_front();
            pressureHistory.pop_front();
            lightHistory.pop_front();
            accelHistory.pop_front();
        }
    }
    
    struct AnomalyResult {
        bool isAnomaly;
        float anomalyScore;  // 0-1
        String reason;
    };
    
    AnomalyResult detectAnomaly() {
        // Enforce barrier check: Cannot run analysis until timeline window is fully saturated
        if (tempHistory.size() < WINDOW_SIZE) {
            int missing_points = WINDOW_SIZE - tempHistory.size();
            return {false, 0.0, "Building profile window (need " + String(missing_points) + " mins)"};
        }
        
        // Reconstruct sliding window array to match training structure (300 items)
        double flatScaledFeatures[FEATURE_COUNT];
        int featureIdx = 0;
        
        for (int i = 0; i < WINDOW_SIZE; i++) {
            // Read sensor elements sequentially from historical timeline vectors
            float rawValues[SENSOR_COUNT] = {
                tempHistory[i],
                humidHistory[i],
                pressureHistory[i],
                lightHistory[i],
                accelHistory[i]
            };
            
            for (int s = 0; s < SENSOR_COUNT; s++) {
                // Fetch calibration scalars out of Flash Memory space directly
                float mean = pgm_read_float(&SCALER_MEAN[featureIdx]);
                float std  = pgm_read_float(&SCALER_STD[featureIdx]);
                
                // Complete explicit Z-Score normalization matching scikit-learn standard scaling
                if (std > 0.0001f) {
                    flatScaledFeatures[featureIdx] = (double)(rawValues[s] - mean) / std;
                } else {
                    flatScaledFeatures[featureIdx] = 0.0;
                }
                featureIdx++;
            }
        }
        
        // Generate current evaluation score from window matrix
        float score = calculateWindowAnomalyScore(flatScaledFeatures);
        
        // Isolation decision logic based on anomaly density profiling boundaries
        if (score > 0.75f) {
            String reason = "Normal profile bounds exceeded";
            
            // Back-trace the most recent frame vectors to locate anomalous trigger sources
            float current_temp = tempHistory.back();
            float current_humid = humidHistory.back();
            
            float last_temp_mean = pgm_read_float(&SCALER_MEAN[FEATURE_COUNT - 5]);
            float last_temp_std  = pgm_read_float(&SCALER_STD[FEATURE_COUNT - 5]);
            float last_humid_mean = pgm_read_float(&SCALER_MEAN[FEATURE_COUNT - 4]);
            float last_humid_std  = pgm_read_float(&SCALER_STD[FEATURE_COUNT - 4]);
            
            float t_z = std::abs((current_temp - last_temp_mean) / last_temp_std);
            float h_z = std::abs((current_humid - last_humid_mean) / last_humid_std);
            
            if (t_z > 3.0f) {
                reason = "Critical localized temperature shift detected";
            } else if (h_z > 3.0f) {
                reason = "Abnormal localized humidity spike detected";
            } else {
                reason = "Complex environmental anomaly detected";
            }
            
            return {true, score, reason};
        }
        
        return {false, score, "Normal cold chain pattern"};
    }
};

#endif // ANOMALY_DETECTOR_HPP