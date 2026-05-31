'use client'

import React, { useMemo } from 'react'
import { MapContainer, TileLayer, CircleMarker, Polyline, Popup } from 'react-leaflet'
import type { LatLngExpression } from 'leaflet'
import { GpsPoint } from '@/hooks/useColdSeal'

interface MapTrackerProps {
  points: GpsPoint[]
}

export const MapTracker: React.FC<MapTrackerProps> = ({ points }) => {
  const latest = points[points.length - 1]
  const center = useMemo<LatLngExpression>(() => {
    if (!latest) return [12.9716, 77.5946]
    return [latest.lat, latest.lon]
  }, [latest])

  const polyline = points.map((point) => [point.lat, point.lon]) as LatLngExpression[]

  return (
    <div className="glass-card glass-card-hover p-6">
      <div className="mb-4">
        <p className="text-[11px] uppercase tracking-[0.25em] text-cold-muted">Live Custody Map</p>
        <p className="text-sm text-cold-text mt-2">Real-time batch geolocation from IoT telemetry</p>
      </div>

      <div className="h-[380px] overflow-hidden rounded-xl">
        <MapContainer center={center} zoom={11} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          {points.map((point, index) => (
            <CircleMarker
              key={`${point.timestamp}-${index}`}
              center={[point.lat, point.lon]}
              radius={index === points.length - 1 ? 10 : 6}
              pathOptions={{
                color: point.status.includes('BREACH') ? '#FF6B35' : '#00D68F',
                fillColor: point.status.includes('BREACH') ? '#FF6B35' : '#00D68F',
                fillOpacity: 0.75,
              }}
            >
              <Popup>
                <div className="text-xs text-cold-text">
                  <p className="font-semibold">Batch Location</p>
                  <p>Temperature: {point.tempC.toFixed(1)} C</p>
                  <p>Status: {point.status}</p>
                  <p>Time: {point.timestamp}</p>
                </div>
              </Popup>
            </CircleMarker>
          ))}
          {polyline.length > 1 && (
            <Polyline positions={polyline} pathOptions={{ color: '#F5A623', opacity: 0.6 }} />
          )}
        </MapContainer>
      </div>

      <div className="mt-4 text-xs text-cold-amber font-mono">
        {latest ? `\ud83d\udccd ${latest.lat.toFixed(4)}, ${latest.lon.toFixed(4)}` : 'Waiting for GPS telemetry...'}
      </div>
    </div>
  )
}
