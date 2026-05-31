'use client'

import React from 'react'

export interface BreachLogDetail {
  id: string
  timestamp: string
  temperatureRaw: number
  temperatureC: number
  gps: string
  integrity: number
  status: 'SAFE' | 'BREACH'
  txHash?: string
  blockHeight?: number
  score?: number
  viability?: number
  recommendation?: string
  expiresInHours?: number
}

interface ProductDetailCardProps {
  log?: BreachLogDetail | null
}

export const ProductDetailCard: React.FC<ProductDetailCardProps> = ({ log }) => {
  if (!log) {
    return (
      <div className="bg-white rounded-lg border border-border-light shadow-card-shadow p-6 h-full flex items-center justify-center">
        <p className="text-text-secondary text-sm">
          Select a breach event to view cryptographic audit details.
        </p>
      </div>
    )
  }

  const receiptLines = [
    `TxHash: ${log.txHash ?? '0x9f1c...b7a1'}`,
    `Block: ${log.blockHeight ?? 'pending'}`,
    `LogIndex: ${log.id}`,
    `Integrity: ${log.integrity.toFixed(2)}`,
    `Status: ${log.status}`,
  ]

  return (
    <div className="bg-white rounded-lg border border-border-light shadow-card-shadow p-6 h-full overflow-y-auto">
      <div className="mb-6 pb-4 border-b border-border-light">
        <h3 className="text-lg font-semibold text-text-primary mb-1">Breach Log {log.id}</h3>
        <p className="text-sm text-text-secondary">{log.timestamp}</p>
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-semibold text-text-primary mb-3">Telemetry Details</h4>
          <div className="space-y-3 bg-bg-primary rounded-lg p-4">
            <div>
              <p className="text-xs text-text-secondary mb-1">Temperature (C)</p>
              <p className="text-sm font-semibold text-text-primary">
                {log.temperatureC.toFixed(1)} C (raw {log.temperatureRaw})
              </p>
            </div>
            <div>
              <p className="text-xs text-text-secondary mb-1">GPS Coordinates</p>
              <p className="text-sm text-text-primary break-words">{log.gps}</p>
            </div>
            <div>
              <p className="text-xs text-text-secondary mb-1">Integrity Post-Breach</p>
              <p className="text-sm font-semibold text-text-primary">{log.integrity.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-text-primary mb-3">Blockchain Anchor Metadata</h4>
          <div className="bg-slate-900 text-emerald-200 rounded-lg p-4 text-xs font-mono leading-relaxed">
            {receiptLines.map((line) => (
              <div key={line}>{line}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
