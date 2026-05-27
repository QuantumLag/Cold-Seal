'use client'

import React from 'react'
import { Wifi, WifiOff, Search, Bell } from 'lucide-react'
import { SystemStatus } from '@/types'

interface TopBarProps {
  status: SystemStatus
}

export const TopBar: React.FC<TopBarProps> = ({ status }) => {

  return (
    <div className="sticky top-0 z-30 border-b border-border-light bg-white">
      <div className="px-6 py-4 flex items-center justify-between gap-4">
        {/* Left: Search and Status */}
        <div className="flex items-center gap-4 flex-1">
          {/* Search */}
          <div className="relative hidden md:flex flex-1 max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" />
            <input
              type="text"
              placeholder="Search here..."
              className="w-full pl-10 pr-4 py-2 bg-bg-primary border border-border-light rounded-lg text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent"
            />
          </div>

          {/* Edge Node Sync */}
          <div className="flex items-center gap-2 px-3 py-2 bg-bg-primary border border-border-light rounded-lg">
            {status.edgeNodeSync === 100 ? (
              <Wifi size={14} className="text-green-600" />
            ) : (
              <WifiOff size={14} className="text-orange-600" />
            )}
            <span className="text-xs font-medium text-text-primary">
              Edge Node: <span className="text-accent-blue">{status.edgeNodeSync}%</span>
            </span>
          </div>
        </div>

        {/* Right: Actions and Profile */}
        <div className="flex items-center gap-3">
          {/* Balance Pill */}
          <div className="flex items-center gap-2 px-4 py-2 bg-bg-primary border border-border-light rounded-full">
            <div className="w-2 h-2 rounded-full bg-green-600" />
            <span className="text-xs font-semibold text-text-primary">$500 PT</span>
            <span className="text-xs text-text-secondary">CryptoWallet Balance</span>
          </div>

          {/* Notification */}
          <button className="p-2 hover:bg-bg-primary rounded-lg transition-colors relative">
            <Bell size={18} className="text-text-secondary" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500"></span>
          </button>

          {/* User Profile */}
          <button className="flex items-center gap-2 px-3 py-2 hover:bg-bg-primary rounded-lg transition-colors">
            <div className="w-8 h-8 rounded-full bg-accent-blue flex items-center justify-center text-white font-semibold text-sm">
              SK
            </div>
            <span className="hidden sm:inline text-sm font-medium text-text-primary">Satchit</span>
          </button>
        </div>
      </div>
    </div>
  )
}
