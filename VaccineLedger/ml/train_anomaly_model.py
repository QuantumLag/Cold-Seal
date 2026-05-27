import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import IsolationForest
import joblib
import json
import os

# Load your historical temperature data
df = pd.read_csv('cold_chain_training_data.csv')

# Extract features (60-minute rolling window)
def create_sliding_window(data, window_size=60):
    X = []
    for i in range(len(data) - window_size):
        # FIX: Removed .values because 'data' is already a raw NumPy array
        window = data[i:i+window_size].flatten() 
        X.append(window)
    return np.array(X)

# Prepare training data
features = df[['temperature', 'humidity', 'pressure', 'light', 'accel_mag']].values
X_train = create_sliding_window(features, window_size=60)

# Normalize
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)

# Train Isolation Forest 
model = IsolationForest(
    contamination=0.05,  # Assume 5% of data is anomalous
    random_state=42,
    n_estimators=100
)
model.fit(X_train_scaled)

# Save model
joblib.dump(model, 'anomaly_model.pkl')

# Save scaler parameters
scaler_params = {
    'mean': scaler.mean_.tolist(),
    'std': scaler.scale_.tolist()
}
with open('scaler_params.json', 'w') as f:
    json.dump(scaler_params, f)

# Model size check
model_size = os.path.getsize('anomaly_model.pkl')
print(f"✓ Model successfully trained and saved!")
print(f"Model size: {model_size / 1024:.2f} KB")  # Should be < 500 KB