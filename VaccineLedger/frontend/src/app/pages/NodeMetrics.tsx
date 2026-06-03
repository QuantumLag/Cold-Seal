import { Battery, BatteryCharging, BatteryWarning, Wifi, Cpu, HardDrive, Database, Send, AlertTriangle } from 'lucide-react';

export default function NodeMetrics() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-2">Node & Sensor Metrics</h1>
        <p className="text-muted-foreground">Administrator diagnostics for the edge node hardware</p>
      </div>

      <div className="grid gap-6">
        {/* Hardware Diagnostics */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-blue-600" />
            Hardware Diagnostics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <div className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                <Battery className="w-4 h-4" /> Battery Status
              </div>
              <div className="text-2xl font-mono font-semibold text-emerald-600">100%</div>
              <div className="text-xs text-gray-500 mt-1">Voltage: 4.15V</div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <div className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                <Wifi className="w-4 h-4" /> Wi-Fi RSSI
              </div>
              <div className="text-2xl font-mono font-semibold text-blue-600">-65 dBm</div>
              <div className="text-xs text-gray-500 mt-1">Good Signal Strength</div>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <div className="text-sm text-gray-500 mb-2">Peripheral Status</div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center justify-between">
                  <span className="font-mono">DHT11</span>
                  <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs font-medium">Connected</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="font-mono">MPU6050</span>
                  <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs font-medium">Connected</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="font-mono">SD Card</span>
                  <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs font-medium">Mounted</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Storage & Queue Status */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-purple-600" />
            Storage & Queue Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Internal SPIFFS</span>
                <span className="text-sm font-mono text-gray-500">1.2 MB / 4.0 MB</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: '30%' }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Used for caching offline telemetry</p>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">MicroSD Card</span>
                <span className="text-sm font-mono text-gray-500">45 MB / 32 GB</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '1%' }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Used for deep historical backups</p>
            </div>
          </div>
        </div>

        {/* Sync Pipeline Telemetry */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Send className="w-5 h-5 text-emerald-600" />
            Sync Pipeline Telemetry
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6 flex flex-col items-center justify-center text-center">
              <Database className="w-8 h-8 text-emerald-600 mb-2" />
              <div className="text-3xl font-mono font-bold text-emerald-700">14,592</div>
              <div className="text-sm text-emerald-900 mt-1">Packets Transmitted</div>
            </div>
            
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-6 flex flex-col items-center justify-center text-center">
              <AlertTriangle className="w-8 h-8 text-amber-600 mb-2" />
              <div className="text-3xl font-mono font-bold text-amber-700">0</div>
              <div className="text-sm text-amber-900 mt-1">Cached Offline Packets</div>
              <div className="text-xs text-amber-700 mt-2">Awaiting network sync</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
