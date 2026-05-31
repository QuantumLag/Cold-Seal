import { Package, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { mockShipments } from '../data/mockData';
import { Link } from 'react-router';
import QualityBadge from '../components/QualityBadge';

export default function Dashboard() {
  const totalShipments = mockShipments.length;
  const activeShipments = mockShipments.filter(s => s.status === 'in-transit').length;
  const totalViolations = mockShipments.reduce((acc, s) => acc + s.violations.length, 0);
  const avgQuality = mockShipments.reduce((acc, s) => acc + s.qualityScore, 0) / totalShipments;

  const recentShipments = mockShipments.slice(0, 4);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Monitor all vaccine shipments and cold chain metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="text-3xl font-semibold font-mono mb-1">{totalShipments}</div>
          <div className="text-sm text-muted-foreground">Total Shipments</div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <div className="text-3xl font-semibold font-mono mb-1">{activeShipments}</div>
          <div className="text-sm text-muted-foreground">In Transit</div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <div className="text-3xl font-semibold font-mono mb-1">{totalViolations}</div>
          <div className="text-sm text-muted-foreground">Active Violations</div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-cyan-50 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-cyan-600" />
            </div>
          </div>
          <div className="text-3xl font-semibold font-mono mb-1">{avgQuality.toFixed(1)}%</div>
          <div className="text-sm text-muted-foreground">Avg Quality Score</div>
        </div>
      </div>

      {/* Recent Shipments */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold">Recent Shipments</h2>
          <Link to="/shipments" className="text-sm text-blue-600 hover:text-blue-700">
            View all →
          </Link>
        </div>

        <div className="space-y-4">
          {recentShipments.map((shipment) => (
            <Link
              key={shipment.id}
              to={`/shipments/${shipment.id}`}
              className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-mono font-medium">{shipment.id}</span>
                  <QualityBadge score={shipment.qualityScore} size="sm" />
                </div>
                <div className="text-sm text-muted-foreground">
                  {shipment.vaccineType} • {shipment.manufacturer} • {shipment.quantity.toLocaleString()} doses
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">{shipment.currentLocation}</div>
                <div className="text-xs text-muted-foreground">
                  {shipment.currentTemp.toFixed(1)}°C • {shipment.currentHumidity.toFixed(1)}%
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
