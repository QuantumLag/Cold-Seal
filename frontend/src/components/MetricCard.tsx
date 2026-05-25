'use client'

import React from 'react'
import { LineChart, Line, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn, getStatusColor, getStatusGlow } from '@/lib/utils'
import { MetricCardProps } from '@/types'

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  icon,
  status,
  sparklineData = [],
  trend = 'stable',
}) => {
  const statusColor = getStatusColor(status)
  const glowClass = getStatusGlow(status)

  const chartData = sparklineData.map((v, i) => ({
    value: v,
    index: i,
  }))

  const strokeColor = status === 'healthy' ? '#34d399' : status === 'warning' ? '#fbbf24' : '#f87171'

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-lg border border-zinc-700/50 bg-zinc-900/30 backdrop-blur-sm p-6',
        'transition-all duration-300 hover:border-zinc-600/80 hover:bg-zinc-900/50',
        glowClass
      )}
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/5 group-hover:to-emerald-500/0 transition-all duration-300" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1">{label}</p>
            <div className="flex items-baseline gap-1">
              <p className={cn('text-3xl font-bold', statusColor)}>
                {typeof value === 'number' ? value.toFixed(2) : value}
              </p>
              {unit && <span className="text-sm text-zinc-500">{unit}</span>}
            </div>
          </div>
          <div className={cn('p-2 rounded-lg bg-zinc-800/50 text-lg', statusColor)}>
            {icon}
          </div>
        </div>

        {/* Trend indicator */}
        {trend !== 'stable' && (
          <div className="flex items-center gap-1 mb-3">
            {trend === 'up' && (
              <div className="flex items-center gap-1 text-emerald-400 text-xs">
                <TrendingUp size={12} />
                <span>Increasing</span>
              </div>
            )}
            {trend === 'down' && (
              <div className="flex items-center gap-1 text-amber-400 text-xs">
                <TrendingDown size={12} />
                <span>Decreasing</span>
              </div>
            )}
          </div>
        )}

        {/* Sparkline chart */}
        {sparklineData.length > 0 && (
          <div className="h-12 -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 2, right: 2, left: 0, bottom: 2 }}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={strokeColor}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Status badge */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-zinc-700/30">
          <div
            className={cn(
              'w-2 h-2 rounded-full',
              status === 'healthy' && 'bg-emerald-400 animate-pulse',
              status === 'warning' && 'bg-amber-400',
              status === 'critical' && 'bg-red-400 animate-pulse'
            )}
          />
          <span className="text-xs text-zinc-400 capitalize">{status}</span>
        </div>
      </div>
    </div>
  )
}
