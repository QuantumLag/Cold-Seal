'use client'

import React from 'react'
import { X } from 'lucide-react'

interface BreachBannerProps {
  visible: boolean
  temperatureC?: number
  onDismiss: () => void
}

export const BreachBanner: React.FC<BreachBannerProps> = ({ visible, temperatureC, onDismiss }) => {
  if (!visible) return null

  return (
    <div className="mb-6 border-b-2 border-cold-orange bg-[rgba(255,107,53,0.15)] px-5 py-3 rounded-xl flex items-center justify-between animate-slide">
      <p className="text-sm text-cold-text">
        ⚠ TEMPERATURE BREACH DETECTED — {temperatureC?.toFixed(1)} C exceeds safe range. Logged to blockchain.
      </p>
      <button onClick={onDismiss} className="text-cold-muted hover:text-cold-text transition">
        <X size={16} />
      </button>
    </div>
  )
}
