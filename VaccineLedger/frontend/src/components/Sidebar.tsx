'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  MapPin,
  ShieldCheck,
  Activity,
  BarChart2,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Live Monitor', href: '/', icon: LayoutDashboard },
  { label: 'GPS Tracker', href: '/map', icon: MapPin },
  { label: 'Ledger Audit', href: '/audit', icon: ShieldCheck },
  { label: 'Anomaly Log', href: '/anomaly', icon: Activity },
  { label: 'Analytics', href: '/analytics', icon: BarChart2 },
]

export const Sidebar: React.FC = () => {
  const pathname = usePathname()
  const [simulationMode, setSimulationMode] = useState(true)

  return (
    <aside className="fixed left-0 top-0 h-screen w-[220px] bg-[#0D0D14] border-r border-[rgba(255,180,50,0.08)] hidden md:flex flex-col z-20">
      <div className="h-[60px] px-5 flex items-center border-b border-[rgba(255,180,50,0.08)]">
        <div className="text-sm font-semibold text-cold-text font-display">COLD-SEAL</div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all',
                active
                  ? 'text-cold-amber bg-[rgba(245,166,35,0.06)] border-l-[3px] border-cold-amber'
                  : 'text-cold-muted hover:text-cold-text hover:bg-white/5'
              )}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          )
        })}

        <div className="my-4 border-t border-[rgba(255,180,50,0.1)]" />

        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-cold-muted hover:text-cold-text hover:bg-white/5 transition"
        >
          <Settings size={18} />
          <span>Settings</span>
        </Link>
      </nav>

      <div className="p-4 border-t border-[rgba(255,180,50,0.08)]">
        <div className="glass-card p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-cold-muted uppercase tracking-widest">Simulation Mode</p>
              <p className="text-xs text-cold-text mt-1">Telemetry sandbox</p>
            </div>
            <button
              onClick={() => setSimulationMode((prev) => !prev)}
              className={cn(
                'w-10 h-6 rounded-full border transition relative',
                simulationMode
                  ? 'bg-[rgba(245,166,35,0.25)] border-[rgba(245,166,35,0.6)]'
                  : 'bg-white/5 border-white/10'
              )}
            >
              <span
                className={cn(
                  'absolute top-0.5 w-5 h-5 rounded-full transition',
                  simulationMode ? 'left-4 bg-cold-amber' : 'left-0.5 bg-white/40'
                )}
              />
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
