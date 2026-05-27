# ========================================
# STARTUP ORDER (CRITICAL — READ FIRST):
# ========================================
# 1. Start Ganache (blockchain local node)
# 2. Run deploy.py (deploys contract, writes CONTRACT_ADDRESS to .env)
# 3. Run: uvicorn main:app --reload   (starts FastAPI + WebSocket server)
# 4. Open index.html in browser (connects WebSocket)
# 5. Run publisher.py LAST (begins sending data)
#
# If publisher.py runs before the FastAPI server is up, all POSTs fail silently.
# ========================================

import time
import random
import requests
import json
import os
from web3 import Web3
from dotenv import load_dotenv

load_dotenv()

# 1. BLOCKCHAIN CONNECTION
w3 = Web3(Web3.HTTPProvider(os.getenv("GANACHE_URL")))
# Use the first account from Ganache to pay for gas
w3.eth.default_account = w3.eth.accounts[0]

CONTRACT_ADDRESS = os.getenv("CONTRACT_ADDRESS")
# Fix relative path: scripts/ is one level deep, so go up to VaccineLedger/, then into backend/
ABI_PATH = os.path.join(os.path.dirname(__file__), "..", "backend", "abi.json")
with open(ABI_PATH, "r") as f:
    CONTRACT_ABI = json.load(f)

contract = w3.eth.contract(address=CONTRACT_ADDRESS, abi=CONTRACT_ABI)

# Starting GPS (Bengaluru)
lat, lon = 12.9716, 77.5946

def run_sensor_simulation():
    global lat, lon
    print("🚀 Cold Chain Simulator Active...")
    print(f"🔗 Connected to Contract: {CONTRACT_ADDRESS}")
    
    while True:
        # 1. SIMULATE SENSOR DATA
        temp_celsius = round(random.uniform(1.5, 12.0), 1)
        # Humidity simulation: 30-95% RH (normal safe zone: 40-70%)
        humidity_rh = round(random.uniform(30.0, 95.0), 1)
        
        lat += random.uniform(-0.0005, 0.0005)
        lon += random.uniform(-0.0005, 0.0005)
        gps_coords = f"{lat:.4f},{lon:.4f}"

        # 2. DEFINE BREACH LOGIC
        # Temperature breach: outside 2.0-8.0°C
        is_temp_breach = temp_celsius < 2.0 or temp_celsius > 8.0
        # Humidity breach: outside 40-70% (but does NOT hit blockchain — see below)
        is_humidity_breach = humidity_rh < 40.0 or humidity_rh > 70.0
        
        status = "🚨 BREACH" if is_temp_breach else "✅ SAFE"
        humidity_status = "⚠ OUT OF RANGE" if is_humidity_breach else "✓ OPTIMAL"
        
        # 3. THE LIVE FEED (FASTAPI WEBSOCKET)
        # We send EVERY reading to the dashboard for the live UI, including humidity
        # Note: Temperature is stored as raw (×10) for blockchain compatibility
        live_payload = {
            "temp": int(temp_celsius * 10),  # Raw value (×10 scaled)
            "humidity": humidity_rh,          # Already a real float
            "gps": gps_coords,
            "status": status,
            "timestamp": time.strftime("%H:%M:%S")
        }
        
        try:
            response = requests.post("http://127.0.0.1:8000/api/update", json=live_payload, timeout=5)
            print(f"[PUBLISHER] Sent: {live_payload} → Status: {response.status_code}")
            if response.status_code != 200:
                print(f"⚠️  API returned non-200 status: {response.status_code} - {response.text}")
        except requests.exceptions.ConnectionError:
            print("❌ [PUBLISHER] Connection refused — FastAPI server not running at http://127.0.0.1:8000/api/update")
        except requests.exceptions.Timeout:
            print("❌ [PUBLISHER] Request timeout — FastAPI server not responding")
        except Exception as e:
            print(f"❌ [PUBLISHER] POST error: {type(e).__name__}: {e}")

        # 4. THE BLOCKCHAIN ANCHOR (IMMUTABLE AUDIT)
        # We ONLY log to the blockchain if there's a TEMPERATURE breach
        # Humidity is logged in the live feed but NOT written to blockchain (gas optimization)
        # This is intentional: humidity is environment awareness, not core integrity
        if is_temp_breach:
            print(f"[{status}] Temp: {temp_celsius}°C | Humidity: {humidity_rh}% RH {humidity_status} | Recording violation to Blockchain...")
            blockchain_temp = int(temp_celsius * 10)
            try:
                tx_hash = contract.functions.logData(blockchain_temp, gps_coords).transact()
                w3.eth.wait_for_transaction_receipt(tx_hash)
                print(f"⛓️  Blockchain: Violation sealed in block.")
            except Exception as e:
                print(f"❌ Blockchain Error: {e}")
        else:
            print(f"[{status}] Temp: {temp_celsius}°C | Humidity: {humidity_rh}% RH {humidity_status} | GPS: {gps_coords} (Off-chain only)")

        time.sleep(3)

if __name__ == "__main__":
    run_sensor_simulation()