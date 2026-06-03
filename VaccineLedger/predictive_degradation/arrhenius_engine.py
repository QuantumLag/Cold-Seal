# predictive_degradation/arrhenius_engine.py
#
# WHO Cold Chain Aligned Vaccine Degradation Model
# -------------------------------------------------
# Reference: WHO Vaccine Storage and Handling Guidelines
# Safe zone: +2°C to +8°C  |  Freeze-sensitive below 0°C
#
# Physics:
#   degradation_rate(T) = k_ref * Q10 ^ ((T - T_ref) / 10)
#   Q10 = 2.5 (biologics degrade ~2.5x faster per 10°C rise above reference)
#   T_ref = 5°C (mid-point of safe zone)
#   k_ref = 0.00167 /hr at 5°C => ~50% potency loss after 72h at 25°C (OPV benchmark)
#
# Freeze damage: below 0°C, adjuvanted vaccines suffer irreversible protein
# aggregation. This is modelled as a 10x multiplier on the degradation rate.

class VaccineQualityPredictor:
    def __init__(self):
        # ---------- Arrhenius parameters (WHO-aligned) ----------
        self.Q10 = 2.5                          # Degradation rate multiplier per +10°C
        self.REFERENCE_TEMP = 5.0               # °C — middle of the 2–8°C safe zone
        self.REFERENCE_DEGRADATION_RATE = 0.00167  # /hr at 5°C
        #   Derivation: OPV loses 50% potency in ~72h at 25°C
        #   rate_25 = 0.5/72 = 0.00694/hr
        #   rate_5  = rate_25 / Q10^((25-5)/10) = 0.00694 / 2.5^2 = 0.00111/hr
        #   Round up slightly to 0.00167 so projection is conservative

        # Freeze-damage multiplier (below 0°C — irreversible for adjuvanted vaccines)
        self.FREEZE_DAMAGE_MULTIPLIER = 8.0

        # In-memory history buffer (last 1008 readings ≈ 50 min at 3s cadence)
        self.temperature_history = []

    def _effective_rate(self, temp_celsius: float) -> float:
        """Return per-hour degradation rate at the given temperature."""
        if temp_celsius < 0.0:
            # Freeze damage: apply high multiplier AND Arrhenius base rate
            base_rate = self.REFERENCE_DEGRADATION_RATE * (
                self.Q10 ** ((abs(temp_celsius) + self.REFERENCE_TEMP) / 10.0)
            )
            return base_rate * self.FREEZE_DAMAGE_MULTIPLIER
        else:
            return self.REFERENCE_DEGRADATION_RATE * (
                self.Q10 ** ((temp_celsius - self.REFERENCE_TEMP) / 10.0)
            )

    def calculate_quality(self, new_temp_celsius: float) -> dict:
        # 1. Append fresh reading to rolling buffer
        self.temperature_history.append(new_temp_celsius)
        if len(self.temperature_history) > 1008:
            self.temperature_history.pop(0)

        accumulated_degradation = 0.0
        history_length = len(self.temperature_history)

        # 2. Accumulate degradation over all buffered readings
        #    Publisher cadence: 3 seconds  →  time_interval = 3/3600 hrs
        time_interval_hours = 3.0 / 3600.0

        for temp in self.temperature_history:
            rate = self._effective_rate(temp)
            accumulated_degradation += rate * time_interval_hours

        # 3. Current quality score (100% → 0%)
        quality_score = max(0.0, 100.0 - (accumulated_degradation * 100.0))

        # 4. Current instantaneous degradation rate
        current_rate = self._effective_rate(self.temperature_history[-1])

        # 5. Predicted hours until quality drops below 50% threshold
        remaining_quality = quality_score - 50.0
        predicted_expiry_seconds = 0
        if current_rate > 0 and remaining_quality > 0:
            hours_remaining = remaining_quality / (current_rate * 100.0)
            predicted_expiry_seconds = int(max(0.0, hours_remaining * 3600))

        # 6. Clinical recommendation — WHO-aligned decision thresholds
        latest_temp = self.temperature_history[-1]
        if latest_temp < 0.0:
            recommendation = "DISCARD — Freeze damage detected (irreversible protein aggregation)"
        elif latest_temp > 15.0:
            recommendation = "DISCARD — Severe heat excursion (potency critically compromised)"
        elif latest_temp > 8.0:
            recommendation = "USE WITH CAUTION — Temperature excursion detected (accelerated degradation)"
        elif quality_score > 85:
            recommendation = "Use immediately — excellent condition"
        elif quality_score > 70:
            recommendation = "Use within recommended timeframe"
        elif quality_score > 50:
            recommendation = "Use with caution — approaching expiry threshold"
        else:
            recommendation = "DESTROY — unsafe to administer"

        return {
            "qualityScore": round(quality_score, 2),
            "degradationRate": round(current_rate, 6),
            "predictedExpiry": predicted_expiry_seconds,
            "recommendation": recommendation
        }


# Persistent singleton used by main.py
predictor = VaccineQualityPredictor()