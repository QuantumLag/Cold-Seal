import os
import json
from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from web3 import Web3
from dotenv import load_dotenv
from typing import List
from datetime import datetime
from predictive_degradation.arrhenius_engine import predictor

# 1. PATH CONFIGURATION
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(BASE_DIR)
load_dotenv(os.path.join(ROOT_DIR, ".env"))

app = FastAPI()

# ==================== CORS CONFIGURATION ====================
# Enable CORS explicitly for Next.js frontend at localhost:3000
# This allows the browser to make requests from the frontend dashboard
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",      # Next.js development server
        "http://127.0.0.1:3000",      # Alternative localhost format
        "http://localhost:5173",      # Vite dev server (if used)
        "http://127.0.0.1:5173",
        "*"                            # Fallback for other clients
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "Accept"],
    expose_headers=["Content-Type"],
    max_age=3600,
)

# 2. WEBSOCKET MANAGER (For Live UI Updates)
class ConnectionManager:
    """Manages WebSocket connections and broadcasts telemetry to all connected clients"""
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.message_queue = []  # Buffer last N messages for diagnostics

    async def connect(self, websocket: WebSocket):
        """Accept and register a new WebSocket connection"""
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"[WS] Client connected. Total clients: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        """Unregister a disconnected client"""
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        print(f"[WS] Client disconnected. Total clients: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        """
        Broadcast telemetry message to all connected WebSocket clients.
        
        Expected message format includes:
        {
            'temp': int (raw ×10, e.g., 55 = 5.5°C),
            'humidity': float (0-100%),
            'gps': string (e.g., "12.9716,77.5946"),
            'status': string (e.g., "🚨 BREACH" or "✅ SAFE"),
            'timestamp': string (ISO format or HH:MM:SS),
            'score': int (0-100, SLA compliance percentage),
            'viability': float (0-100, biological vaccine health),
            'recommendation': string (clinical usage advice),
            'expires_in_hours': float (predicted shelf life remaining)
        }
        """
        # Ensure all required keys are present
        sanitized = {
            'temp': message.get('temp', 0),
            'humidity': message.get('humidity', 0),
            'gps': message.get('gps', '0,0'),
            'status': message.get('status', ''),
            'timestamp': message.get('timestamp', datetime.now().isoformat()),
            'score': message.get('score'),
            'viability': message.get('viability'),
            'recommendation': message.get('recommendation'),
            'expires_in_hours': message.get('expires_in_hours'),
        }
        
        # Store in message queue (last 100 messages for diagnostics)
        self.message_queue.append(sanitized)
        if len(self.message_queue) > 100:
            self.message_queue.pop(0)
        
        # Broadcast to all connected clients
        disconnected_clients = []
        for connection in self.active_connections:
            try:
                await connection.send_json(sanitized)
            except Exception as e:
                print(f"[WS] Error sending to client: {e}")
                disconnected_clients.append(connection)
        
        # Clean up dead connections
        for client in disconnected_clients:
            self.disconnect(client)

manager = ConnectionManager()

# 3. TEMPLATES & BLOCKCHAIN SETUP
template_path = os.path.join(BASE_DIR, "templates")
templates = Jinja2Templates(directory=template_path)

GANACHE_URL = os.getenv("GANACHE_URL", "http://127.0.0.1:7545")
CONTRACT_ADDRESS = os.getenv("CONTRACT_ADDRESS")
ABI_PATH = os.path.join(BASE_DIR, "abi.json")

w3 = Web3(Web3.HTTPProvider(GANACHE_URL))

try:
    with open(ABI_PATH, "r") as f:
        CONTRACT_ABI = json.load(f)
except FileNotFoundError:
    CONTRACT_ABI = []

contract = None
if CONTRACT_ADDRESS and CONTRACT_ABI:
    contract = w3.eth.contract(address=CONTRACT_ADDRESS, abi=CONTRACT_ABI)

# 4. INTEGRITY SCORE CALCULATION HELPERS
TEMP_MIN_RAW = 20      # 2.0°C
TEMP_MAX_RAW = 80      # 8.0°C

def is_breach(temp_raw: int) -> bool:
    """Check if temperature is outside safe zone (2.0-8.0°C)"""
    return temp_raw < TEMP_MIN_RAW or temp_raw > TEMP_MAX_RAW

def fetch_integrity_score() -> dict:
    """Fetch current integrity score from blockchain (0-100%)"""
    if not contract:
        return {"score": 0, "error": "Contract not initialized"}
    try:
        score, _, _ = contract.functions.getUIStatus().call()
        return {"score": score}  # Already 0-100 from getUIStatus()
    except Exception as e:
        return {"score": 0, "error": str(e)}

def fetch_log_count() -> dict:
    """Fetch total number of logged readings"""
    if not contract:
        return {"logCount": 0, "error": "Contract not initialized"}
    try:
        log_count = contract.functions.logCount().call()
        return {"logCount": log_count}
    except Exception as e:
        return {"logCount": 0, "error": str(e)}

def fetch_blockchain_records() -> list:
    """Fetch all breach records from blockchain history"""
    if not contract:
        return []
    try:
        log_count = contract.functions.logCount().call()
        records = []
        
        for log_id in range(1, log_count + 1):
            try:
                temp, gps, timestamp = contract.functions.history(log_id).call()
                
                # Only include breaches
                if is_breach(temp):
                    # Recalculate integrity score at time of breach
                    # For now, we fetch current score as approximation
                    current_score, _, _ = contract.functions.getUIStatus().call()
                    
                    records.append({
                        "logId": log_id,
                        "timestamp": datetime.fromtimestamp(timestamp).isoformat(),
                        "temp": temp,  # Raw value, dashboard will divide by 10
                        "gps": gps,
                        "integrityAfter": current_score * 100,  # Convert back to 0-10000 scale for consistency
                    })
            except Exception as e:
                continue
        
        return records
    except Exception as e:
        return []

# 5. ROUTES

@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse(request=request, name="index.html")

# ==================== DASHBOARD API ENDPOINTS ====================

@app.get("/integrity-score")
async def get_integrity_score():
    """Get current integrity score (0-100%)"""
    return fetch_integrity_score()

@app.get("/log-count")
async def get_log_count():
    """Get total number of logged readings"""
    return fetch_log_count()

@app.get("/blockchain-records")
async def get_blockchain_records():
    """Get all breach records from blockchain"""
    return fetch_blockchain_records()

# ==================== WEBSOCKET ====================

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time telemetry streaming to the dashboard.
    
    The frontend connects here and receives broadcasted messages whenever
    publisher.py sends data to /api/update.
    
    Message format sent to frontend:
    {
        'temp': int (raw ×10),
        'humidity': float,
        'gps': string,
        'status': string,
        'timestamp': string,
        'score': int (0-100%)
    }
    """
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive and handle any incoming messages
            data = await websocket.receive_json()
            # Echo with integrity score for any direct WebSocket messages from frontend
            if contract:
                try:
                    score, _, _ = contract.functions.getUIStatus().call()
                    data['score'] = score
                except:
                    pass
            await manager.broadcast(data)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        print(f"[WS] Unexpected error: {e}")
        manager.disconnect(websocket)

# ==================== LEGACY ENDPOINTS ====================

@app.post("/api/update")
async def update_data(data: dict):
    """
    Endpoint for edge monitoring devices to push live telemetry data.
    
    This endpoint:
    1. Normalizes data structures from both physical hardware and simulation feeds
    2. Runs the native Python Arrhenius Degradation Model on the telemetry feed
    3. Adds the current contractual blockchain integrity score
    4. Logs temperature breaches to Ganache blockchain securely with explicit types
    5. Broadcasts the enriched payload to all WebSocket-connected UI clients
    """
    # 1. EXTRACT DATA & NORMALIZE POTENTIAL TYPE MISMATCHES
    incoming_temp = data.get('temp', 0.0)
    
    # Auto-detect if incoming temp is a raw float (e.g., 5.6) or an unscaled integer (e.g., 5)
    if isinstance(incoming_temp, float) or (incoming_temp > -20 and incoming_temp < 20):
        temp_celsius = float(incoming_temp)
        temp_raw = int(temp_celsius * 10)  # Scale to match uint256 contract constraints
    else:
        temp_raw = int(incoming_temp)
        temp_celsius = temp_raw / 10.0

    # Ensure the dictionary payload contains the scaled integer format for the dashboard UI
    data['temp'] = temp_raw

    # Compile hardware split-coordinate vectors (lat/lng) into a unified string structure
    if 'lat' in data and 'lng' in data:
        gps = f"{data['lat']:.6f},{data['lng']:.6f}"
        data['gps'] = gps
    else:
        gps = data.get('gps', '0,0')

    # 2. RUN ARRHENIUS PREDICTIVE DEGRADATION CALCULATIONS
    try:
        from predictive_degradation.arrhenius_engine import predictor
        metrics = predictor.calculate_quality(temp_celsius)
        
        # Inject the scientific results into the main data payload dictionary
        data['viability'] = metrics['qualityScore']
        data['recommendation'] = metrics['recommendation']
        data['expires_in_hours'] = round(metrics['predictedExpiry'] / 3600, 1)
    except Exception as e:
        print(f"[/api/update] Arrhenius Engine Calculation Error: {e}")
        data['viability'] = 100.0
        data['recommendation'] = "Calculation unavailable"
        data['expires_in_hours'] = 0.0

    # 3. FETCH CURRENT CONTRACTUAL BLOCKCHAIN INTEGRITY SCORE
    if contract:
        try:
            score, last_temp, last_gps = contract.functions.getUIStatus().call()
            data['score'] = score  # 0-100 compliance percentage
        except Exception as e:
            print(f"[/api/update] Blockchain read error: {e}")
            data['score'] = None
    
    # Add/update timestamp if missing
    if 'timestamp' not in data or not data['timestamp']:
        data['timestamp'] = datetime.now().isoformat()
    
    # 4. LOG BREACH TO BLOCKCHAIN IF TEMPERATURE IS OUTSIDE SAFE ZONE (2.0°C - 8.0°C)
    if contract and (temp_raw < TEMP_MIN_RAW or temp_raw > TEMP_MAX_RAW):
        try:
            print(f"[/api/update] BREACH DETECTED: Temp={temp_celsius}°C. Recording violation to Ganache...")
            
            # Explicitly type cast both parameters to match contract signature rules: logData(uint256, string)
            tx_hash = contract.functions.logData(int(temp_raw), str(gps)).transact({"from": w3.eth.accounts[0]})
            receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
            print(f"[/api/update] ⛓️  Breach logged at block {receipt['blockNumber']}")
            
            # Fetch the updated blockchain status immediately after mining the drop
            score, _, _ = contract.functions.getUIStatus().call()
            data['score'] = score
        except Exception as e:
            print(f"[/api/update] Blockchain write error: {e}")
    
    # 5. LIVE DISTRIBUTED BROADCAST OVER OPEN WEBSOCKET
    await manager.broadcast(data)
    
    return {
        "status": "success",
        "temp_raw": temp_raw,
        "temp_celsius": temp_celsius,
        "gps": gps,
        "score": data.get('score'),
        "viability": data.get('viability'),
        "recommendation": data.get('recommendation'),
        "expires_in_hours": data.get('expires_in_hours')
    }

@app.get("/api/status")
async def get_status():
    """Legacy endpoint - get current blockchain state"""
    if not contract:
        return {"error": "Contract not initialized."}
    try:
        score, raw_temp, gps = contract.functions.getUIStatus().call()
        return {
            "integrity": score,
            "temp": raw_temp,
            "gps": gps
        }
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)