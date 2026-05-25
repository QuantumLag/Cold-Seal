'use client'

import React, { useState } from 'react'
import { Wifi, WifiOff, Power } from 'lucide-react'
import { SystemStatus } from '@/types'
import { formatAddress } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface TopBarProps {
  status: SystemStatus
}

export const TopBar: React.FC<TopBarProps> = ({ status }) => {
  const [simulationMode, setSimulationMode] = useState(true)

  return (
    <div className="sticky top-0 z-30 border-b border-zinc-700/50 bg-zinc-900/80 backdrop-blur-md">
      <div className="px-6 py-3 flex items-center justify-between gap-4">
        {/* Left: Status indicators */}
        <div className="flex items-center gap-4">
          {/* Edge Node Sync */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg">
            {status.edgeNodeSync === 100 ? (
              <Wifi size={14} className="text-emerald-400 animate-pulse" />
            ) : (
              <WifiOff size={14} className="text-amber-400" />
            )}
            <span className="text-xs font-medium text-zinc-300">
              Edge Node: <span className="text-emerald-400">{status.edgeNodeSync}%</span>
            </span>
          </div>

          {/* Wallet address */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <code className="text-xs font-mono text-zinc-400">
              {formatAddress(status.walletAddress)}
            </code>
          </div>
        </div>

        {/* Right: Simulation toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSimulationMode(!simulationMode)}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-200',
              simulationMode
                ? 'bg-amber-500/10 border-amber-500/30 hover:border-amber-500/50'
                : 'bg-zinc-800/50 border-zinc-700/50 hover:border-zinc-600/80'
            )}
          >
            <Power size={14} />
            <span className="text-xs font-medium">
              {simulationMode ? 'Simulation ON' : 'Live Mode'}
            </span>
          </button>

          {/* Blockchain health indicator */}
          <div
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg border',
              status.blockchainHealth > 9900
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : status.blockchainHealth > 9800
                  ? 'bg-amber-500/10 border-amber-500/30'
                  : 'bg-red-500/10 border-red-500/30'
            )}
          >
            <div
              className={cn(
                'w-1.5 h-1.5 rounded-full',
                status.blockchainHealth > 9900
                  ? 'bg-emerald-400 animate-pulse'
                  : status.blockchainHealth > 9800
                    ? 'bg-amber-400'
                    : 'bg-red-400'
              )}
            />
            <span className="text-xs font-medium text-zinc-300">
              Chain: <span className="text-zinc-100">{status.blockchainHealth}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
