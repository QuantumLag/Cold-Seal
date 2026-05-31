'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle } from 'lucide-react'
import { AuditRecord } from '@/hooks/useColdSeal'

interface AuditTimelineProps {
  records: AuditRecord[]
  logCount: number
}

const timeAgo = (timestamp: string) => {
  const now = Date.now()
  const ts = Date.parse(timestamp)
  if (Number.isNaN(ts)) return 'Just now'
  const diff = Math.max(0, now - ts)
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins} mins ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} hrs ago`
  return `${Math.floor(hours / 24)} days ago`
}

export const AuditTimeline: React.FC<AuditTimelineProps> = ({ records, logCount }) => {
  return (
    <div className="glass-card glass-card-hover p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-cold-muted">Ledger Audit Timeline</p>
          <p className="text-sm text-cold-text mt-2">Blockchain smart contract events and attestations</p>
        </div>
        <button className="px-4 py-2 rounded-full border border-[rgba(245,166,35,0.25)] text-cold-amber text-xs hover:bg-[rgba(245,166,35,0.08)] transition">
          ↓ Export CSV
        </button>
      </div>

      <div className="text-xs text-cold-muted mb-4">Total Events: {logCount}</div>

      <div className="space-y-3 max-h-[320px] overflow-y-auto pr-2">
        <AnimatePresence initial={false}>
          {records.map((record) => {
            const status = record.status.toUpperCase().includes('BREACH') ? 'BREACH' : 'SAFE'
            const isBreach = status === 'BREACH'
            return (
              <motion.div
                key={`${record.logId}-${record.timestamp}`}
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="border border-[rgba(255,180,50,0.12)] rounded-xl p-4 bg-[rgba(17,17,24,0.6)] hover:border-[rgba(245,166,35,0.35)] transition"
              >
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    {isBreach ? (
                      <XCircle size={18} className="text-cold-orange" />
                    ) : (
                      <CheckCircle2 size={18} className="text-cold-green" />
                    )}
                    <div className="h-full w-px bg-[rgba(255,180,50,0.15)] mt-2" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] uppercase tracking-[0.25em] text-cold-amber">Block #{record.logId}</p>
                    <p className="text-sm text-cold-text font-semibold mt-1">Temperature Event</p>
                    <p className="text-xs text-cold-muted mt-2">Temp: {(record.temp / 10).toFixed(1)} C · GPS: {record.gps}</p>
                    <p className="text-xs text-cold-amber font-mono mt-2">0x{record.logId}...{record.logId}a9c</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-cold-muted">{timeAgo(record.timestamp)}</p>
                    <div className={`mt-2 px-2 py-1 rounded-full text-[10px] ${
                      isBreach ? 'chip-orange' : 'chip-green'
                    }`}>
                      {status}
                    </div>
                    <div className="mt-2 px-2 py-1 rounded-full text-[10px] chip-amber">⬡ Verified</div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
