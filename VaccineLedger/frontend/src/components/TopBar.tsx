'use client'

import React from 'react'
import { Bell, Shield, Wifi, Snowflake } from 'lucide-react'
import { useColdSeal } from '@/hooks/useColdSeal'

export const TopBar: React.FC = () => {
  const { connectionStatus } = useColdSeal()
  const isLive = connectionStatus === 'live'

  return (
    <div className="sticky top-0 z-30 h-[60px] border-b border-[rgba(255,180,50,0.1)] bg-cold-bg/95 backdrop-blur">
      <div className="h-full px-6 flex items-center justify-between gap-4">
        {/* Left */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl border border-[rgba(245,166,35,0.3)] bg-[rgba(245,166,35,0.08)] flex items-center justify-center">
            <Shield size={18} className="text-cold-amber" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Snowflake size={16} className="text-cold-amber" />
              <p className="text-sm font-semibold text-cold-text font-display tracking-wide">COLD-SEAL</p>
            </div>
            <p className="text-[10px] text-cold-muted">Monitor v1.0</p>
          </div>
        </div>

        {/* Center */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[rgba(0,214,143,0.3)] bg-[rgba(0,214,143,0.1)] text-cold-green text-xs">
            <Wifi size={14} />
            <span>Edge Node: 100%</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[rgba(245,166,35,0.25)] bg-[rgba(245,166,35,0.1)] text-cold-amber text-xs">
            <span>⬡</span>
            <span>Chain: 1337</span>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-cold-green">
            <span className={`text-[10px] ${isLive ? 'animate-breathe' : ''}`}>●</span>
            <span>{isLive ? 'Live' : 'Offline'}</span>
          </div>
          <div className="h-6 w-px bg-[rgba(255,180,50,0.15)]" />
          <button className="relative p-2 rounded-lg hover:bg-white/5 transition">
            <Bell size={18} className="text-cold-muted" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-cold-amber" />
          </button>
          <div className="w-9 h-9 rounded-full bg-[rgba(245,166,35,0.2)] border border-[rgba(245,166,35,0.5)] flex items-center justify-center text-sm font-semibold text-cold-amber">
            SK
          </div>
        </div>
      </div>
    </div>
  )
}
