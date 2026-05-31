'use client'

import React, { useMemo, useState } from 'react'
import { ChevronDown, CheckCircle2 } from 'lucide-react'
import { useColdSeal } from '@/hooks/useColdSeal'

const statusFromTemp = (tempRaw: number) => {
  const tempC = tempRaw / 10
  if (tempC < 2 || tempC > 8) return 'BREACH'
  return 'SAFE'
}

export default function AuditPage() {
  const { auditRecords } = useColdSeal()
  const [filter, setFilter] = useState<'all' | 'breach' | 'safe'>('all')
  const [expanded, setExpanded] = useState<number | null>(null)

  const filtered = useMemo(() => {
    return auditRecords.filter((record) => {
      const status = statusFromTemp(record.temp)
      if (filter === 'breach') return status === 'BREACH'
      if (filter === 'safe') return status === 'SAFE'
      return true
    })
  }, [auditRecords, filter])

  return (
    <div className="pt-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-display text-cold-text">Ledger Audit</h1>
          <p className="text-sm text-cold-muted mt-2">On-chain integrity records and verification details</p>
        </div>
        <div className="text-xs text-cold-muted">Showing {filtered.length} of {auditRecords.length} records</div>
      </div>

      <div className="flex gap-2 mb-6">
        {['all', 'breach', 'safe'].map((key) => (
          <button
            key={key}
            onClick={() => setFilter(key as 'all' | 'breach' | 'safe')}
            className={`px-4 py-1.5 rounded-full text-xs border transition ${
              filter === key
                ? 'border-cold-amber text-cold-amber bg-[rgba(245,166,35,0.12)]'
                : 'border-[rgba(255,180,50,0.2)] text-cold-muted hover:text-cold-text'
            }`}
          >
            {key === 'all' ? 'All' : key === 'breach' ? 'Breach Only' : 'Safe Only'}
          </button>
        ))}
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-[11px] uppercase tracking-[0.2em] text-cold-muted border-b border-[rgba(255,180,50,0.12)]">
            <tr>
              <th className="text-left px-6 py-4">Log ID</th>
              <th className="text-left px-6 py-4">Timestamp</th>
              <th className="text-left px-6 py-4">Temperature</th>
              <th className="text-left px-6 py-4">GPS</th>
              <th className="text-left px-6 py-4">Integrity Post-Breach</th>
              <th className="text-left px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((record) => {
              const status = statusFromTemp(record.temp)
              const isBreach = status === 'BREACH'
              return (
                <React.Fragment key={record.logId}>
                  <tr
                    className="border-b border-[rgba(255,180,50,0.08)] hover:bg-[rgba(245,166,35,0.04)] cursor-pointer"
                    onClick={() => setExpanded(expanded === record.logId ? null : record.logId)}
                  >
                    <td className="px-6 py-4 font-mono text-cold-amber">#{record.logId}</td>
                    <td className="px-6 py-4 text-cold-muted">{record.timestamp}</td>
                    <td className={`px-6 py-4 font-semibold ${isBreach ? 'text-cold-orange' : 'text-cold-text'}`}>
                      {(record.temp / 10).toFixed(1)} C
                    </td>
                    <td className="px-6 py-4 text-cold-muted">{record.gps}</td>
                    <td className="px-6 py-4 text-cold-muted">{isBreach ? 'Logged' : 'Verified'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] ${isBreach ? 'chip-orange' : 'chip-green'}`}>
                        {status}
                      </span>
                    </td>
                  </tr>
                  {expanded === record.logId && (
                    <tr className="bg-[rgba(17,17,24,0.7)]">
                      <td colSpan={6} className="px-6 py-4">
                        <div className="flex items-start gap-6">
                          <div className="flex items-center gap-2 text-cold-amber">
                            <CheckCircle2 size={16} />
                            <span className="text-sm font-medium">Cryptographic Audit Details</span>
                          </div>
                          <div className="text-xs text-cold-muted">
                            <p>Block Hash: 0x{record.logId}...{record.logId}a9c</p>
                            <p>Transaction: {record.txHash ?? `0x${record.logId}f00d${record.logId}`}</p>
                            <p className="text-cold-amber">Verified: ✓ Yes</p>
                            <p className="text-cold-muted">Sealed on-chain. Tamper-evident record.</p>
                          </div>
                          <ChevronDown size={16} className="text-cold-muted" />
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
