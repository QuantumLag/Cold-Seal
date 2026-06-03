import { MapPin, Navigation } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';

// Custom div icon to retain the UI style
const createCustomIcon = (status: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; width: 40px; height: 40px;">
        <div style="position: absolute; width: 60px; height: 60px; background-color: #3b82f6; border-radius: 50%; opacity: 0.2; animation: pulse 2s infinite;"></div>
        <div style="position: absolute; width: 40px; height: 40px; background-color: #3b82f6; border-radius: 50%; opacity: 0.3; animation: pulse 2s infinite; animation-delay: 0.3s;"></div>
        <div style="position: relative; width: 30px; height: 30px; background: linear-gradient(to bottom right, #2563eb, #06b6d4); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border: 2px solid white; z-index: 20;">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

// Component to recenter map when coordinates change
function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 13);
  }, [lat, lng, map]);
  return null;
}

interface LiveTransitMapProps {
  gps?: string;
  status?: string;
  breach_level?: string;
  lastUpdate?: string;
}

export default function LiveTransitMap({ gps = '0,0', status = '\u23f3 Connecting...', breach_level = 'safe', lastUpdate }: LiveTransitMapProps) {
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
  const position = coordinates ? ([coordinates.lat, coordinates.lng] as [number, number]) : ([0, 0] as [number, number]);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm h-full flex flex-col">
      <div className="mb-4">
        <h3 className="font-semibold text-foreground mb-1">Live Transit Route Map</h3>
        <p className="text-xs text-muted-foreground">Real-time sensor location tracking</p>
      </div>

      <div className="flex-1 bg-gray-50 rounded-xl border border-gray-200 overflow-hidden relative">
        {coordinates ? (
          <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%', zIndex: 0 }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={position} icon={createCustomIcon(status)}>
              <Popup>
                Sensor Location<br />Status: {status}
              </Popup>
            </Marker>
            <RecenterMap lat={coordinates.lat} lng={coordinates.lng} />
          </MapContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center gap-2">
            <MapPin className="w-8 h-8 text-gray-400" />
            <span className="text-sm text-gray-500">Waiting for GPS data...</span>
          </div>
        )}

        {/* Status badge overlay */}
        {coordinates && (
          <div className="absolute top-4 right-4 z-[400] flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md border border-gray-200 pointer-events-none">
            <div className={`w-2 h-2 rounded-full ${
              breach_level === 'safe' ? 'bg-emerald-500' :
              breach_level === 'warning' ? 'bg-amber-500' : 'bg-red-500'
            } animate-pulse`}></div>
            <span className={`text-xs font-medium ${
              breach_level === 'safe' ? 'text-emerald-700' :
              breach_level === 'warning' ? 'text-amber-700' : 'text-red-700'
            }`}>{status}</span>
          </div>
        )}
      </div>

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
