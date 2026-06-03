import { useParams, Link } from 'react-router';
import { ArrowLeft, Thermometer, Droplets, Package, Shield, MapPin, Clock, AlertTriangle } from 'lucide-react';
import { mockShipments } from '../data/mockData';
import ShipmentMap from '../components/ShipmentMap';
import QualityBadge from '../components/QualityBadge';
import { useState, useEffect } from 'react';
import { TEMPERATURE_SAFE_MAX_C, TEMPERATURE_SAFE_MIN_C, TEMPERATURE_WARNING_BUFFER_C } from '../utils/temperatureThresholds';

export default function ShipmentDetail() {
  const { id } = useParams();
  const shipment = mockShipments.find(s => s.id === id);

  const [currentTemp, setCurrentTemp] = useState(shipment?.currentTemp || 2.3);
  const [currentHumidity, setCurrentHumidity] = useState(shipment?.currentHumidity || 45);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTemp(prev => parseFloat((prev + (Math.random() - 0.5) * 0.3).toFixed(1)));
      setCurrentHumidity(prev => parseFloat((prev + (Math.random() - 0.5) * 0.5).toFixed(1)));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  if (!shipment) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">Shipment not found</p>
      </div>
    );
  }

  const getStatusColor = (temp: number, humidity: number) => {
    if (temp > TEMPERATURE_SAFE_MAX_C || temp < TEMPERATURE_SAFE_MIN_C || humidity > 48 || humidity < 42) return 'text-red-500';
    if (temp > TEMPERATURE_SAFE_MAX_C - TEMPERATURE_WARNING_BUFFER_C || temp < TEMPERATURE_SAFE_MIN_C + TEMPERATURE_WARNING_BUFFER_C || humidity > 46 || humidity < 44) return 'text-amber-500';
    return 'text-blue-600';
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Link to="/shipments" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to shipments</span>
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold mb-2 font-mono">{shipment.id}</h1>
            <p className="text-muted-foreground">
              {shipment.vaccineType} • {shipment.manufacturer} • {shipment.quantity.toLocaleString()} doses
            </p>
          </div>
          <QualityBadge score={shipment.qualityScore} showDescription size="lg" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Thermometer className="w-5 h-5 text-blue-600" />
            </div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          </div>
          <div className={`text-3xl font-semibold font-mono mb-1 ${getStatusColor(currentTemp, currentHumidity)}`}>
            {currentTemp.toFixed(1)}°C
          </div>
          <div className="text-sm text-muted-foreground">Temperature</div>
          <div className="mt-3 text-xs text-muted-foreground">Range: 2.0°C - 8.0°C</div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-cyan-50 rounded-xl flex items-center justify-center">
              <Droplets className="w-5 h-5 text-cyan-600" />
            </div>
            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
          </div>
          <div className={`text-3xl font-semibold font-mono mb-1 ${getStatusColor(currentTemp, currentHumidity)}`}>
            {currentHumidity.toFixed(1)}%
          </div>
          <div className="text-sm text-muted-foreground">Humidity</div>
          <div className="mt-3 text-xs text-muted-foreground">Range: 43% - 47%</div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <div className="text-3xl font-semibold font-mono mb-1 text-emerald-600">
            {shipment.qualityScore.toFixed(1)}%
          </div>
          <div className="text-sm text-muted-foreground">Quality Score</div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <div className="text-3xl font-semibold font-mono mb-1">{shipment.violations.length}</div>
          <div className="text-sm text-muted-foreground">Violations</div>
        </div>
      </div>

      {/* Map and Details */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold mb-1">Shipment Route</h3>
              <p className="text-sm text-muted-foreground">{shipment.origin} → {shipment.destination}</p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">{shipment.currentLocation}</span>
            </div>
          </div>
          <ShipmentMap />
        </div>

        <div className="space-y-6">
          {/* Shipment Details */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold mb-4">Shipment Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Vaccine Type</span>
                <span className="font-medium">{shipment.vaccineType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Manufacturer</span>
                <span className="font-medium">{shipment.manufacturer}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Batch Number</span>
                <span className="font-mono">{shipment.batchNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quantity</span>
                <span className="font-medium">{shipment.quantity.toLocaleString()} doses</span>
              </div>
              <div className="h-px bg-border my-2"></div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Departed</span>
                <span className="font-mono text-xs">{shipment.departureTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">ETA</span>
                <span className="font-mono text-xs">{shipment.eta}</span>
              </div>
            </div>
          </div>

          {/* Blockchain Info */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-4 h-4 text-emerald-500" />
              <h3 className="font-semibold">Blockchain Record</h3>
            </div>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Transaction Hash</div>
                <div className="font-mono text-sm text-blue-600 break-all">0x7a9f4c2e...d8b6a3f1</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Block</div>
                  <div className="font-mono text-sm">18,247,936</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Confirmations</div>
                  <div className="font-mono text-sm text-emerald-600">2,847</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
