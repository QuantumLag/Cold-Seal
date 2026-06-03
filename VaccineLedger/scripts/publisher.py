# ========================================
# STARTUP ORDER (CRITICAL — READ FIRST):
# ========================================
# 1. Start Ganache (blockchain local node)
# 2. Run deploy.py (deploys contract, writes CONTRACT_ADDRESS to .env)
# 3. Run: uvicorn main:app --reload   (starts FastAPI + WebSocket server)
# 4. Open index.html / Next.js app in browser
# 5. Run publisher.py LAST (begins sending data)
# ========================================

import time
import random
import requests
import os
from dotenv import load_dotenv

load_dotenv()

# Starting GPS (Bengaluru)
lat, lon = 12.9716, 77.5946

def run_sensor_simulation():
    global lat, lon
    print("🚀 Cold Chain IoT Simulator Active...")
    print("📡 Routing data via FastAPI Gateway Context...")
    
    while True:
        # 1. SIMULATE SENSOR DATA
        temp_celsius = round(random.uniform(1.5, 12.0), 1)
        # Humidity simulation: 30-95% RH (normal safe zone: 40-70%)
        humidity_rh = round(random.uniform(30.0, 95.0), 1)
        
        lat += random.uniform(-0.0005, 0.0005)
        lon += random.uniform(-0.0005, 0.0005)
        gps_coords = f"{lat:.4f},{lon:.4f}"

        # 2. DEFINE SYSTEM STATES
        is_temp_breach = temp_celsius < 2.0 or temp_celsius > 8.0
        is_humidity_breach = humidity_rh < 40.0 or humidity_rh > 70.0
        
        status = "🚨 BREACH" if is_temp_breach else "✅ SAFE"
        humidity_status = "⚠ OUT OF RANGE" if is_humidity_breach else "✓ OPTIMAL"
        
        # 3. CONSTRUCT TELEMETRY PAYLOAD
        # Temperature is stored as raw (×10 integer) for backend compatibility
        live_payload = {
            "temp": int(temp_celsius * 10),  # Raw value (×10 scaled)
            "humidity": humidity_rh,          # Already a real float
            "light": round(random.uniform(120.0, 420.0), 1),
            "accel": round(random.uniform(0.95, 1.12), 2),
            "gps": gps_coords,
            "status": status,
            "timestamp": time.strftime("%H:%M:%S")
        }
        
        # Local console reporting
        if is_temp_breach:
            print(f"[{status}] Temp: {temp_celsius}°C | Humidity: {humidity_rh}% RH {humidity_status} | Passing alert to API Gateway...")
        else:
            print(f"[{status}] Temp: {temp_celsius}°C | Humidity: {humidity_rh}% RH {humidity_status} | GPS: {gps_coords}")

        # 4. HTTP TRANSMISSION TO FASTAPI EDGE GATEWAY
        # The backend API automatically logs any received temperature breaches to the ledger
        try:
            response = requests.post("http://127.0.0.1:8000/api/update", json=live_payload, timeout=5)
            if response.status_code != 200:
                print(f"⚠️  API returned non-200 status: {response.status_code} - {response.text}")
        except requests.exceptions.ConnectionError:
            print("❌ [PUBLISHER] Connection refused — FastAPI server not running at http://127.0.0.1:8000/api/update")
        except requests.exceptions.Timeout:
            print("❌ [PUBLISHER] Request timeout — FastAPI server not responding")
        except Exception as e:
            print(f"❌ [PUBLISHER] POST error: {type(e).__name__}: {e}")

        time.sleep(3)

if __name__ == "__main__":
    run_sensor_simulation()