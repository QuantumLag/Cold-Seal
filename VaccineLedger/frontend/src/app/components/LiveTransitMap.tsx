import { MapPin, Navigation } from 'lucide-react';

interface LiveTransitMapProps {
  gps?: string;
  status?: string;
  lastUpdate?: string;
}

export default function LiveTransitMap({ gps = '0,0', status = '✅ SAFE', lastUpdate }: LiveTransitMapProps) {
  // Parse GPS coordinates
  const parseGPS = (gpsString: string): { lat: number; lng: number } | null => {
    try {
      const [lat, lng] = gpsString.split(',').map(str => parseFloat(str.trim()));
      if (!isNaN(lat) && !isNaN(lng)) {
        return { lat, lng };
      }
    } catch (error) {
      console.error('[LiveTransitMap] Error parsing GPS:', error);
    }
    return null;
  };

  const coordinates = parseGPS(gps);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm h-full flex flex-col">
      <div className="mb-4">
        <h3 className="font-semibold text-foreground mb-1">Live Transit Route Map</h3>
        <p className="text-xs text-muted-foreground">Real-time sensor location tracking</p>
      </div>

      {/* Map Canvas - Styled Mock Visualization */}
      <div className="flex-1 bg-gradient-to-br from-blue-50 via-cyan-50 to-emerald-50 rounded-xl border border-blue-200 overflow-hidden flex items-center justify-center relative">
        {coordinates ? (
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Grid background for geospatial context */}
            <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>

            {/* Sensor marker with pulsing animation */}
            <div className="relative z-10 flex flex-col items-center gap-2">
              {/* Outer pulse ring */}
              <div className="absolute w-16 h-16 bg-blue-400 rounded-full opacity-20 animate-pulse"></div>

              {/* Middle pulse ring */}
              <div className="absolute w-10 h-10 bg-blue-500 rounded-full opacity-30 animate-pulse" style={{ animationDelay: '0.3s' }}></div>

              {/* Central marker pin */}
              <div className="relative w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white z-20">
                <MapPin className="w-4 h-4 text-white" />
              </div>

              {/* Navigation arrow for direction */}
              <div className="mt-4">
                <Navigation className="w-5 h-5 text-blue-600 animate-bounce" />
              </div>
            </div>

            {/* Coordinates display overlay */}
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md border border-gray-200">
              <div className="text-xs font-mono font-semibold text-gray-700">
                Lat: {coordinates.lat.toFixed(4)}
              </div>
              <div className="text-xs font-mono font-semibold text-gray-700">
                Lng: {coordinates.lng.toFixed(4)}
              </div>
            </div>

            {/* Status badge */}
            <div className="absolute top-4 right-4 flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md border border-gray-200">
              <div className={`w-2 h-2 rounded-full ${status === '✅ SAFE' ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`}></div>
              <span className="text-xs font-medium text-gray-700">{status}</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2">
            <MapPin className="w-8 h-8 text-gray-400" />
            <span className="text-sm text-gray-500">Waiting for GPS data...</span>
          </div>
        )}
      </div>

      {/* Map Controls/Info Footer */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <div className="text-xs text-muted-foreground mb-1">Coordinates</div>
          <div className="text-sm font-mono font-semibold text-foreground">
            {coordinates ? `${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)}` : 'N/A'}
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <div className="text-xs text-muted-foreground mb-1">Last Update</div>
          <div className="text-sm font-mono font-semibold text-foreground">{lastUpdate || 'N/A'}</div>
        </div>
      </div>
    </div>
  );
}
