import { Settings2, Sliders, Globe, Save } from 'lucide-react';
import { useState } from 'react';

export default function SystemSettings() {
  const [tempOffset, setTempOffset] = useState('0.0');
  const [ldrBaseline, setLdrBaseline] = useState('0');
  const [shockThreshold, setShockThreshold] = useState('2.5');
  const [backendUrl, setBackendUrl] = useState('ws://localhost:8000/ws');
  const [rpcUrl, setRpcUrl] = useState('http://127.0.0.1:8545');

  const handleSave = (section: string) => {
    // In a real app, this would dispatch an action or make an API call
    console.log(`Saved settings for ${section}`);
    alert(`Settings for ${section} applied to edge nodes successfully!`);
  };

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-2 flex items-center gap-2">
            <Settings2 className="w-6 h-6 text-gray-700" />
            System Settings
          </h1>
          <p className="text-muted-foreground">Interactive configuration for field tracking nodes</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Calibration and Offsets */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
              <Sliders className="w-5 h-5 text-indigo-500" />
              Calibration & Offsets
            </h2>
            <button onClick={() => handleSave('Calibration')} className="text-sm bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg font-medium hover:bg-indigo-100 transition-colors flex items-center gap-1">
              <Save className="w-4 h-4" /> Apply to Nodes
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Temperature Offset (°C)</label>
              <p className="text-xs text-gray-500 mb-2">Fine-tune baseline for ambient variations.</p>
              <input
                type="number"
                step="0.1"
                value={tempOffset}
                onChange={(e) => setTempOffset(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-shadow"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">LDR Baseline Scale (lx)</label>
              <p className="text-xs text-gray-500 mb-2">Reset the ambient light baseline scale.</p>
              <input
                type="number"
                value={ldrBaseline}
                onChange={(e) => setLdrBaseline(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-shadow"
              />
            </div>
          </div>
        </div>

        {/* Threshold Adjustments */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Threshold Adjustments
            </h2>
            <button onClick={() => handleSave('Thresholds')} className="text-sm bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg font-medium hover:bg-amber-100 transition-colors flex items-center gap-1">
              <Save className="w-4 h-4" /> Apply to Nodes
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Physical Shock Limit (g-force)</label>
              <p className="text-xs text-gray-500 mb-2">Magnitude required to flag an anomaly before blockchain anchor.</p>
              <input
                type="number"
                step="0.1"
                value={shockThreshold}
                onChange={(e) => setShockThreshold(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-shadow"
              />
            </div>
          </div>
        </div>

        {/* Network & Endpoint Provisioning */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
              <Globe className="w-5 h-5 text-emerald-500" />
              Network & Endpoint Provisioning
            </h2>
            <button onClick={() => handleSave('Network')} className="text-sm bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg font-medium hover:bg-emerald-100 transition-colors flex items-center gap-1">
              <Save className="w-4 h-4" /> Provision
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">FastAPI Backend WS URL</label>
              <p className="text-xs text-gray-500 mb-2">Dynamically update the edge node target telemetry sink.</p>
              <input
                type="text"
                value={backendUrl}
                onChange={(e) => setBackendUrl(e.target.value)}
                className="w-full px-3 py-2 font-mono text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-shadow"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ganache RPC Network Address</label>
              <p className="text-xs text-gray-500 mb-2">Blockchain node for contract interaction.</p>
              <input
                type="text"
                value={rpcUrl}
                onChange={(e) => setRpcUrl(e.target.value)}
                className="w-full px-3 py-2 font-mono text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-shadow"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
// Define AlertTriangle locally as we need it
function AlertTriangle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}
