'use client'

import React from 'react'
import {
  Menu,
  X,
  BarChart3,
  Shield,
  Zap,
  Sigma,
  Settings,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  icon: React.ReactNode
  href: string
  badge?: number
  active?: boolean
}

interface SidebarProps {
  isOpen: boolean
  onToggle: (open: boolean) => void
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const navItems: NavItem[] = [
    {
      label: 'Track and Trace',
      icon: <BarChart3 size={18} />,
      href: '#',
      active: true,
    },
    {
      label: 'Serialization',
      icon: <Shield size={18} />,
      href: '#',
    },
    {
      label: 'Transactions',
      icon: <Zap size={18} />,
      href: '#',
      badge: 12,
    },
    {
      label: 'Reporting',
      icon: <Sigma size={18} />,
      href: '#',
    },
    {
      label: 'CryptoWallet',
      icon: <Sigma size={18} />,
      href: '#',
    },
  ]

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => onToggle(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 hover:bg-blue-100 rounded-lg transition-colors"
      >
        {isOpen ? <X size={24} className="text-text-primary" /> : <Menu size={24} className="text-text-primary" />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 md:hidden"
          onClick={() => onToggle(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-screen w-64 z-40',
          'bg-sidebar-navy',
          'flex flex-col',
          'transition-transform duration-300 ease-out md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Logo / Branding */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent-blue flex items-center justify-center">
              <Shield size={18} className="text-white font-bold" />
            </div>
            <div>
              <p className="font-semibold text-white text-sm">PharmaTrace</p>
              <p className="text-xs text-white/60">v1.0</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {navItems.map((item, index) => (
            <a
              key={index}
              href={item.href}
              onClick={(e) => e.preventDefault()}
              className={cn(
                'group flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 mb-1',
                item.active
                  ? 'bg-accent-blue/20 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              )}
            >
              <span className="text-lg">
                {item.icon}
              </span>
              <span className="text-sm font-medium flex-1">{item.label}</span>
              {item.badge && (
                <span className="px-2 py-0.5 bg-red-500/20 text-red-200 text-xs rounded-full font-medium">
                  {item.badge}
                </span>
              )}
            </a>
          ))}
        </nav>

        {/* Footer actions */}
        <div className="border-t border-white/10 p-3 space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200">
            <Settings size={18} />
            <span className="text-sm font-medium">Settings</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200">
            <LogOut size={18} />
            <span className="text-sm font-medium">Disconnect</span>
          </button>
        </div>
      </aside>
    </>
  )
}
