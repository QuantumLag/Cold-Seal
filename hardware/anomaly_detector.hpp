#include <vector>
#include <cmath>
#include <deque>

class LightweightAnomalyDetector {
private:
    // Scaler parameters (from training)
    const float TEMP_MEAN = 5.2;
    const float TEMP_STD = 2.1;
    const float HUMID_MEAN = 65.0;
    const float HUMID_STD = 15.0;
    const float PRESSURE_MEAN = 101325.0;
    const float PRESSURE_STD = 500.0;
    const float LIGHT_MEAN = 200.0;
    const float LIGHT_STD = 300.0;
    const float ACCEL_MEAN = 0.5;
    const float ACCEL_STD = 0.3;
    
    std::deque<float> tempHistory;
    std::deque<float> humidHistory;
    std::deque<float> pressureHistory;
    std::deque<float> lightHistory;
    std::deque<float> accelHistory;
    
    const int WINDOW_SIZE = 60;  // 60-minute history
    
    // Simplified Isolation Forest scoring
    // In real implementation, you'd use PMML or convert tree structure to C++
    float isolationForestScore(float* features) {
        // This is simplified - in production use PMML conversion tools
        // For now, use statistical approach
        
        float z_score_sum = 0;
        
        // Temperature z-score
        float temp_zscore = abs((features[0] - TEMP_MEAN) / TEMP_STD);
        z_score_sum += temp_zscore;
        
        // Humidity z-score
        float humid_zscore = abs((features[1] - HUMID_MEAN) / HUMID_STD);
        z_score_sum += humid_zscore;
        
        // Combined anomaly score (0-1, where 1 = anomalous)
        float anomaly_score = fmin(z_score_sum / 3.0, 1.0);
        return anomaly_score;
    }
    
public:
    void addReading(float temp, float humid, float pressure, float light, float accel) {
        tempHistory.push_back(temp);
        humidHistory.push_back(humid);
        pressureHistory.push_back(pressure);
        lightHistory.push_back(light);
        accelHistory.push_back(accel);
        
        // Keep only last WINDOW_SIZE readings
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
        if (tempHistory.size() < WINDOW_SIZE) {
            return {false, 0.0, "Insufficient history"};
        }
        
        // Get latest reading
        float latest_features[] = {
            tempHistory.back(),
            humidHistory.back(),
            pressureHistory.back(),
            lightHistory.back(),
            accelHistory.back()
        };
        
        // Calculate anomaly score
        float score = isolationForestScore(latest_features);
        
        String reason = "";
        
        // Threshold-based decision with explanation
        if (score > 0.8) {
            // Check which feature is most anomalous
            float temp_zscore = abs((latest_features[0] - TEMP_MEAN) / TEMP_STD);
            if (temp_zscore > 2.0) {
                reason = "Extreme temperature deviation";
            } else {
                reason = "Multiple feature anomaly";
            }
            return {true, score, reason};
        }
        
        return {false, score, "Normal pattern"};
    }
};