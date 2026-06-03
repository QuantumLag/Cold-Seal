import { Code, Link as LinkIcon, FileJson, Activity, Terminal } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function SmartContractRules() {
  const [events, setEvents] = useState<{ id: string; hash: string; time: string; type: string }[]>([]);

  useEffect(() => {
    // Mock event listener for smart contract events
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const newEvent = {
          id: Math.random().toString(36).substr(2, 9),
          hash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
          time: new Date().toLocaleTimeString(),
          type: Math.random() > 0.5 ? 'TelemetryAnchored' : 'SlaBreachTriggered',
        };
        setEvents((prev) => [newEvent, ...prev].slice(0, 15));
      }
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-2 flex items-center gap-2">
          <Code className="w-6 h-6 text-blue-600" />
          Smart Contract Rules
        </h1>
        <p className="text-muted-foreground">Immutable logic governing your shipping SLA</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* SLA Threshold Parameters */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">SLA Threshold Parameters</h2>
          <div className="space-y-4 flex-1">
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
              <div className="text-sm font-semibold text-gray-700 mb-2">Temperature Rules</div>
              <div className="text-sm font-mono bg-white p-3 border border-gray-100 rounded-lg text-blue-700">
                IF Temp &gt; 8.0°C FOR &gt; 30 mins <br />
                <span className="text-red-500">→ Trigger Automatic SLA Breach</span>
              </div>
              <div className="text-sm font-mono bg-white p-3 border border-gray-100 rounded-lg text-blue-700 mt-2">
                IF Temp &lt; 2.0°C FOR &gt; 15 mins <br />
                <span className="text-red-500">→ Trigger Automatic SLA Breach</span>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
              <div className="text-sm font-semibold text-gray-700 mb-2">Shock Rules</div>
              <div className="text-sm font-mono bg-white p-3 border border-gray-100 rounded-lg text-blue-700">
                IF Accel &gt; 2.5g (Instantaneous) <br />
                <span className="text-red-500">→ Trigger Critical Shock Breach</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contract Metadata */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Contract Metadata</h2>
          <div className="space-y-4">
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                <LinkIcon className="w-3 h-3" /> Deployed Address (Ganache RPC)
              </div>
              <div className="text-sm font-mono bg-gray-50 p-2 rounded border border-gray-200 break-all text-gray-700">
                0x742d35Cc6634C0532925a3b844Bc454e4438f44e
              </div>
            </div>
            
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                <FileJson className="w-3 h-3" /> ABI Interface Schema
              </div>
              <div className="text-xs font-mono bg-gray-900 text-green-400 p-3 rounded-lg overflow-hidden h-24 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900 pointer-events-none"></div>
                {`[
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "shipmentId", "type": "bytes32" },
      { "indexed": false, "name": "violationType", "type": "string" }
    ],
    "name": "SlaBreachTriggered",
    "type": "event"
  }
]`}
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Activity className="w-3 h-3" /> Gas Usage Statistics
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                  <div className="text-xs text-blue-600 mb-1">Avg Anchor Cost</div>
                  <div className="text-lg font-mono font-semibold text-blue-800">45,210 gas</div>
                </div>
                <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                  <div className="text-xs text-emerald-600 mb-1">Total Anchors</div>
                  <div className="text-lg font-mono font-semibold text-emerald-800">1,204</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Event Listener Log */}
      <div className="bg-gray-900 rounded-2xl shadow-sm border border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800 bg-black flex items-center gap-2">
          <Terminal className="w-5 h-5 text-green-400" />
          <h2 className="text-sm font-mono font-semibold text-green-400">Real-time Event Listener Log</h2>
          <div className="ml-auto flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-mono text-green-500">Listening to Ganache RPC...</span>
          </div>
        </div>
        <div className="p-6 font-mono text-sm overflow-x-auto">
          {events.length === 0 ? (
            <div className="text-gray-600 italic">Waiting for smart contract events...</div>
          ) : (
            <div className="space-y-2">
              {events.map((evt) => (
                <div key={evt.id} className="flex flex-col md:flex-row gap-2 md:gap-4 hover:bg-gray-800/50 p-1 rounded transition-colors">
                  <span className="text-gray-500 w-24 shrink-0">[{evt.time}]</span>
                  <span className={evt.type === 'SlaBreachTriggered' ? 'text-red-400 w-44 shrink-0' : 'text-blue-400 w-44 shrink-0'}>
                    {evt.type}
                  </span>
                  <span className="text-gray-300 break-all">{evt.hash}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
