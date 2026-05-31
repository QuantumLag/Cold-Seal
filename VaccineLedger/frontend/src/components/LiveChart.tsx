'use client'

import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceArea,
  ResponsiveContainer,
} from 'recharts'
import { SAFE_TEMP_MAX, SAFE_TEMP_MIN } from '@/lib/constants'

interface LiveChartProps {
  data: { timestamp: string; temperature: number; humidity: number }[]
}

const TooltipCard = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  const [temp, humid] = payload
  return (
    <div className="rounded-lg border border-[rgba(245,166,35,0.2)] bg-[#0B0B12] px-3 py-2 shadow-card-shadow">
      <p className="text-xs text-cold-muted">{temp.payload.timestamp}</p>
      <p className="text-xs text-cold-amber">Temp: {temp.value.toFixed(1)} C</p>
      <p className="text-xs text-cold-green">Humidity: {humid.value.toFixed(1)}%</p>
    </div>
  )
}

export const LiveChart: React.FC<LiveChartProps> = ({ data }) => {
  return (
    <div className="glass-card glass-card-hover p-6">
      <div className="mb-4">
        <p className="text-[11px] uppercase tracking-[0.25em] text-cold-muted">Sensor Telemetry</p>
        <p className="text-sm text-cold-text mt-2">Live temperature and humidity stream</p>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="tempGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F5A623" stopOpacity={0.7} />
                <stop offset="100%" stopColor="#F5A623" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="timestamp" tick={{ fill: '#888899', fontSize: 10 }} tickLine={false} axisLine={false} />
            <YAxis yAxisId="temp" domain={[0, 15]} tick={{ fill: '#888899', fontSize: 10 }} tickLine={false} axisLine={false} />
            <YAxis yAxisId="humid" orientation="right" domain={[0, 100]} tick={{ fill: '#888899', fontSize: 10 }} tickLine={false} axisLine={false} />
            <Tooltip content={<TooltipCard />} />
            <ReferenceLine yAxisId="temp" y={SAFE_TEMP_MIN} stroke="#FF6B35" strokeDasharray="4 4" label={{ value: 'Min 2C', fill: '#FF6B35', fontSize: 10 }} />
            <ReferenceLine yAxisId="temp" y={SAFE_TEMP_MAX} stroke="#FF6B35" strokeDasharray="4 4" label={{ value: 'Max 8C', fill: '#FF6B35', fontSize: 10 }} />
            <ReferenceArea yAxisId="temp" y1={SAFE_TEMP_MIN} y2={SAFE_TEMP_MAX} fill="rgba(0,214,143,0.05)" />
            <Line
              yAxisId="temp"
              type="monotone"
              dataKey="temperature"
              stroke="#F5A623"
              strokeWidth={2.5}
              dot={false}
              isAnimationActive
            />
            <Line
              yAxisId="humid"
              type="monotone"
              dataKey="humidity"
              stroke="#00D68F"
              strokeWidth={2}
              dot={false}
              strokeDasharray="4 4"
              isAnimationActive
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex gap-3">
        {data.length > 0 && (
          <>
            <div className="chip-amber px-3 py-1 rounded-full text-xs">🌡 Last: {data[data.length - 1].temperature.toFixed(1)} C</div>
            <div className="chip-green px-3 py-1 rounded-full text-xs">💧 Humidity: {data[data.length - 1].humidity.toFixed(0)}%</div>
          </>
        )}
      </div>
    </div>
  )
}
