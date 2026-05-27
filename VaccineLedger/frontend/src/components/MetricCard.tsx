'use client'

import React from 'react'
import { LineChart, Line, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'
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
  const chartData = sparklineData.map((v, i) => ({
    value: v,
    index: i,
  }))

  const strokeColor = status === 'healthy' ? '#10b981' : status === 'warning' ? '#f59e0b' : '#ef4444'
  const statusColorClass = status === 'healthy' ? 'text-green-600' : status === 'warning' ? 'text-orange-600' : 'text-red-600'
  const bgColorClass = status === 'healthy' ? 'bg-green-50' : status === 'warning' ? 'bg-orange-50' : 'bg-red-50'
  const dotColor = status === 'healthy' ? 'bg-green-500' : status === 'warning' ? 'bg-orange-500' : 'bg-red-500'

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-lg border border-border-light bg-white shadow-card-shadow p-6',
        'transition-all duration-300 hover:shadow-card-shadow-hover'
      )}
    >
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-1">{label}</p>
            <div className="flex items-baseline gap-1">
              <p className={cn('text-3xl font-bold', statusColorClass)}>
                {typeof value === 'number' ? value.toFixed(2) : value}
              </p>
              {unit && <span className="text-sm text-text-secondary">{unit}</span>}
            </div>
          </div>
          <div className={cn('p-2 rounded-lg text-lg', bgColorClass, statusColorClass)}>
            {icon}
          </div>
        </div>

        {/* Trend indicator */}
        {trend !== 'stable' && (
          <div className="flex items-center gap-1 mb-3">
            {trend === 'up' && (
              <div className="flex items-center gap-1 text-green-600 text-xs">
                <TrendingUp size={12} />
                <span>Increasing</span>
              </div>
            )}
            {trend === 'down' && (
              <div className="flex items-center gap-1 text-orange-600 text-xs">
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
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border-light">
          <div
            className={cn(
              'w-2 h-2 rounded-full',
              dotColor,
              status === 'healthy' || status === 'critical' ? 'animate-pulse' : ''
            )}
          />
          <span className="text-xs text-text-secondary capitalize">{status}</span>
        </div>
      </div>
    </div>
  )
}

