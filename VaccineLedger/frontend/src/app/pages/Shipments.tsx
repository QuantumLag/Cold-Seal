import { useState } from 'react';
import { Link } from 'react-router';
import { mockShipments } from '../data/mockData';
import SearchBar from '../components/SearchBar';
import QualityBadge from '../components/QualityBadge';
import { TEMPERATURE_SAFE_MAX_C, TEMPERATURE_SAFE_MIN_C, TEMPERATURE_WARNING_BUFFER_C } from '../utils/temperatureThresholds';

export default function Shipments() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredShipments = mockShipments.filter(shipment =>
    shipment.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shipment.vaccineType.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shipment.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shipment.batchNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shipment.currentLocation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-2">All Shipments</h1>
        <p className="text-muted-foreground">Search and manage vaccine shipments</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by ID, vaccine type, manufacturer, batch, or location..."
        />
      </div>

      {/* Results Count */}
      <div className="mb-4 text-sm text-muted-foreground">
        {filteredShipments.length} shipment{filteredShipments.length !== 1 ? 's' : ''} found
      </div>

      {/* Shipments Grid */}
      <div className="grid gap-4">
        {filteredShipments.map((shipment) => (
          <Link
            key={shipment.id}
            to={`/shipments/${shipment.id}`}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-border"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-mono font-semibold">{shipment.id}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    shipment.status === 'in-transit' ? 'bg-blue-50 text-blue-700' :
                    shipment.status === 'delivered' ? 'bg-emerald-50 text-emerald-700' :
                    'bg-amber-50 text-amber-700'
                  }`}>
                    {shipment.status === 'in-transit' ? 'In Transit' :
                     shipment.status === 'delivered' ? 'Delivered' : 'Delayed'}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground mb-1">
                  {shipment.vaccineType} • {shipment.manufacturer}
                </div>
                <div className="text-sm text-muted-foreground">
                  Batch: {shipment.batchNumber} • {shipment.quantity.toLocaleString()} doses
                </div>
              </div>
              <QualityBadge score={shipment.qualityScore} showDescription />
            </div>

            <div className="grid grid-cols-4 gap-4 pt-4 border-t border-border">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Current Location</div>
                <div className="text-sm font-medium">{shipment.currentLocation}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Temperature</div>
                <div className={`text-sm font-mono font-medium ${
                  shipment.currentTemp > TEMPERATURE_SAFE_MAX_C || shipment.currentTemp < TEMPERATURE_SAFE_MIN_C ? 'text-red-500' :
                  shipment.currentTemp > TEMPERATURE_SAFE_MAX_C - TEMPERATURE_WARNING_BUFFER_C || shipment.currentTemp < TEMPERATURE_SAFE_MIN_C + TEMPERATURE_WARNING_BUFFER_C ? 'text-amber-500' :
                  'text-blue-600'
                }`}>
                  {shipment.currentTemp.toFixed(1)}°C
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Humidity</div>
                <div className={`text-sm font-mono font-medium ${
                  shipment.currentHumidity > 48 || shipment.currentHumidity < 42 ? 'text-red-500' :
                  shipment.currentHumidity > 46 || shipment.currentHumidity < 44 ? 'text-amber-500' :
                  'text-cyan-600'
                }`}>
                  {shipment.currentHumidity.toFixed(1)}%
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Violations</div>
                <div className={`text-sm font-medium ${
                  shipment.violations.length > 0 ? 'text-red-500' : 'text-emerald-600'
                }`}>
                  {shipment.violations.length}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
