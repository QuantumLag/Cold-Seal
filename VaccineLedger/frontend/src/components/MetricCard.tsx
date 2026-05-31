'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  title: string
  value: React.ReactNode
  icon: React.ReactNode
  accentClassName?: string
  footer?: React.ReactNode
  children?: React.ReactNode
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  accentClassName,
  footer,
  children,
}) => {
  return (
    <div className="glass-card glass-card-hover p-6 relative overflow-hidden">
      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-[0.25em] text-cold-muted font-medium">
          {title}
        </p>
        <div className="text-cold-amber/80">{icon}</div>
      </div>
      <div className={cn('mt-4 text-hero', accentClassName)}>{value}</div>
      {children && <div className="mt-4">{children}</div>}
      {footer && <div className="mt-4">{footer}</div>}
    </div>
  )
}

