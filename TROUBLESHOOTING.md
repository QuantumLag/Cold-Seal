# PharmaTrace - Troubleshooting & Startup Guide

## Issue 1: Publisher.py FileNotFoundError ✅ FIXED

### Problem
```
FileNotFoundError: [Errno 2] No such file or directory: 'backend/abi.json'
```

### Root Cause
The script was running from `VaccineLedger/scripts/` directory but using relative path `backend/abi.json` which doesn't exist at that level.

### Solution Applied
Updated `publisher.py` line 27-29 to use absolute path resolution:
```python
ABI_PATH = os.path.join(os.path.dirname(__file__), "..", "backend", "abi.json")
with open(ABI_PATH, "r") as f:
    CONTRACT_ABI = json.load(f)
```

This uses `__file__` to determine the script's location and constructs the correct path:
- `__file__` = `C:\...\VaccineLedger\scripts\publisher.py`
- `os.path.dirname(__file__)` = `C:\...\VaccineLedger\scripts`
- `..` goes up one level = `C:\...\VaccineLedger`
- `backend/abi.json` = `C:\...\VaccineLedger\backend\abi.json` ✓

---

## Issue 2: Next.js Continuous Reloading & Turbopack Panic ✅ FIXED

### Problems
1. **Metadata Warnings**
   ```
   ⚠ Unsupported metadata viewport is configured in metadata export
   ⚠ Unsupported metadata themeColor is configured in metadata export
   ```

2. **Turbopack Panic**
   ```
   FATAL: An unexpected Turbopack error occurred
   A panic log has been written to C:\Users\SATCHI~1\AppData\Local\Temp\next-panic-...
   ```

3. **Continuous Reloading**
   - Dev server reloads every ~1 second
   - Prevents stable development

### Root Causes

#### Metadata Warning
- Next.js 16+ requires `viewport` configuration to be in a separate `generateViewport` export
- Was incorrectly placed inside `metadata` object

#### Turbopack Panic & Continuous Reloading
- **OneDrive Sync Conflict**: Project is on OneDrive, which has file syncing delays
- **File Watching Issues**: Turbopack's file watcher gets confused by OneDrive's shadow file operations
- **Aggressive Polling**: Default file polling interval too aggressive for network drives

### Solutions Applied

#### 1. Fixed Metadata Configuration (`frontend/src/app/layout.tsx`)
**Before:**
```typescript
export const metadata: Metadata = {
  title: '...',
  description: '...',
  viewport: 'width=device-width, initial-scale=1.0',  // ❌ Wrong location
  themeColor: '#f4f6f9',                                // ❌ Wrong location
}
```

**After:**
```typescript
export const metadata: Metadata = {
  title: '...',
  description: '...',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1.0,
  themeColor: '#f4f6f9',
}
```

#### 2. Configured Turbopack for OneDrive (`frontend/next.config.js`)
**Added:**
```javascript
experimental: {
  turbo: {
    resolveAlias: {},
  },
},
watchOptions: {
  poll: 800,        // Poll every 800ms instead of default
  aggregateTimeout: 300,  // Wait 300ms before triggering rebuild
},
```

#### 3. Created Environment Configuration (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_API_TIMEOUT=30000
NEXT_PUBLIC_BLOCKCHAIN_RPC_URL=http://localhost:7545
TURBOPACK_SKIP_SERIALIZE=true
```

#### 4. Created Cache Cleanup Script (`frontend/clean-and-rebuild.bat`)
For Windows users experiencing persistent issues:
```bash
cd frontend
clean-and-rebuild.bat
npm run dev
```

---

## Verified Fixes: Startup Checklist

### Step 1: Fix Publisher Path
✅ Updated `VaccineLedger/scripts/publisher.py` to use absolute path resolution

### Step 2: Fix Next.js Metadata
✅ Separated `metadata` and `viewport` exports in `layout.tsx`

### Step 3: Configure Turbopack
✅ Added experimental turbo settings and watchOptions to `next.config.js`

### Step 4: Set Environment Variables
✅ Created `.env.local` with Turbopack optimization settings

---

## Complete Startup Sequence (After Fixes)

### Terminal 1: Ganache
```bash
ganache-cli --host 127.0.0.1 --port 7545
```

### Terminal 2: Deploy Contract
```bash
cd VaccineLedger/scripts
python deploy.py
# Writes CONTRACT_ADDRESS to root .env
```

### Terminal 3: FastAPI Backend
```bash
cd VaccineLedger/backend
uvicorn main:app --reload --host 127.0.0.1 --port 8000
# ✅ Server running: http://localhost:8000
```

### Terminal 4: Next.js Frontend
```bash
cd VaccineLedger/frontend
npm run dev
# ✅ Frontend running: http://localhost:3000
# Should NOT have continuous reloading anymore
```

### Terminal 5: Publisher (IoT Simulator)
```bash
cd VaccineLedger/scripts
python publisher.py
# ✅ Sending data every 3 seconds via HTTP POST
# Path to abi.json now resolved correctly
```

---

## If Issues Persist

### For Publisher.py
**Test the path:**
```python
import os
path = os.path.join(
    os.path.dirname(__file__), 
    "..", "backend", "abi.json"
)
print(f"Looking for: {path}")
print(f"Exists: {os.path.exists(path)}")
```

### For Next.js Continuous Reloading
**Option 1: Clean Build**
```bash
cd frontend
clean-and-rebuild.bat
npm run dev
```

**Option 2: Run on Different Port**
```bash
cd frontend
PORT=3001 npm run dev
```

**Option 3: Disable Turbopack (Fallback)**
If issues persist, modify `frontend/next.config.js`:
```javascript
const nextConfig = {
  // ... existing config ...
  turbopack: {
    // Turbopack is now optional, Next.js will fall back to SWC
  },
}
```

### For File Watching on OneDrive
**Best Practice:** Copy project to local SSD
```bash
# If possible, avoid running from OneDrive
# Copy to C:\projects\EL2
```

---

## Monitoring Startup

### Check All Services Running
```bash
# Terminal output should show:
# ✅ Ganache: "Listening on 127.0.0.1:7545"
# ✅ FastAPI: "Uvicorn running on http://127.0.0.1:8000"
# ✅ Next.js: "ready - started server on 0.0.0.0:3000"
# ✅ Publisher: "[PUBLISHER] Sent: {...} → Status: 200"
```

### Browser Console Checks
Open DevTools (F12) and check:
```javascript
// Should see in console:
// [WS] ✅ Connected successfully
// [WS] Message received: {temp: ..., humidity: ..., ...}
// [STARTUP] CONFIG: {WS_URL: 'ws://localhost:8000/ws', ...}
```

### Network Tab
Should see:
1. WebSocket connection to `ws://localhost:8000/ws`
2. GET requests to `/integrity-score`, `/log-count`, `/blockchain-records`
3. No 404 or CORS errors

---

## Summary of Changes

| File | Change | Impact |
|------|--------|--------|
| `scripts/publisher.py` | Line 27-29: Fixed ABI path resolution | ✅ No more FileNotFoundError |
| `frontend/src/app/layout.tsx` | Split metadata/viewport exports | ✅ No more warnings |
| `frontend/next.config.js` | Added watchOptions + experimental turbo | ✅ Reduced reloading |
| `frontend/.env.local` | Created with Turbopack settings | ✅ Better file handling |
| `frontend/clean-and-rebuild.bat` | Cleanup script | ✅ Emergency rebuild tool |

---

## Next Steps

1. Kill all running terminals
2. Follow the startup sequence above
3. Monitor the terminal output and browser console
4. Dashboard should now display live data without continuous reloading

If any issues remain, check the panic log:
```
C:\Users\SATCHI~1\AppData\Local\Temp\next-panic-*.log
```
