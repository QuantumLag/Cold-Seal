'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export interface BreachLog {
  id: string
  timestamp: string
  temperatureRaw: number
  temperatureC: number
  gps: string
  integrity: number
  status: 'SAFE' | 'BREACH'
  txHash?: string
  blockHeight?: number
}

interface ProductTableProps {
  logs: BreachLog[]
  onSelectRow?: (log: BreachLog) => void
  selectedId?: string
}

const getStatusStyle = (status: 'SAFE' | 'BREACH') => {
  if (status === 'BREACH') {
    return {
      badge: 'bg-red-100 text-red-700 border border-red-200',
      label: 'BREACH',
    }
  }

  return {
    badge: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    label: 'SAFE',
  }
}

export const ProductTable: React.FC<ProductTableProps> = ({
  logs,
  onSelectRow,
  selectedId,
}) => {
  return (
    <div className="bg-white rounded-lg border border-border-light shadow-card-shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-light bg-bg-primary">
              <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">Log ID</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">Timestamp</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">Temperature (C)</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">GPS Coordinates</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">Integrity Post-Breach</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">Status Badge</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td className="px-6 py-10 text-sm text-text-secondary" colSpan={6}>
                  Waiting for live telemetry events...
                </td>
              </tr>
            ) : (
              logs.map((log, index) => {
                const statusStyle = getStatusStyle(log.status)
                const isSelected = selectedId === log.id

                return (
                  <tr
                    key={`${log.id}-${index}`}
                    onClick={() => onSelectRow?.(log)}
                    className={cn(
                      'border-b border-border-light cursor-pointer transition-colors',
                      index % 2 === 0 ? 'bg-white' : 'bg-bg-primary/30',
                      isSelected
                        ? 'bg-accent-blue/10 border-l-4 border-l-accent-blue'
                        : 'hover:bg-bg-primary/50'
                    )}
                  >
                    <td className="px-6 py-4 text-sm text-text-primary font-medium">{log.id}</td>
                    <td className="px-6 py-4 text-sm text-text-primary">{log.timestamp}</td>
                    <td className="px-6 py-4 text-sm text-text-primary">
                      {log.temperatureC.toFixed(1)}
                    </td>
                    <td className="px-6 py-4 text-sm text-text-primary">{log.gps}</td>
                    <td className="px-6 py-4 text-sm text-text-primary font-semibold">
                      {log.integrity.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn('inline-flex px-3 py-1 rounded-full text-xs font-semibold', statusStyle.badge)}>
                        {statusStyle.label}
                      </span>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
