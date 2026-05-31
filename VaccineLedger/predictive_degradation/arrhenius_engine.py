# predictive_degradation/arrhenius_engine.py

class VaccineQualityPredictor:
    def __init__(self):
        # Arrhenius parameters mirroring the hardware spec
        self.Q10 = 1.5                         # Degradation rate doubles every 10°C
        self.REFERENCE_TEMP = 25.0             # Celsius
        self.REFERENCE_DEGRADATION_RATE = 0.001 # per hour
        
        # In-memory history buffer to keep track of incoming readings 
        # Since the server receives a continuous live stream
        self.temperature_history = []

    def calculate_quality(self, new_temp_celsius: float) -> dict:
        # 1. Append the fresh sensor reading to our processing buffer
        self.temperature_history.append(new_temp_celsius)
        
        # Keep a rolling buffer window (e.g., last 1000 readings) to prevent memory bloating
        if len(self.temperature_history) > 1008:
            self.temperature_history.pop(0)
            
        accumulated_degradation = 0.0
        history_length = len(self.temperature_history)
        
        # 2. Sum degradation over all accumulated readings
        # time_interval is 3 seconds (3/3600 hours) because our publisher.py streams every 3 seconds
        time_interval_hours = 3.0 / 3600.0 
        
        for i in range(history_length):
            temp = self.temperature_history[i]
            
            # The exact Q10 Arrhenius scaling equation from your hardware code
            degradation_rate = self.REFERENCE_DEGRADATION_RATE * (self.Q10 ** ((temp - self.REFERENCE_TEMP) / 10.0))
            accumulated_degradation += degradation_rate * time_interval_hours

        # 3. Compute current quality score (clamped down to a minimum of 0)
        quality_score = max(0.0, 100.0 - (accumulated_degradation * 100.0))
        
        # 4. Calculate degradation rate at the newest temperature point
        latest_temp = self.temperature_history[-1]
        current_degradation_rate = self.REFERENCE_DEGRADATION_RATE * (self.Q10 ** ((latest_temp - self.REFERENCE_TEMP) / 10.0))
        
        # 5. Predict remaining seconds until quality drops below the 50% threshold
        remaining_quality = quality_score - 50.0
        predicted_expiry_seconds = 0
        
        if current_degradation_rate > 0:
            # hours = quality delta / degradation per hour units
            hours_remaining = remaining_quality / (current_degradation_rate * 100.0)
            predicted_expiry_seconds = int(max(0.0, hours_remaining * 3600))

        # 6. Generate matching clinical recommendations
        if quality_score > 85:
            recommendation = "Use immediately - excellent condition"
        elif quality_score > 70:
            recommendation = "Use within recommended timeframe"
        elif quality_score > 50:
            recommendation = "Use with caution - approaching expiry"
        else:
            recommendation = "DESTROY - unsafe to use"

        return {
            "qualityScore": round(quality_score, 2),
            "degradationRate": current_degradation_rate,
            "predictedExpiry": predicted_expiry_seconds,
            "recommendation": recommendation
        }

# Instantiate a persistent global engine instance for main.py to use
predictor = VaccineQualityPredictor()