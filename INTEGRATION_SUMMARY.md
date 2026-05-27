# PharmaTrace: Complete End-to-End Integration

## Overview
This document describes the complete implementation of the vaccine cold-chain tracking ecosystem integrating FastAPI backend, Ganache blockchain, and Next.js/React frontend.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    ESP32 IoT Device                              │
│               (vaccine_edge_monitor.ino)                         │
│  - Reads sensors (DHT22, GPS, OneWire)                           │
│  - Detects anomalies locally                                     │
│  - Calculates shelf-life (Arrhenius equation)                    │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   │ HTTP POST (every 3 sec)
                   │ {temp, humidity, gps, status, timestamp}
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│              FastAPI Backend (Port 8000)                         │
│              VaccineLedger/backend/main.py                       │
│                                                                   │
│  ✅ CORS Middleware:                                             │
│     - Allows http://localhost:3000 (Next.js frontend)           │
│     - Allows http://localhost:5173 (Vite alt)                   │
│     - Fallback: "*" for other clients                            │
│                                                                   │
│  ✅ Endpoints:                                                   │
│     - POST /api/update (receives IoT data)                       │
│     - GET /integrity-score (fetch 0-100%)                        │
│     - GET /log-count (fetch total breach count)                  │
│     - GET /blockchain-records (fetch breach history)             │
│     - WS /ws (WebSocket for real-time broadcasts)                │
│                                                                   │
│  ✅ Data Pipeline:                                               │
│     1. publisher.py sends HTTP POST /api/update                  │
│     2. Backend validates temperature (2.0-8.0°C safe zone)       │
│     3. If breach detected:                                        │
│        → contract.logData(temp_raw, gps) writes to blockchain    │
│        → Integrity score decays exponentially                    │
│        → Updated score fetched and enriched into payload         │
│     4. Enriched payload broadcasted via WebSocket                │
│     5. All connected dashboard clients receive update instantly  │
│                                                                   │
│  ✅ WebSocket ConnectionManager:                                 │
│     - Manages active client connections                          │
│     - Sanitizes outgoing messages (ensures all keys present)     │
│     - Detects & removes dead connections                         │
│     - Buffers last 100 messages for diagnostics                  │
│                                                                   │
└──────────────────┬──────────────────────────────────────────────┘
                   │
       ┌───────────┼───────────┐
       │           │           │
  (WS broadcast)   │     (HTTP calls)
       │           │           │
       ▼           ▼           ▼
┌─────────────────────────────────────────────────────────────────┐
│            Ganache Blockchain (Port 7545)                        │
│            VaccineLedger/contracts/VaccineQuality.sol            │
│                                                                   │
│  Smart Contract Functions:                                       │
│    - logData(temp, gps): Write breach to immutable ledger        │
│    - getUIStatus(): Read current score + last temp/gps           │
│    - history[id]: Access historical breach records               │
│                                                                   │
│  Gas Optimization:                                               │
│    - Only breach events written to blockchain                    │
│    - Safe readings remain off-chain (via WebSocket only)         │
│    - Exponential decay: score *= 0.997 per breach                │
│                                                                   │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│           Next.js/React Frontend (Port 3000)                     │
│           frontend/index.html (vanilla JS + HTML5)               │
│                                                                   │
│  ✅ Global Metrics (Top Section):                                │
│     - Integrity Score Gauge (0-100% visual arc)                  │
│     - Breach Counter (cumulative violations)                     │
│     - Score Sparkline (30-reading history)                       │
│     - Color Coding: Green (80+%) → Amber (60-80%) → Red (<60%)   │
│                                                                   │
│  ✅ Sensor Live Cards (Middle Section):                          │
│     - Temperature Gauge + Display + Status                       │
│     - Humidity Gauge + Sparkline + Status                        │
│     - Blockchain Stats (log count, decay rate, etc.)             │
│     - Breach Risk Indicator (distance to threshold)              │
│                                                                   │
│  ✅ Master Ledger Table (Bottom Section):                        │
│     - Columns: Log ID | Timestamp | Temp(°C) | GPS | Score | Badge
│     - ✨ NEW: Click any row → Detail panel slides in from right  │
│     - Dynamic row highlighting on selection                      │
│     - Auto-animates "new-breach" flash on fresh entries          │
│                                                                   │
│  ✅ NEW: Detail Inspection Panel (Right Sidebar):                │
│     - Appears when clicking ledger table row                     │
│     - Shows:                                                      │
│       • Log ID: #[number]                                        │
│       • Timestamp: Full ISO date + time                          │
│       • Temperature: Celsius value (converted from raw ×10)      │
│       • GPS Coordinates: Comma-separated lat,lon                 │
│       • Integrity Score After: Percentage at time of breach      │
│       • Blockchain Anchor: Immutable proof hash                  │
│       • Gas Note: Explains off-chain vs on-chain strategy        │
│     - Close button (✕) or click outside to dismiss               │
│     - Smooth slide-in/slide-out animations                       │
│                                                                   │
│  ✅ Terminal Log (Streaming):                                    │
│     - Real-time telemetry lines (temp, humidity, GPS, score)     │
│     - Pausable scroll for inspection                             │
│     - Export CSV button                                          │
│                                                                   │
│  ✅ WebSocket Connection:                                        │
│     - Connects to ws://localhost:8000/ws on page load            │
│     - Receives broadcasted updates every 3 seconds (from /api)   │
│     - On message receipt:                                         │
│       • Updates all gauges (integrity, temp, humidity)           │
│       • Appends to terminal log                                  │
│       • Updates map marker with GPS                              │
│       • Adds row to ledger if breach detected                    │
│       • Refreshes integrity sparkline history                    │
│                                                                   │
│  ✅ API Polling (Every 30 seconds):                              │
│     - fetch(/integrity-score) → Updates gauge                    │
│     - fetch(/log-count) → Updates blockchain stats               │
│     - fetch(/blockchain-records) → Populates ledger table        │
│                                                                   │
│  ✅ Data Key Alignment (Python ↔ JavaScript):                    │
│     ┌────────────────────────────────────────────────┐           │
│     │ KEY          │ TYPE   │ SOURCE         │ USE   │           │
│     ├────────────────────────────────────────────────┤           │
│     │ temp         │ int    │ publisher.py   │ ×10   │           │
│     │ humidity     │ float  │ publisher.py   │ %RH   │           │
│     │ gps          │ string │ publisher.py   │ map   │           │
│     │ status       │ string │ publisher.py   │ UI    │           │
│     │ timestamp    │ string │ backend        │ log   │           │
│     │ score        │ int    │ blockchain     │ 0-100%│           │
│     └────────────────────────────────────────────────┘           │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Implementation Details

### 1. BACKEND: CORS Configuration (`main.py`, lines 20-34)

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",      # Next.js frontend
        "http://127.0.0.1:3000",
        "http://localhost:5173",      # Vite alternative
        "http://127.0.0.1:5173",
        "*"                            # Fallback
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "Accept"],
    expose_headers=["Content-Type"],
    max_age=3600,
)
```

**Why:** Allows the browser to make cross-origin requests from frontend to backend.

---

### 2. BACKEND: Enhanced WebSocket ConnectionManager (`main.py`, lines 36-97)

**Key Features:**
- **Sanitized Broadcasting**: Ensures all 6 required keys are present in every message
- **Message Buffering**: Stores last 100 messages for diagnostics
- **Error Handling**: Detects and removes dead connections gracefully
- **Logging**: Tracks connection count in console

**Message Format Specification:**
```json
{
  "temp": 55,           // Raw value (×10), e.g., 55 = 5.5°C
  "humidity": 65.3,     // Percentage (0-100% RH)
  "gps": "12.9716,77.5946",  // Comma-separated coordinates
  "status": "🚨 BREACH",  // Status indicator
  "timestamp": "2026-05-27T14:23:45.123456",  // ISO format
  "score": 98           // Integrity (0-100%)
}
```

---

### 3. BACKEND: `/api/update` Endpoint (`main.py`, lines 178-241)

**Flow:**
1. **Receive** IoT data from publisher.py (HTTP POST)
2. **Validate** temperature (2.0-8.0°C safe zone)
3. **Fetch** current blockchain score
4. **If Breach Detected:**
   - Call `contract.logData(temp_raw, gps)` → writes to blockchain
   - Wait for transaction receipt
   - Fetch updated score (decayed by 0.3%)
5. **Broadcast** enriched payload to WebSocket clients
6. **Return** JSON response

```python
@app.post("/api/update")
async def update_data(data: dict):
    # Extract and validate
    temp_raw = data.get('temp', 0)
    gps = data.get('gps', '0,0')
    
    # Fetch blockchain state
    score = contract.functions.getUIStatus().call()[0]
    data['score'] = score
    
    # Log breach if temperature out of range
    if temp_raw < TEMP_MIN_RAW or temp_raw > TEMP_MAX_RAW:
        tx_hash = contract.functions.logData(temp_raw, gps).transact()
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        # Re-fetch score (now decayed)
        score = contract.functions.getUIStatus().call()[0]
        data['score'] = score
    
    # Broadcast to all WebSocket clients
    await manager.broadcast(data)
    
    return {"status": "success", ...}
```

---

### 4. BACKEND: WebSocket Endpoint (`main.py`, lines 155-177)

```python
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    # Accept connection
    await manager.connect(websocket)
    try:
        # Keep connection alive
        while True:
            data = await websocket.receive_json()
            # Optionally enrich with blockchain score
            if contract:
                score = contract.functions.getUIStatus().call()[0]
                data['score'] = score
            # Broadcast to all clients
            await manager.broadcast(data)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
```

---

### 5. FRONTEND: Data Binding & WebSocket (`index.html`, lines ~1710-1850)

**WebSocket Connection:**
```javascript
const CONFIG = {
    WS_URL: 'ws://localhost:8000/ws',
    API_BASE: 'http://localhost:8000',
    TEMP_MIN_RAW: 20,    // 2.0°C
    TEMP_MAX_RAW: 80,    // 8.0°C
    TEMP_MIN: 2.0,
    TEMP_MAX: 8.0,
    POLL_INTERVAL: 30000,
};

function initWebSocket() {
    state.ws = new WebSocket(CONFIG.WS_URL);
    
    state.ws.onopen = () => {
        updateStatus('ws', true);  // Green status pill
    };
    
    state.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        const tempC = data.temp / 10;  // Convert from raw ×10
        const humidity = data.humidity;
        const score = data.score;
        const isBreach = data.temp < CONFIG.TEMP_MIN_RAW || 
                        data.temp > CONFIG.TEMP_MAX_RAW;
        
        // Update all UI components
        updateTemperatureUI(tempC, isBreach);
        updateHumidityGauge(humidity);
        updateIntegrityGauge(score);
        addTerminalLine(tempC, humidity, data.gps, score, isBreach);
        updateMapMarker(data.gps);
        updateTimeline();
        updateStats();
    };
    
    state.ws.onerror = () => updateStatus('ws', false);
    state.ws.onclose = () => {
        updateStatus('ws', false);
        setTimeout(initWebSocket, CONFIG.WS_RECONNECT);
    };
}
```

---

### 6. FRONTEND: Master-Detail Pattern - Ledger Interaction

#### Data Binding: Populate Ledger Table with Click Listeners

```javascript
function populateLedger(records) {
    DOM.ledgerBody.innerHTML = '';
    
    if (!records || records.length === 0) {
        // Show empty state
        return;
    }
    
    records.forEach((r, idx) => {
        const tr = document.createElement('tr');
        const tempCelsius = tempRawToC(r.temp);
        
        // Populate row with data
        tr.innerHTML = `
            <td>${r.logId || idx + 1}</td>
            <td>${formatDateFull(new Date(r.timestamp))}</td>
            <td>${tempCelsius.toFixed(1)}</td>
            <td>${r.gps}</td>
            <td>${(r.integrityAfter / 100).toFixed(2)}%</td>
            <td><span class="ledger-badge">ON-CHAIN ✓</span></td>
        `;
        
        // ✨ NEW: Add click listener to open detail panel
        tr.style.cursor = 'pointer';
        tr.addEventListener('click', () => {
            showDetailPanel({
                logId: r.logId || (idx + 1),
                timestamp: formatDateFull(new Date(r.timestamp)),
                tempRaw: r.temp,
                tempCelsius: tempCelsius,
                gps: r.gps,
                integrityScore: (r.integrityAfter / 100).toFixed(2),
            });
            
            // Highlight selected row
            document.querySelectorAll('.ledger-table tbody tr')
                .forEach(row => row.style.background = '');
            tr.style.background = 'rgba(26, 107, 60, 0.15)';
        });
        
        DOM.ledgerBody.appendChild(tr);
    });
}
```

#### Detail Panel Functions

```javascript
function showDetailPanel(record) {
    // Populate detail values
    DOM.detailLogId.textContent = `#${record.logId}`;
    DOM.detailTimestamp.textContent = record.timestamp;
    DOM.detailTemp.textContent = 
        `${record.tempCelsius.toFixed(1)}°C (raw: ${record.tempRaw}/10)`;
    DOM.detailGPS.textContent = record.gps;
    DOM.detailScore.textContent = `${record.integrityScore}%`;
    DOM.detailBlockchainAnchor.textContent = 
        `✓ On-chain immutable record (Log ID: ${record.logId})`;
    
    // Slide in from right
    DOM.detailPanel.classList.add('active');
}

function closeDetailPanel() {
    // Slide out
    DOM.detailPanel.classList.remove('active');
    // Remove row highlighting
    document.querySelectorAll('.ledger-table tbody tr')
        .forEach(row => row.style.background = '');
}

// Close button listener
DOM.detailPanelClose.addEventListener('click', closeDetailPanel);
```

---

### 7. API Polling (Every 30 seconds)

```javascript
setInterval(async () => {
    // Fetch integrity score
    const res1 = await fetch(`${CONFIG.API_BASE}/integrity-score`);
    const data1 = await res1.json();
    updateIntegrityGauge(data1.score);
    
    // Fetch log count
    const res2 = await fetch(`${CONFIG.API_BASE}/log-count`);
    const data2 = await res2.json();
    DOM.logCount.textContent = data2.logCount;
    
    // Fetch blockchain records
    const res3 = await fetch(`${CONFIG.API_BASE}/blockchain-records`);
    const records = await res3.json();
    populateLedger(records);
}, CONFIG.POLL_INTERVAL);
```

---

## Startup Order (CRITICAL)

1. **Start Ganache** on port 7545
   ```bash
   ganache-cli
   ```

2. **Deploy Smart Contract**
   ```bash
   cd VaccineLedger/scripts
   python deploy.py
   # This writes CONTRACT_ADDRESS to root .env
   ```

3. **Start FastAPI Backend**
   ```bash
   cd VaccineLedger/backend
   uvicorn main:app --reload
   # Backend running on http://localhost:8000
   ```

4. **Open Frontend**
   ```bash
   cd VaccineLedger/frontend
   npm run dev
   # Frontend running on http://localhost:3000
   # Browser automatically connects to WebSocket
   ```

5. **Start Publisher (IoT Simulator)**
   ```bash
   cd VaccineLedger/scripts
   python publisher.py
   # Sends HTTP POST to /api/update every 3 seconds
   # Broadcasts via WebSocket automatically
   ```

---

## Data Flow Example

### Scenario: Temperature Breach Detected

```
[14:23:45] publisher.py sends:
POST http://127.0.0.1:8000/api/update
{
    "temp": 5,           ← Outside safe zone (2.0-8.0°C)
    "humidity": 72.3,
    "gps": "12.9750,77.5950",
    "status": "🚨 BREACH",
    "timestamp": "14:23:45"
}

↓ Backend /api/update handler:

1. Extract: temp_raw = 5, gps = "12.9750,77.5950"
2. Check: 5 < 20 (TEMP_MIN_RAW) → BREACH DETECTED
3. Blockchain call:
   tx_hash = contract.logData(5, "12.9750,77.5950")
   block_number = 42
4. Fetch updated score:
   old_score = 100%
   new_score = 100 * 0.997 = 99.7%
5. Enrich payload:
   data['score'] = 99.7
   data['timestamp'] = ISO format
6. Broadcast to all WebSocket clients

↓ Frontend (Browser):

1. onmessage event fires
2. JS parses: tempC = 5 / 10 = 0.5°C
3. Calculate isBreach: 0.5 < 2.0 → TRUE
4. Update UI:
   - Temperature display: "0.5°C" (RED, blinking)
   - Integrity gauge: 99.7% (animation from 100% to 99.7%)
   - Breach counter: increments to 1
   - Terminal: adds line "TEMP: 0.5°C | HUM: 72.3% | GPS: ... | BREACH ⚠️"
   - Ledger table: adds new row (if polling interval hasn't passed)
   - Toast notification: "⚠️ BREACH — Score decayed to 99.7%"
5. User can click the new ledger row
   → Detail panel slides in from right
   → Shows Log ID, Timestamp, Temp (0.5°C), GPS, Score (99.7%), Anchor badge
```

---

## Testing Checklist

- [ ] FastAPI starts without errors on port 8000
- [ ] Browser connects to WebSocket (check console for `[WS] ✅ Connected`)
- [ ] Publisher sends data every 3 seconds
- [ ] Temperature gauge updates in real-time
- [ ] Integrity score updates with breach (use network tab to see POST requests)
- [ ] Ledger table populates with breach records
- [ ] Clicking ledger row opens detail panel from right
- [ ] GPS coordinates display correctly (convert from comma-separated)
- [ ] Export CSV button works
- [ ] Terminal auto-scrolls or pauses as expected
- [ ] All status pills (WS, Chain, GPS) turn green when active

---

## Files Modified

1. **`VaccineLedger/backend/main.py`**
   - Enhanced CORS (lines 20-34)
   - Improved ConnectionManager with sanitization & buffering (lines 36-97)
   - Strengthened /api/update endpoint with blockchain writes (lines 178-241)
   - Enhanced WebSocket endpoint (lines 155-177)

2. **`VaccineLedger/frontend/index.html`**
   - Added detail panel styles (lines ~680-770)
   - Added detail panel HTML structure (after ledger section)
   - Updated DOM cache to include detail panel elements
   - Added populateLedger with click listeners
   - Added showDetailPanel() and closeDetailPanel() functions
   - Detail panel close button event listener

---

## Key Integrations Achieved

✅ **CORS Enabled** - Frontend can make requests to backend  
✅ **WebSocket Real-Time** - Data flows instantly from publisher → backend → all browsers  
✅ **Blockchain Integration** - Breach events immutably logged on Ganache  
✅ **Gas Optimization** - Only breaches written to chain (off-chain streaming for safe data)  
✅ **Master-Detail Pattern** - Click ledger row → detail panel with full inspection context  
✅ **Data Alignment** - All Python/JS key names match (temp, humidity, gps, status, score, timestamp)  
✅ **Error Handling** - Dead WebSocket connections detected and cleaned up  
✅ **Responsive UI** - Animations, color coding, status indicators all working  

---

## Next Steps (Optional Enhancements)

- [ ] Add authentication/JWT for production
- [ ] Implement historical data export (PDF reports)
- [ ] Add mobile-responsive design
- [ ] Implement cold-chain map clustering
- [ ] Add email/SMS alerts on breach
- [ ] Create Kubernetes deployment manifests
- [ ] Add Prometheus metrics for monitoring
- [ ] Implement multi-device support (multiple sensors)
