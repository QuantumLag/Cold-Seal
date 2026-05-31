// vaccine_quality_predictor.hpp
#include <cmath>

class VaccineQualityPredictor {
private:
    // Arrhenius parameters for mRNA vaccine
    // Source: Published pharmaceutical stability data
    const float Q10 = 1.5;  // Degradation rate doubles every 10°C
    const float REFERENCE_TEMP = 25.0;  // Celsius
    const float REFERENCE_DEGRADATION_RATE = 0.001;  // per hour
    
public:
    struct QualityMetrics {
        float qualityScore;  // 0-100
        float degradationRate;  // per hour
        uint32_t predictedExpiry;  // seconds until score < 50
        String recommendation;
    };
    
    QualityMetrics calculateQuality(
        float temperatureHistory[], 
        int historyLength,
        uint32_t currentTime
    ) {
        float accumulated_degradation = 0.0;
        
        // Sum degradation over all temperature readings
        for (int i = 0; i < historyLength - 1; i++) {
            float temp = temperatureHistory[i];
            float time_interval = 1.0;  // minutes
            
            // Arrhenius equation
            float degradation_rate = REFERENCE_DEGRADATION_RATE * 
                pow(Q10, (temp - REFERENCE_TEMP) / 10.0);
            
            accumulated_degradation += degradation_rate * time_interval;
        }
        
        // Current quality score
        float quality_score = max(0.0f, 100.0f - (accumulated_degradation * 100.0f));
        
        // Current degradation rate at latest temperature
        float latest_temp = temperatureHistory[historyLength - 1];
        float current_degradation_rate = REFERENCE_DEGRADATION_RATE * 
            pow(Q10, (latest_temp - REFERENCE_TEMP) / 10.0);
        
        // Predict when score reaches 50 (minimum acceptable)
        float remaining_quality = quality_score - 50.0;
        uint32_t predicted_expiry = 0;
        
        if (current_degradation_rate > 0) {
            float hours_remaining = remaining_quality / (current_degradation_rate * 100.0);
            predicted_expiry = (uint32_t)(hours_remaining * 3600);  // Convert to seconds
        }
        
        // Generate recommendation
        String recommendation = "";
        if (quality_score > 85) {
            recommendation = "Use immediately - excellent condition";
        } else if (quality_score > 70) {
            recommendation = "Use within recommended timeframe";
        } else if (quality_score > 50) {
            recommendation = "Use with caution - approaching expiry";
        } else {
            recommendation = "DESTROY - unsafe to use";
        }
        
        return {
            quality_score,
            current_degradation_rate,
            predicted_expiry,
            recommendation
        };
    }
};

// Usage
VaccineQualityPredictor qualityPredictor;

void updateQualityScore() {
    // Collect recent temperature history (last 168 hours = 1 week)
    // In real implementation, would be stored in SPIFFS
    float tempHistory[1008];  // 168 hours * 6 readings/hour
    int historyLength = 1008;
    
    QualityMetrics metrics = qualityPredictor.calculateQuality(
        tempHistory, 
        historyLength,
        time(nullptr)
    );
    
    Serial.print("Quality Score: ");
    Serial.println(metrics.qualityScore);
    Serial.print("Expires in: ");
    Serial.print(metrics.predictedExpiry / 3600);
    Serial.println(" hours");
    Serial.println(metrics.recommendation);
}
