import { MapPin } from 'lucide-react';

interface RouteStop {
  lat: number;
  lng: number;
  location: string;
  status: 'completed' | 'current' | 'pending';
  time: string;
}

const routeStops: RouteStop[] = [
  { lat: 40.7128, lng: -74.0060, location: 'New York, NY', status: 'completed', time: 'May 31, 14:30' },
  { lat: 41.8781, lng: -87.6298, location: 'Chicago, IL', status: 'completed', time: 'May 31, 18:45' },
  { lat: 39.7392, lng: -104.9903, location: 'Denver, CO', status: 'current', time: 'Jun 01, 02:15' },
  { lat: 37.7749, lng: -122.4194, location: 'San Francisco, CA', status: 'pending', time: 'Jun 02, 09:15' }
];

export default function ShipmentMap() {
  // Convert lat/lng to SVG coordinates
  const latRange = [37, 42];
  const lngRange = [-122, -74];

  const toSVGCoords = (lat: number, lng: number) => {
    const x = ((lng - lngRange[0]) / (lngRange[1] - lngRange[0])) * 700 + 50;
    const y = ((latRange[1] - lat) / (latRange[1] - latRange[0])) * 300 + 30;
    return { x, y };
  };

  const points = routeStops.map(stop => ({
    ...stop,
    coords: toSVGCoords(stop.lat, stop.lng)
  }));

  // Create path for route line
  const pathData = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.coords.x} ${p.coords.y}`)
    .join(' ');

  return (
    <div className="relative bg-gray-50 rounded-xl overflow-hidden" style={{ height: '400px' }}>
      {/* Map SVG */}
      <svg className="w-full h-full" viewBox="0 0 800 360">
        {/* Background grid */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="800" height="360" fill="url(#grid)" />

        {/* Route line */}
        <path
          d={pathData}
          stroke="#3b82f6"
          strokeWidth="3"
          fill="none"
          strokeDasharray="8,8"
          opacity="0.5"
        />

        {/* Location markers */}
        {points.map((point, idx) => (
          <g key={idx}>
            {/* Marker shadow */}
            <circle
              cx={point.coords.x}
              cy={point.coords.y}
              r="16"
              fill="rgba(0,0,0,0.1)"
              filter="blur(3px)"
            />

            {/* Marker circle */}
            <circle
              cx={point.coords.x}
              cy={point.coords.y}
              r="12"
              fill={
                point.status === 'completed' ? '#10b981' :
                point.status === 'current' ? '#3b82f6' :
                '#d4d4d8'
              }
              stroke="white"
              strokeWidth="3"
              className={point.status === 'current' ? 'animate-pulse' : ''}
            />

            {/* Location label */}
            <text
              x={point.coords.x}
              y={point.coords.y - 25}
              textAnchor="middle"
              className="text-xs font-medium"
              fill="#0a0a0a"
              style={{ fontFamily: 'Inter' }}
            >
              {point.location.split(',')[0]}
            </text>
          </g>
        ))}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-sm border border-border">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className="text-muted-foreground">Completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className="text-muted-foreground">Current</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-gray-300"></div>
            <span className="text-muted-foreground">Pending</span>
          </div>
        </div>
      </div>

      {/* Current location card */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-sm border border-border">
        <div className="flex items-center gap-2 mb-1">
          <MapPin className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-xs font-semibold">Current Location</span>
        </div>
        <div className="text-sm font-medium">Denver, CO</div>
        <div className="text-xs text-muted-foreground font-mono">39.7392°N, 104.9903°W</div>
      </div>
    </div>
  );
}
