'use client'

import React from 'react'
import { useColdSeal } from '@/hooks/useColdSeal'

export default function AnomalyPage() {
  const { anomalyEvents } = useColdSeal()

  const lastEvent = anomalyEvents[anomalyEvents.length - 1]
  const total = anomalyEvents.length
  const lastScore = lastEvent?.score ?? 0
  const windowStatus = total < 5 ? 'Building profile (need more data)' : 'Active — Monitoring'

  return (
    <div className="pt-8">
      <div className="mb-8">
        <h1 className="text-3xl font-display text-cold-text">Anomaly Detection Engine</h1>
        <p className="text-sm text-cold-muted mt-2">Isolation Forest · 60-minute sliding window</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6">
          <p className="text-[11px] uppercase tracking-[0.25em] text-cold-muted">Total Anomalies Detected</p>
          <p className="text-3xl text-cold-amber font-display mt-4">{total}</p>
        </div>
        <div className="glass-card p-6">
          <p className="text-[11px] uppercase tracking-[0.25em] text-cold-muted">Last Anomaly Score</p>
          <p className={`text-3xl font-display mt-4 ${lastScore > 0.75 ? 'text-cold-orange' : lastScore > 0.5 ? 'text-cold-amber' : 'text-cold-green'}`}>
            {lastScore.toFixed(2)}
          </p>
        </div>
        <div className="glass-card p-6">
          <p className="text-[11px] uppercase tracking-[0.25em] text-cold-muted">Window Status</p>
          <p className="text-sm text-cold-text mt-4">{windowStatus}</p>
        </div>
      </div>

      <div className="mt-8 glass-card p-6">
        <p className="text-[11px] uppercase tracking-[0.25em] text-cold-muted">Anomaly Log</p>
        <div className="mt-4 space-y-3">
          {anomalyEvents.length === 0 && (
            <p className="text-sm text-cold-muted">No anomalies detected yet.</p>
          )}
          {anomalyEvents.map((event) => (
            <div key={event.id} className="border border-[rgba(255,180,50,0.12)] rounded-xl p-4 bg-[rgba(17,17,24,0.6)]">
              <div className="flex items-center justify-between">
                <p className="text-sm text-cold-text">Score: {event.score.toFixed(2)}</p>
                <span className="text-xs text-cold-muted">{event.timestamp}</span>
              </div>
              <p className="text-xs text-cold-muted mt-2">{event.reason}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
