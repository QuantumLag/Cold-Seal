'use client'

import React from 'react'
import { MapContainer, TileLayer, CircleMarker, Polyline } from 'react-leaflet'
import type { LatLngExpression } from 'leaflet'
import { useColdSeal } from '@/hooks/useColdSeal'

export default function MapPage() {
  const { gpsHistory, liveData } = useColdSeal()
  const latest = gpsHistory[gpsHistory.length - 1]
  const center: LatLngExpression = latest ? [latest.lat, latest.lon] : [12.9716, 77.5946]
  const path = gpsHistory.map((point) => [point.lat, point.lon]) as LatLngExpression[]

  return (
    <div className="pt-6">
      <div className="h-[calc(100vh-120px)] relative">
        <div className="absolute inset-0 rounded-2xl overflow-hidden border border-[rgba(255,180,50,0.12)]">
          <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            {gpsHistory.map((point, index) => (
              <CircleMarker
                key={`${point.timestamp}-${index}`}
                center={[point.lat, point.lon]}
                radius={index === gpsHistory.length - 1 ? 10 : 6}
                pathOptions={{
                  color: point.status.includes('BREACH') ? '#FF6B35' : '#00D68F',
                  fillColor: point.status.includes('BREACH') ? '#FF6B35' : '#00D68F',
                  fillOpacity: 0.75,
                }}
              />
            ))}
            {path.length > 1 && (
              <Polyline positions={path} pathOptions={{ color: '#F5A623', opacity: 0.6 }} />
            )}
          </MapContainer>
        </div>

        <div className="absolute top-6 left-6 glass-card p-4 w-[280px]">
          <p className="text-[11px] uppercase tracking-[0.25em] text-cold-muted">Batch GPS Tracker</p>
          <div className="mt-4 space-y-2 text-sm text-cold-text">
            <p>Current Location</p>
            <p className="text-cold-amber font-mono text-xs">
              {latest ? `${latest.lat.toFixed(4)}, ${latest.lon.toFixed(4)}` : 'Awaiting telemetry'}
            </p>
            <p className="text-xs text-cold-muted">Current Temp: {latest ? `${latest.tempC.toFixed(1)} C` : '--'}</p>
            <p className={`text-xs ${latest?.status.includes('BREACH') ? 'text-cold-orange' : 'text-cold-green'}`}>
              Status: {latest?.status ?? 'SAFE'}
            </p>
          </div>

          <div className="my-4 border-t border-[rgba(255,180,50,0.12)]" />

          <p className="text-[11px] uppercase tracking-[0.25em] text-cold-muted">Movement Trail</p>
          <ul className="mt-2 text-xs text-cold-muted space-y-1">
            {gpsHistory.slice(-10).map((point) => (
              <li key={point.timestamp}>· {point.lat.toFixed(4)}, {point.lon.toFixed(4)}</li>
            ))}
          </ul>
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full border border-[rgba(245,166,35,0.25)] bg-[rgba(10,10,15,0.85)] text-xs text-cold-amber">
          <span className="inline-block mr-2 animate-breathe">●</span>
          Tracking live · Last updated: {liveData?.timestamp ?? 'awaiting telemetry'}
        </div>
      </div>
    </div>
  )
}
