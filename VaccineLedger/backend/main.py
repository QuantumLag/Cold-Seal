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

# 1. PATH CONFIGURATION
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(BASE_DIR)
load_dotenv(os.path.join(ROOT_DIR, ".env"))

app = FastAPI()

# Enable CORS for browser requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. WEBSOCKET MANAGER (For Live UI Updates)
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                pass

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
    """WebSocket endpoint for live temperature/GPS updates from IoT device"""
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_json()
            # Expected format: {temp: int (raw ×10), gps: string}
            # Add current integrity score before broadcasting
            if contract:
                try:
                    score, _, _ = contract.functions.getUIStatus().call()
                    data['score'] = score  # 0-100%
                    data['timestamp'] = datetime.now().isoformat()
                except:
                    pass
            await manager.broadcast(data)
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# ==================== LEGACY ENDPOINTS ====================

@app.post("/api/update")
async def update_data(data: dict):
    """Endpoint for publisher.py to push live IoT data"""
    # Add integrity score
    if contract:
        try:
            score, _, _ = contract.functions.getUIStatus().call()
            data['score'] = score
            data['timestamp'] = datetime.now().isoformat()
        except:
            pass
    await manager.broadcast(data)
    return {"status": "success"}

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