'use client'

import React, { useState, useEffect } from 'react'
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { ChartDataPoint } from '@/types'
import { formatDate } from '@/lib/utils'

interface RealTimeStreamProps {
  data: ChartDataPoint[]
}

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 shadow-lg">
        <p className="text-xs text-zinc-400 mb-2">{formatDate(payload[0].payload.timestamp)}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="text-xs font-medium">
            {entry.name}: {entry.value.toFixed(2)}{entry.name === 'Light' ? ' lux' : entry.name === 'Humidity' ? ' %' : ' °C'}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export const RealTimeStream: React.FC<RealTimeStreamProps> = ({ data }) => {
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    setAnimated(true)
  }, [])

  const chartData = data.map((point) => ({
    timestamp: point.timestamp,
    temperature: point.temperature,
    humidity: point.humidity,
    light: point.light / 10, // Scale light for better visualization
  }))

  return (
    <div className="group relative overflow-hidden rounded-lg border border-zinc-700/50 bg-zinc-900/30 backdrop-blur-sm p-6 transition-all duration-300 hover:border-zinc-600/80 hover:bg-zinc-900/50">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-zinc-100">Real-Time Data Stream</h2>
        <p className="text-xs text-zinc-400 mt-1">Live temperature, humidity, and light monitoring</p>
      </div>

      {/* Chart */}
      <div className="h-80 -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <defs>
              {/* Gradients for glowing effect */}
              <linearGradient id="temperatureGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34d399" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#34d399" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="humidityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#fbbf24" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="lightGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.1} />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis
              dataKey="timestamp"
              tick={false}
              axisLine={false}
              height={0}
            />
            <YAxis
              yAxisId="left"
              tick={{ fill: '#a1a1aa', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fill: '#a1a1aa', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={40}
            />

            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="line"
              textStyle={{ color: '#a1a1aa', fontSize: 12 }}
            />

            {/* Main lines with glow effect */}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="temperature"
              stroke="#34d399"
              strokeWidth={3}
              dot={false}
              isAnimationActive={animated}
              animationDuration={800}
              filter="url(#glow)"
              name="Temperature (°C)"
              connectNulls
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="humidity"
              stroke="#fbbf24"
              strokeWidth={2.5}
              dot={false}
              isAnimationActive={animated}
              animationDuration={800}
              name="Humidity (%)"
              connectNulls
              opacity={0.7}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="light"
              stroke="#60a5fa"
              strokeWidth={2}
              dot={false}
              isAnimationActive={animated}
              animationDuration={800}
              name="Light (lux/10)"
              connectNulls
              opacity={0.6}
              strokeDasharray="5 5"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Status indicator */}
      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-zinc-700/30">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-xs text-zinc-400">Live streaming • {data.length} data points</span>
      </div>
    </div>
  )
}
