"""
Synthetic Dataset Generator for Cold Chain Anomaly Detection
Generates realistic temperature, humidity, pressure, light, and acceleration data
with multiple types of anomalies for ML model training.

Dataset has:
- Timestamps
- Temperature (°C)
- Humidity (%)
- Pressure (Pa)
- Light (Lux)
- Acceleration Magnitude (g)
- Labels (0=normal, 1=power_failure, 2=tampering, 3=leak, 4=sensor_drift, etc.)
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import matplotlib.pyplot as plt

class ColdChainDatasetGenerator:
    def __init__(self, seed=42):
        np.random.seed(seed)
        
        # Reference conditions for vaccine storage
        self.temp_min = 2.0  # Celsius
        self.temp_max = 8.0
        self.temp_safe_center = 5.0
        
        self.humidity_normal = 65  # %
        self.pressure_normal = 101325  # Pa (sea level)
        self.light_normal = 200  # Lux (low indoor light)
        self.accel_normal = 1.0  # g (gravity)
    
    def generate_normal_segment(self, duration_hours=1, sample_interval_minutes=1):
        """
        Generate normal storage conditions
        Small random fluctuations around safe zone
        """
        samples = int((duration_hours * 60) / sample_interval_minutes)
        
        data = {
            'temperature': np.random.normal(self.temp_safe_center, 0.3, samples),
            'humidity': np.random.normal(self.humidity_normal, 2.0, samples),
            'pressure': np.random.normal(self.pressure_normal, 100, samples),
            'light': np.random.normal(self.light_normal, 20, samples),
            'accel_mag': np.random.normal(self.accel_normal, 0.05, samples),
            'label': np.zeros(samples)  # 0 = normal
        }
        
        # Ensure within realistic bounds
        data['temperature'] = np.clip(data['temperature'], self.temp_min, self.temp_max)
        data['humidity'] = np.clip(data['humidity'], 30, 80)
        data['pressure'] = np.clip(data['pressure'], 100000, 102000)
        data['light'] = np.clip(data['light'], 0, 500)
        data['accel_mag'] = np.clip(data['accel_mag'], 0.8, 1.2)
        
        return data
    
    def generate_power_failure_segment(self, duration_hours=2, sample_interval_minutes=1):
        """
        Anomaly A: Power Failure
        Slow, linear temperature increase over 2 hours
        Humidity stays normal
        Pressure slightly drops (air pressure in warm room)
        Light goes to 0 (no power)
        Acceleration normal (no movement during failure)
        """
        samples = int((duration_hours * 60) / sample_interval_minutes)
        
        # Linear temperature increase: 5°C → 25°C over 2 hours
        temp_start = self.temp_safe_center
        temp_end = 25.0
        temperature = np.linspace(temp_start, temp_end, samples)
        temperature += np.random.normal(0, 0.1, samples)  # Small noise
        
        data = {
            'temperature': temperature,
            'humidity': np.random.normal(self.humidity_normal, 2.0, samples),
            'pressure': np.linspace(self.pressure_normal, self.pressure_normal - 500, samples) + np.random.normal(0, 50, samples),
            'light': np.zeros(samples),  # Power failure = no light
            'accel_mag': np.random.normal(self.accel_normal, 0.05, samples),
            'label': np.ones(samples)  # 1 = power failure
        }
        
        data['humidity'] = np.clip(data['humidity'], 30, 95)
        data['pressure'] = np.clip(data['pressure'], 100000, 102000)
        data['accel_mag'] = np.clip(data['accel_mag'], 0.8, 1.2)
        
        return data
    
    def generate_tampering_segment(self, duration_hours=0.5, sample_interval_minutes=1, spike_duration_seconds=10):
        """
        Anomaly B: Tampering
        Sudden spike in Light and Acceleration for ~10 seconds
        (Someone opens the door, jostles the container)
        Temperature and humidity recover quickly
        """
        samples = int((duration_hours * 60) / sample_interval_minutes)
        spike_samples = int(spike_duration_seconds / (sample_interval_minutes * 60))
        
        # Normal baseline
        temperature = np.random.normal(self.temp_safe_center, 0.3, samples)
        humidity = np.random.normal(self.humidity_normal, 2.0, samples)
        pressure = np.random.normal(self.pressure_normal, 100, samples)
        light = np.random.normal(self.light_normal, 20, samples)
        accel = np.random.normal(self.accel_normal, 0.05, samples)
        
        # Spike in middle of segment
        spike_start = samples // 3
        spike_end = spike_start + spike_samples
        
        # Door opening causes light spike and vibration
        light[spike_start:spike_end] = np.random.uniform(1000, 3000, spike_end - spike_start)
        accel[spike_start:spike_end] = np.random.uniform(2.0, 3.5, spike_end - spike_start)
        
        # Temp spike (door open, outside air)
        temperature[spike_start:spike_end] += np.random.uniform(1, 3, spike_end - spike_start)
        
        # Humidity spike (outside air)
        humidity[spike_start:spike_end] += np.random.uniform(5, 15, spike_end - spike_start)
        
        data = {
            'temperature': np.clip(temperature, self.temp_min, 40),
            'humidity': np.clip(humidity, 30, 95),
            'pressure': np.clip(pressure, 100000, 102000),
            'light': np.clip(light, 0, 5000),
            'accel_mag': np.clip(accel, 0.5, 5.0),
            'label': np.full(samples, 2)  # 2 = tampering
        }
        
        return data
    
    def generate_leak_segment(self, duration_hours=3, sample_interval_minutes=1):
        """
        Anomaly C: Leak/Seal Failure
        Sudden drop in Pressure (seal broken, air escaping)
        Sudden rise in Humidity (moisture entering)
        Temperature drifts upward slowly
        Light fluctuates (air movement through hole)
        """
        samples = int((duration_hours * 60) / sample_interval_minutes)
        
        # Normal start, then degradation
        leak_start = samples // 4
        
        # Temperature: normal start, then slow increase
        temperature = np.ones(samples) * self.temp_safe_center
        temperature[leak_start:] = np.linspace(
            self.temp_safe_center, 
            self.temp_safe_center + 8, 
            samples - leak_start
        )
        temperature += np.random.normal(0, 0.2, samples)
        
        # Humidity: normal start, then sharp increase
        humidity = np.ones(samples) * self.humidity_normal
        humidity[leak_start:] = np.linspace(
            self.humidity_normal,
            95,  # Very humid from moisture
            samples - leak_start
        )
        humidity += np.random.normal(0, 1, samples)
        
        # Pressure: sudden drop at leak start
        pressure = np.ones(samples) * self.pressure_normal
        pressure[leak_start:] = np.linspace(
            self.pressure_normal,
            self.pressure_normal - 2000,  # Significant pressure drop
            samples - leak_start
        )
        pressure += np.random.normal(0, 100, samples)
        
        # Light: fluctuations from air movement
        light = np.random.normal(self.light_normal, 30, samples)
        light[leak_start:] += np.random.uniform(100, 300, samples - leak_start)
        
        # Acceleration: minor vibrations from air movement
        accel = np.random.normal(self.accel_normal, 0.05, samples)
        accel[leak_start:] += np.random.uniform(0.1, 0.5, samples - leak_start)
        
        data = {
            'temperature': np.clip(temperature, -5, 40),
            'humidity': np.clip(humidity, 30, 100),
            'pressure': np.clip(pressure, 98000, 102000),
            'light': np.clip(light, 0, 1000),
            'accel_mag': np.clip(accel, 0.5, 2.0),
            'label': np.full(samples, 3)  # 3 = leak
        }
        
        return data
    
    def generate_sensor_drift_segment(self, duration_hours=4, sample_interval_minutes=1):
        """
        Anomaly D: Sensor Drift
        One sensor slowly drifts from calibration
        Example: Temperature sensor drift (reads 1-2°C higher than actual)
        Typical in aging sensors
        """
        samples = int((duration_hours * 60) / sample_interval_minutes)
        
        # Gradual drift in temperature sensor
        drift_amount = np.linspace(0, 2.5, samples)  # 0 to 2.5°C drift
        
        data = {
            'temperature': np.random.normal(self.temp_safe_center, 0.3, samples) + drift_amount,
            'humidity': np.random.normal(self.humidity_normal, 2.0, samples),
            'pressure': np.random.normal(self.pressure_normal, 100, samples),
            'light': np.random.normal(self.light_normal, 20, samples),
            'accel_mag': np.random.normal(self.accel_normal, 0.05, samples),
            'label': np.full(samples, 4)  # 4 = sensor drift
        }
        
        data['temperature'] = np.clip(data['temperature'], 0, 30)
        data['humidity'] = np.clip(data['humidity'], 30, 80)
        data['pressure'] = np.clip(data['pressure'], 100000, 102000)
        data['light'] = np.clip(data['light'], 0, 500)
        data['accel_mag'] = np.clip(data['accel_mag'], 0.8, 1.2)
        
        return data
    
    def generate_vibration_anomaly_segment(self, duration_hours=0.25, sample_interval_minutes=1):
        """
        Anomaly E: Rough Handling
        High vibration/acceleration for sustained period (bumpy transport)
        Temperature might spike slightly from friction
        Other sensors relatively unaffected
        """
        samples = int((duration_hours * 60) / sample_interval_minutes)
        
        data = {
            'temperature': np.random.normal(self.temp_safe_center + 1, 0.5, samples),
            'humidity': np.random.normal(self.humidity_normal, 2.0, samples),
            'pressure': np.random.normal(self.pressure_normal, 150, samples),
            'light': np.random.normal(self.light_normal, 30, samples),
            'accel_mag': np.random.uniform(2.0, 4.0, samples),  # High vibration
            'label': np.full(samples, 5)  # 5 = vibration/rough handling
        }
        
        data['temperature'] = np.clip(data['temperature'], 0, 20)
        data['humidity'] = np.clip(data['humidity'], 30, 80)
        data['pressure'] = np.clip(data['pressure'], 99000, 103000)
        data['light'] = np.clip(data['light'], 0, 800)
        data['accel_mag'] = np.clip(data['accel_mag'], 0.5, 5.0)
        
        return data
    
    def generate_complete_dataset(self, total_days=7):
        """
        Generate a complete dataset with realistic mix of normal and anomalous periods
        Total duration: 7 days (realistic for vaccine cold chain tracking)
        """
        all_data = []
        timestamps = []
        
        start_time = datetime(2024, 1, 1, 0, 0, 0)
        current_time = start_time
        
        print("Generating dataset...")
        print("-" * 50)
        
        # Define scenario sequence (7 days)
        scenarios = [
            ('normal', 24),           # Day 1: Normal storage
            ('normal', 12),           # Day 2 morning: Normal
            ('power_failure', 2),     # Day 2 afternoon: Power failure for 2 hours
            ('normal', 10),           # Day 2 evening: Normal
            ('normal', 24),           # Day 3: Normal
            ('tampering', 1),         # Day 4: Brief tampering (door open)
            ('normal', 23),           # Day 4-5: Normal
            ('normal', 12),           # Day 5: Normal
            ('leak', 3),              # Day 5 afternoon: Leak develops
            ('normal', 9),            # Day 5 evening: Normal (leak sealed)
            ('normal', 24),           # Day 6: Normal
            ('sensor_drift', 4),      # Day 7 morning: Sensor drift
            ('normal', 20),           # Day 7: Normal
        ]
        
        for scenario_type, duration_hours in scenarios:
            print(f"Generating: {scenario_type.upper()} ({duration_hours} hours)")
            
            if scenario_type == 'normal':
                segment_data = self.generate_normal_segment(duration_hours)
            elif scenario_type == 'power_failure':
                segment_data = self.generate_power_failure_segment(duration_hours)
            elif scenario_type == 'tampering':
                segment_data = self.generate_tampering_segment(duration_hours)
            elif scenario_type == 'leak':
                segment_data = self.generate_leak_segment(duration_hours)
            elif scenario_type == 'sensor_drift':
                segment_data = self.generate_sensor_drift_segment(duration_hours)
            elif scenario_type == 'vibration':
                segment_data = self.generate_vibration_anomaly_segment(duration_hours)
            
            samples = len(segment_data['temperature'])
            
            # Generate timestamps for this segment
            for i in range(samples):
                timestamps.append(current_time)
                current_time += timedelta(minutes=1)
            
            # Add segment data
            for key in segment_data:
                all_data.append(segment_data[key])
        
        # Transpose to create proper DataFrame structure
        data_dict = {}
        for i, key in enumerate(['temperature', 'humidity', 'pressure', 'light', 'accel_mag', 'label']):
            data_dict[key] = np.concatenate([segment[i] if isinstance(segment[i], np.ndarray) else segment[i] 
                                            for segment in [all_data[j::6] for j in range(6)]])
        
        # Better approach: reconstruct properly
        data_dict = {
            'temperature': [],
            'humidity': [],
            'pressure': [],
            'light': [],
            'accel_mag': [],
            'label': []
        }
        
        idx = 0
        for scenario_type, duration_hours in scenarios:
            if scenario_type == 'normal':
                segment_data = self.generate_normal_segment(duration_hours)
            elif scenario_type == 'power_failure':
                segment_data = self.generate_power_failure_segment(duration_hours)
            elif scenario_type == 'tampering':
                segment_data = self.generate_tampering_segment(duration_hours)
            elif scenario_type == 'leak':
                segment_data = self.generate_leak_segment(duration_hours)
            elif scenario_type == 'sensor_drift':
                segment_data = self.generate_sensor_drift_segment(duration_hours)
            elif scenario_type == 'vibration':
                segment_data = self.generate_vibration_anomaly_segment(duration_hours)
            
            for key in data_dict.keys():
                data_dict[key].extend(segment_data[key])
        
        # Convert lists to numpy arrays
        for key in data_dict.keys():
            data_dict[key] = np.array(data_dict[key])
        
        # Create DataFrame
        df = pd.DataFrame({
            'timestamp': timestamps,
            'temperature': data_dict['temperature'],
            'humidity': data_dict['humidity'],
            'pressure': data_dict['pressure'],
            'light': data_dict['light'],
            'accel_mag': data_dict['accel_mag'],
            'label': data_dict['label'].astype(int)
        })
        
        print("-" * 50)
        print(f"Dataset generated: {len(df)} samples")
        print(f"Time range: {df['timestamp'].min()} to {df['timestamp'].max()}")
        print("\nLabel distribution:")
        label_names = {
            0: 'Normal',
            1: 'Power Failure',
            2: 'Tampering',
            3: 'Leak',
            4: 'Sensor Drift',
            5: 'Vibration/Rough Handling'
        }
        for label, count in df['label'].value_counts().sort_index().items():
            print(f"  {label_names[label]}: {count} samples ({100*count/len(df):.1f}%)")
        
        return df
    
    def save_dataset(self, df, filename='cold_chain_dataset.csv'):
        """Save dataset to CSV"""
        df.to_csv(filename, index=False)
        print(f"\n✓ Dataset saved to: {filename}")
        return filename
    
    def plot_dataset_overview(self, df, save_plot=True):
        """Visualize the dataset"""
        fig, axes = plt.subplots(5, 1, figsize=(15, 10))
        
        # Color map for labels
        colors = {0: 'green', 1: 'red', 2: 'orange', 3: 'purple', 4: 'brown', 5: 'blue'}
        color_list = [colors[int(label)] for label in df['label']]
        
        # Temperature
        axes[0].scatter(range(len(df)), df['temperature'], c=color_list, s=5, alpha=0.6)
        axes[0].axhline(y=2, color='b', linestyle='--', alpha=0.3, label='Safe Zone')
        axes[0].axhline(y=8, color='b', linestyle='--', alpha=0.3)
        axes[0].set_ylabel('Temperature (°C)')
        axes[0].set_title('Synthetic Cold Chain Dataset - Temperature')
        axes[0].legend()
        axes[0].grid(True, alpha=0.3)
        
        # Humidity
        axes[1].scatter(range(len(df)), df['humidity'], c=color_list, s=5, alpha=0.6)
        axes[1].set_ylabel('Humidity (%)')
        axes[1].grid(True, alpha=0.3)
        
        # Pressure
        axes[2].scatter(range(len(df)), df['pressure'], c=color_list, s=5, alpha=0.6)
        axes[2].set_ylabel('Pressure (Pa)')
        axes[2].grid(True, alpha=0.3)
        
        # Light
        axes[3].scatter(range(len(df)), df['light'], c=color_list, s=5, alpha=0.6)
        axes[3].set_ylabel('Light (Lux)')
        axes[3].grid(True, alpha=0.3)
        
        # Acceleration
        axes[4].scatter(range(len(df)), df['accel_mag'], c=color_list, s=5, alpha=0.6)
        axes[4].set_ylabel('Acceleration (g)')
        axes[4].set_xlabel('Sample Index')
        axes[4].grid(True, alpha=0.3)
        
        # Add legend
        from matplotlib.patches import Patch
        legend_elements = [Patch(facecolor=colors[i], label=label) 
                          for i, label in enumerate(['Normal', 'Power Failure', 'Tampering', 'Leak', 'Sensor Drift', 'Vibration'])]
        fig.legend(handles=legend_elements, loc='upper right', bbox_to_anchor=(0.98, 0.98))
        
        plt.tight_layout()
        
        if save_plot:
            plt.savefig('cold_chain_dataset_overview.png', dpi=150, bbox_inches='tight')
            print("✓ Plot saved to: cold_chain_dataset_overview.png")
        
        plt.show()


# ═══════════════════════════════════════════════════════════
# USAGE EXAMPLE
# ═══════════════════════════════════════════════════════════

if __name__ == "__main__":
    # Create generator
    generator = ColdChainDatasetGenerator(seed=42)
    
    # Generate 7-day dataset
    df = generator.generate_complete_dataset(total_days=7)
    
    # Save to CSV
    generator.save_dataset(df, filename='cold_chain_training_data.csv')
    
    # Plot overview
    generator.plot_dataset_overview(df, save_plot=True)
    
    # Print sample
    print("\nFirst 20 rows of dataset:")
    print(df.head(20))
    
    print("\nDataset statistics:")
    print(df.describe())
    
    # Show anomaly examples
    print("\n" + "="*50)
    print("ANOMALY EXAMPLES:")
    print("="*50)
    
    for label in sorted(df['label'].unique()):
        anomaly_df = df[df['label'] == label].head(1)
        label_names = {0: 'Normal', 1: 'Power Failure', 2: 'Tampering', 
                      3: 'Leak', 4: 'Sensor Drift', 5: 'Vibration'}
        print(f"\n{label_names[int(label)]}:")
        print(anomaly_df.to_string())
