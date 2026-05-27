'use client'

import React from 'react'
import { CheckCircle2, Link2, Clock } from 'lucide-react'
import { BlockchainBlock } from '@/types'
import { formatTime, formatAddress } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface LedgerAuditTimelineProps {
  blocks: BlockchainBlock[]
}

export const LedgerAuditTimeline: React.FC<LedgerAuditTimelineProps> = ({ blocks }) => {
  return (
    <div className="overflow-hidden rounded-lg border border-zinc-700/50 bg-zinc-900/30 backdrop-blur-sm p-6 transition-all duration-300 hover:border-zinc-600/80 hover:bg-zinc-900/50">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-zinc-100">Ledger Audit Timeline</h2>
        <p className="text-xs text-zinc-400 mt-1">Blockchain smart contract events & attestations</p>
      </div>

      {/* Timeline */}
      <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
        {blocks.map((block, index) => (
          <div
            key={block.blockNumber}
            className={cn(
              'group relative border border-zinc-700/30 rounded-lg p-4',
              'bg-gradient-to-r from-zinc-800/40 to-zinc-900/20',
              'hover:border-zinc-600/60 hover:bg-zinc-800/50 transition-all duration-200',
              'cursor-pointer'
            )}
          >
            {/* Timeline line (for visual hierarchy) */}
            {index < blocks.length - 1 && (
              <div className="absolute left-7 top-16 w-0.5 h-6 bg-gradient-to-b from-zinc-600 to-zinc-700/50" />
            )}

            <div className="flex gap-4">
              {/* Timeline dot and connector */}
              <div className="flex flex-col items-center pt-1">
                <div className="w-4 h-4 rounded-full border-2 border-emerald-400/60 bg-zinc-900 ring-2 ring-emerald-400/20 animate-pulse" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 py-1">
                {/* Block header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-zinc-300 uppercase tracking-wide">
                      Block #{block.blockNumber}
                    </p>
                    <p className="text-sm font-medium text-zinc-100 mt-0.5">
                      {block.eventType}
                    </p>
                  </div>

                  {/* Verified badge */}
                  {block.verified && (
                    <div className="flex items-center gap-1 bg-emerald-400/10 border border-emerald-500/30 rounded px-2 py-1 flex-shrink-0">
                      <CheckCircle2 size={12} className="text-emerald-400" />
                      <span className="text-xs font-medium text-emerald-400">Verified</span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <p className="text-xs text-zinc-400 mb-3 line-clamp-2">{block.details}</p>

                {/* Footer metadata */}
                <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-zinc-700/20">
                  {/* Transaction hash */}
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <Link2 size={12} />
                    <code className="font-mono">{formatAddress(block.transactionHash)}</code>
                  </div>

                  {/* Time */}
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <Clock size={12} />
                    <span>{formatTime(block.timestamp)}</span>
                  </div>

                  {/* Node address */}
                  <div className="text-xs text-zinc-600">
                    {formatAddress(block.nodeAddress)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-zinc-700/30">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-xs text-zinc-400">{blocks.length} verified blocks</span>
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
