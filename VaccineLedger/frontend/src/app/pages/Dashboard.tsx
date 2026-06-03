import { useEffect, useState } from 'react';
import { Package, TrendingUp, AlertTriangle, CheckCircle2, Wifi, WifiOff } from 'lucide-react';
import { mockShipments } from '../data/mockData';
import LiveTransitMap from '../components/LiveTransitMap';
import { formatTimeOnly, formatDateTime } from '../utils/dateFormatter';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';

interface TelemetryData {
  temp?: number;
  humidity?: number;
  light?: number;
  accel?: number;
  gps?: string;
  status?: string;
  breach_level?: string;
  timestamp?: string;
  score?: number;
  viability?: number;
  recommendation?: string;
  expires_in_hours?: number;
}

interface LogEntry extends TelemetryData {
  id?: string;
}

export default function Dashboard() {
  // ==================== REACT STATE ENGINE ====================
  const [latestData, setLatestData] = useState<TelemetryData>({
    temp: undefined,
    humidity: undefined,
    light: undefined,
    accel: undefined,
    gps: '0,0',
    status: 'System Starting...',
    timestamp: new Date().toISOString(),
    score: 100,
    viability: 100,
    recommendation: 'Initializing...',
    expires_in_hours: 0,
  });

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // ==================== WEBSOCKET INITIALIZATION ====================
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;
    const reconnectDelay = 3000;

    const connect = () => {
      try {
        ws = new WebSocket('ws://localhost:8000/ws');

        ws.onopen = () => {
          console.log('[Dashboard] ✅ WebSocket connected to ws://localhost:8000/ws');
          setIsConnected(true);
          setConnectionError(null);
          reconnectAttempts = 0;
        };

        ws.onmessage = (event) => {
          try {
            const data: TelemetryData = JSON.parse(event.data);
            console.log('[Dashboard] 📡 Received telemetry:', data);

            // ==================== PARSE & UPDATE LIVE DATA ====================
            // Convert raw temp value (scaled by 10) to Celsius for display
            const tempCelsius = data.temp !== undefined ? (data.temp / 10).toFixed(1) : undefined;

            const processedData: TelemetryData = {
              temp: data.temp,
              humidity: data.humidity,
              light: data.light,
              accel: data.accel,
              gps: data.gps || '0,0',
              status: data.status || '⏳ Connecting...',
              breach_level: data.breach_level || 'safe',
              timestamp: data.timestamp || new Date().toISOString(),
              score: data.score !== undefined ? data.score : 100,
              viability: data.viability !== undefined ? data.viability : 100,
              recommendation: data.recommendation || 'System online...',
              expires_in_hours: data.expires_in_hours !== undefined ? data.expires_in_hours : 0,
            };

            // Update latest data (state for real-time display)
            setLatestData(processedData);

            // Prepend new frame to logs (audit trail) - KEEP ONLY 20 MOST RECENT
            const logEntry: LogEntry = {
              ...processedData,
              id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            };
            setLogs((prevLogs) => [logEntry, ...prevLogs].slice(0, 20)); // Keep last 20 entries for performance
          } catch (err) {
            console.error('[Dashboard] Error parsing WebSocket message:', err);
          }
        };

        ws.onerror = (error) => {
          console.error('[Dashboard] ❌ WebSocket error:', error);
          setIsConnected(false);
          setConnectionError('WebSocket connection failed');
        };

        ws.onclose = () => {
          console.log('[Dashboard] WebSocket disconnected');
          setIsConnected(false);

          // Attempt reconnection
          if (reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;
            console.log(
              `[Dashboard] Attempting reconnection (${reconnectAttempts}/${maxReconnectAttempts}) in ${reconnectDelay}ms...`
            );
            setTimeout(connect, reconnectDelay);
          } else {
            setConnectionError('Max reconnection attempts reached');
          }
        };
      } catch (err) {
        console.error('[Dashboard] Failed to create WebSocket:', err);
        setConnectionError('Failed to create WebSocket connection');
      }
    };

    connect();

    // Cleanup on unmount
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  // ==================== CALCULATE LIVE METRICS ====================
  // Use live data when available, fallback to mock data
  const totalShipments = mockShipments.length;
  const activeShipments = mockShipments.filter((s) => s.status === 'in-transit').length;
  const totalViolations = mockShipments.reduce((acc, s) => acc + s.violations.length, 0);
  const avgQuality = mockShipments.reduce((acc, s) => acc + s.qualityScore, 0) / totalShipments;

  // Live blockchain compliance score
  const blockchainScore = latestData.score !== undefined ? latestData.score : 100;

  // Live vaccine viability from Arrhenius model
  const vaccineViability = latestData.viability !== undefined ? latestData.viability : 100;

  // Live shelf life from predictive model
  const shelfLife =
    latestData.expires_in_hours !== undefined
      ? `${latestData.expires_in_hours} hours`
      : 'Calculating...';

  // Live clinical recommendation
  const clinicalRecommendation = latestData.recommendation || 'System online...';

  return (
    <div className="p-8">
      {/* Header with Live Connection Status */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Monitor all vaccine shipments and cold chain metrics</p>
        </div>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <>
              <Wifi className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-600">Live Connected</span>
            </>
          ) : (
            <>
              <WifiOff className="w-5 h-5 text-red-600" />
              <span className="text-sm font-medium text-red-600">
                {connectionError || 'Connecting...'}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Real-Time Stats Grid - Bound to Live Data */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {/* Blockchain SLA Compliance */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-blue-600">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="text-3xl font-semibold font-mono mb-1">
            {latestData.score !== undefined ? `${latestData.score}.00%` : '100.00%'}
          </div>
          <div className="text-sm text-muted-foreground">SLA Compliance Score</div>
          <div className="text-xs text-gray-500 mt-2">⛓️ Blockchain verified</div>
        </div>

        {/* Vaccine Viability - Arrhenius Model */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-emerald-600">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <div className="text-3xl font-semibold font-mono mb-1">
            {latestData.viability !== undefined ? `${latestData.viability}%` : '100.00%'}
          </div>
          <div className="text-sm text-muted-foreground">Vaccine Viability</div>
          <div className="text-xs text-gray-500 mt-2">🧬 Biological Health</div>
        </div>

        {/* Shelf Life Prediction */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-amber-600">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <div className="text-3xl font-semibold font-mono mb-1 truncate">{shelfLife}</div>
          <div className="text-sm text-muted-foreground">Time to Expiry</div>
          <div className="text-xs text-gray-500 mt-2">⏱️ Predictive Model</div>
        </div>

        {/* Clinical Recommendation */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-cyan-600">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-cyan-50 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-cyan-600" />
            </div>
          </div>
          <div className="text-sm font-medium text-cyan-900 line-clamp-2">{clinicalRecommendation}</div>
          <div className="text-sm text-muted-foreground mt-3">Clinical Recommendation</div>
          <div className="text-xs text-gray-500 mt-2">💊 Usage Guidance</div>
        </div>
      </div>

      {/* Current Telemetry Snapshot & Live Map */}
      {isConnected && (
        <div className="grid grid-cols-3 gap-6 mb-8">
          {/* Telemetry Snapshot */}
          <div className="col-span-1 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 shadow-sm border border-blue-200 flex flex-col justify-between">
            <div className="space-y-6">
              <div>
                <div className="text-xs uppercase tracking-wider text-gray-600 mb-1">Temperature</div>
                <div className="text-2xl font-mono font-semibold">
                  {latestData.temp !== undefined ? `${(latestData.temp / 10).toFixed(1)}°C` : 'N/A'}
                </div>
                <div className="text-xs text-gray-500 mt-1">Safe Range: 2.0 - 8.0°C</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-gray-600 mb-1">Humidity</div>
                <div className="text-2xl font-mono font-semibold">
                  {latestData.humidity !== undefined ? `${latestData.humidity.toFixed(1)}%` : 'N/A'}
                </div>
                <div className="text-xs text-gray-500 mt-1">Relative Humidity</div>
              </div>
                <div className="grid grid-cols-2 gap-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="rounded-xl border border-blue-100 bg-white/80 px-4 py-3 text-left shadow-sm transition hover:border-blue-200 hover:bg-white">
                        <div className="text-xs uppercase tracking-wider text-gray-600 mb-1">Light</div>
                        <div className="text-lg font-mono font-semibold">
                          {latestData.light !== undefined ? `${latestData.light.toFixed(1)} lx` : 'N/A'}
                        </div>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56">
                      <DropdownMenuLabel>Light Level</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem disabled className="opacity-100">
                        Current: {latestData.light !== undefined ? `${latestData.light.toFixed(1)} lx` : 'N/A'}
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled className="opacity-100">
                        Sensor: BH1750
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="rounded-xl border border-blue-100 bg-white/80 px-4 py-3 text-left shadow-sm transition hover:border-blue-200 hover:bg-white">
                        <div className="text-xs uppercase tracking-wider text-gray-600 mb-1">Accelerometer</div>
                        <div className="text-lg font-mono font-semibold">
                          {latestData.accel !== undefined ? `${latestData.accel.toFixed(2)} g` : 'N/A'}
                        </div>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56">
                      <DropdownMenuLabel>Accelerometer</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem disabled className="opacity-100">
                        Magnitude: {latestData.accel !== undefined ? `${latestData.accel.toFixed(2)} g` : 'N/A'}
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled className="opacity-100">
                        Sensor: MPU6050
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-gray-600 mb-1">Location</div>
                <div className="text-lg font-mono font-semibold truncate">{latestData.gps || 'N/A'}</div>
                <div className="text-xs text-gray-500 mt-1">Coordinates</div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-blue-100 text-xs text-gray-600">
              Last update: {formatTimeOnly(latestData.timestamp)}
            </div>
          </div>

          {/* Live Transit Map Widget */}
          <div className="col-span-2">
            <LiveTransitMap 
              gps={latestData.gps} 
              status={latestData.status} 
              breach_level={latestData.breach_level}
              lastUpdate={formatTimeOnly(latestData.timestamp)} 
            />
          </div>
        </div>
      )}

      {/* Audit Trail - Historical Data Stream */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-semibold">Real-Time Audit Trail</h2>
            <p className="text-xs text-gray-500 mt-1">Live telemetry stream from edge sensors</p>
          </div>
          <div className="text-xs font-mono text-gray-600">{logs.length} records</div>
        </div>

        {logs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {isConnected
                ? 'Waiting for telemetry data from sensors...'
                : 'Connect to backend to receive live data'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Timestamp</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Temperature</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Humidity</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Light</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Accel</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">GPS Location</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">SLA Score</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Viability</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-mono text-xs text-gray-700">
                      {formatTimeOnly(log.timestamp)}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold">
                      {log.temp !== undefined ? `${(log.temp / 10).toFixed(1)}°C` : 'N/A'}
                    </td>
                    <td className="py-3 px-4 font-mono">
                      {log.humidity !== undefined ? `${log.humidity.toFixed(1)}%` : 'N/A'}
                    </td>
                    <td className="py-3 px-4 font-mono">
                      {log.light !== undefined ? `${log.light.toFixed(1)} lx` : 'N/A'}
                    </td>
                    <td className="py-3 px-4 font-mono">
                      {log.accel !== undefined ? `${log.accel.toFixed(2)} g` : 'N/A'}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-gray-600">{log.gps || 'N/A'}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          log.breach_level === 'safe'
                            ? 'bg-emerald-100 text-emerald-700'
                            : log.breach_level === 'warning'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {log.status || 'UNKNOWN'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-blue-600">
                      {log.score !== undefined ? `${log.score}%` : 'N/A'}
                    </td>
                    <td className={`py-3 px-4 font-mono font-semibold ${
                      (log.viability ?? 100) >= 85 ? 'text-emerald-600' :
                      (log.viability ?? 100) >= 70 ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      {log.viability !== undefined ? `${log.viability}%` : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
