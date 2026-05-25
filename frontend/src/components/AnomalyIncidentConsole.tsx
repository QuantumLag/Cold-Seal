'use client'

import React, { useState } from 'react'
import { AlertTriangle, AlertCircle, ChevronDown, CheckCircle2 } from 'lucide-react'
import { AnomalyIncident } from '@/types'
import { formatTime, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface AnomalyIncidentConsoleProps {
  incidents: AnomalyIncident[]
}

export const AnomalyIncidentConsole: React.FC<AnomalyIncidentConsoleProps> = ({ incidents }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const criticalCount = incidents.filter((i) => i.severity === 'critical' && !i.resolved).length
  const warningCount = incidents.filter((i) => i.severity === 'warning' && !i.resolved).length

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-700/50 bg-zinc-900/30 backdrop-blur-sm p-6 transition-all duration-300 hover:border-zinc-600/80 hover:bg-zinc-900/50">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-zinc-100">Anomaly Incident Console</h2>
        <p className="text-xs text-zinc-400 mt-1">ML-detected system deviations & alerts</p>
      </div>

      {/* Alert counts */}
      <div className="flex gap-3 mb-4 pb-3 border-b border-zinc-700/30">
        {criticalCount > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded-lg">
            <AlertTriangle size={14} className="text-red-400" />
            <span className="text-xs font-medium text-red-400">{criticalCount} Critical</span>
          </div>
        )}
        {warningCount > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <AlertCircle size={14} className="text-amber-400" />
            <span className="text-xs font-medium text-amber-400">{warningCount} Warning</span>
          </div>
        )}
        {criticalCount === 0 && warningCount === 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
            <CheckCircle2 size={14} className="text-emerald-400" />
            <span className="text-xs font-medium text-emerald-400">All Clear</span>
          </div>
        )}
      </div>

      {/* Incidents list */}
      <div className="space-y-2 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
        {incidents.length === 0 ? (
          <div className="text-center py-8 text-zinc-500">
            <p className="text-sm">No incidents detected</p>
          </div>
        ) : (
          incidents.map((incident) => (
            <div
              key={incident.id}
              className={cn(
                'border rounded-lg transition-all duration-200 overflow-hidden',
                incident.severity === 'critical'
                  ? 'border-red-500/30 hover:border-red-500/60'
                  : 'border-amber-500/20 hover:border-amber-500/40',
                incident.resolved
                  ? 'border-zinc-700/30 bg-zinc-800/20 hover:bg-zinc-800/30'
                  : incident.severity === 'critical'
                    ? 'bg-red-500/5 hover:bg-red-500/10'
                    : 'bg-amber-500/5 hover:bg-amber-500/10'
              )}
            >
              {/* Collapsed view */}
              <button
                onClick={() => toggleExpand(incident.id)}
                className="w-full px-4 py-3 flex items-start justify-between gap-3 hover:bg-zinc-700/10 transition-colors"
              >
                {/* Left: Icon and summary */}
                <div className="flex-1 flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {incident.severity === 'critical' && !incident.resolved ? (
                      <AlertTriangle size={16} className="text-red-400 animate-pulse" />
                    ) : incident.severity === 'warning' && !incident.resolved ? (
                      <AlertCircle size={16} className="text-amber-400" />
                    ) : (
                      <CheckCircle2 size={16} className="text-emerald-400" />
                    )}
                  </div>

                  <div className="text-left">
                    <p className="text-sm font-semibold text-zinc-100">{incident.type}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">{incident.description}</p>
                  </div>
                </div>

                {/* Right: Chevron and time */}
                <div className="flex-shrink-0 flex flex-col items-end gap-2">
                  <ChevronDown
                    size={16}
                    className={cn(
                      'text-zinc-500 transition-transform duration-200',
                      expandedId === incident.id && 'rotate-180'
                    )}
                  />
                  <span className="text-xs text-zinc-500 whitespace-nowrap">{formatTime(incident.timestamp)}</span>
                </div>
              </button>

              {/* Expanded view */}
              {expandedId === incident.id && (
                <div className="border-t border-current border-opacity-10 px-4 py-3 bg-zinc-900/40 space-y-3 animate-slide">
                  {/* ML-derived reason */}
                  <div>
                    <p className="text-xs font-semibold text-zinc-300 uppercase tracking-wide mb-1">
                      ML Analysis
                    </p>
                    <p className="text-sm text-zinc-300 leading-relaxed">{incident.reason}</p>
                  </div>

                  {/* Sensor details */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-700/20">
                    <div>
                      <p className="text-xs text-zinc-500 mb-1">Location</p>
                      <p className="text-xs font-medium text-zinc-300">{incident.sensorLocation}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 mb-1">Timestamp</p>
                      <p className="text-xs font-medium text-zinc-300">{formatDate(incident.timestamp)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 mb-1">Reading</p>
                      <p className="text-xs font-medium text-zinc-300">
                        {incident.reading.toFixed(2)}
                        {incident.type.includes('Temperature') ? '°C' : '%'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 mb-1">Threshold</p>
                      <p className="text-xs font-medium text-zinc-300">
                        {incident.threshold.toFixed(2)}
                        {incident.type.includes('Temperature') ? '°C' : '%'}
                      </p>
                    </div>
                  </div>

                  {/* Status badge */}
                  {incident.resolved && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-emerald-400/10 border border-emerald-500/30 rounded mt-2">
                      <CheckCircle2 size={14} className="text-emerald-400" />
                      <span className="text-xs font-medium text-emerald-400">Resolved</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(113, 113, 122, 0.4);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(113, 113, 122, 0.6);
        }
      `}</style>
    </div>
  )
}
