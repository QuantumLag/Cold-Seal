'use client'

import React, { useState, useEffect } from 'react'
import {
  Thermometer,
  Shield,
  MapPin,
  AlertTriangle,
} from 'lucide-react'
import { Sidebar } from '@/components/Sidebar'
import { TopBar } from '@/components/TopBar'
import { MetricCard } from '@/components/MetricCard'
import { RealTimeStream } from '@/components/RealTimeStream'
import { LedgerAuditTimeline } from '@/components/LedgerAuditTimeline'
import { AnomalyIncidentConsole } from '@/components/AnomalyIncidentConsole'
import {
  generateMockSensorData,
  mockBlockchainBlocks,
  mockAnomalies,
  mockSystemStatus,
  temperatureSparkline,
  integritySparkline,
} from '@/data/mockData'
import { ChartDataPoint } from '@/types'

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sensorData, setSensorData] = useState<ChartDataPoint[]>([])
  const [systemStatus] = useState(mockSystemStatus)

  useEffect(() => {
    // Initialize with mock data
    setSensorData(generateMockSensorData())

    // Simulate real-time data updates
    const interval = setInterval(() => {
      setSensorData((prev) => {
        const now = Date.now()
        const newPoint: ChartDataPoint = {
          timestamp: now,
          temperature: 2 + Math.sin(Date.now() / 10000) * 0.5 + (Math.random() - 0.5) * 0.2,
          humidity: 45 + Math.cos(Date.now() / 15000) * 5 + (Math.random() - 0.5) * 2,
          light: 30 + Math.sin(Date.now() / 8000) * 20 + (Math.random() - 0.5) * 8,
        }
        return [...prev.slice(-59), newPoint]
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Get current temperature from latest data
  const currentTemp = sensorData.length > 0 ? sensorData[sensorData.length - 1].temperature : 2.0
  const currentHumidity = sensorData.length > 0 ? sensorData[sensorData.length - 1].humidity : 45

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={setSidebarOpen} />

      {/* Main content */}
      <div className="flex-1 flex flex-col md:ml-64">
        {/* Top bar */}
        <TopBar status={systemStatus} />

        {/* Workspace */}
        <main className="flex-1 overflow-auto bg-zinc-950">
          <div className="p-4 md:p-6 max-w-7xl mx-auto">
            {/* Page title */}
            <div className="mb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-zinc-100">Live Monitor</h1>
              <p className="text-sm text-zinc-400 mt-1">
                Real-time vaccine cold chain temperature and custody blockchain integrity
              </p>
            </div>

            {/* Metric cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Temperature card */}
              <MetricCard
                label="Live Temperature"
                value={currentTemp}
                unit="°C"
                icon={<Thermometer size={20} />}
                status={currentTemp < 2.5 ? 'healthy' : currentTemp < 3.0 ? 'warning' : 'critical'}
                sparklineData={temperatureSparkline}
                trend={currentTemp > 2.1 ? 'up' : 'down'}
              />

              {/* Blockchain integrity card */}
              <MetricCard
                label="Blockchain Integrity"
                value={systemStatus.blockchainHealth}
                unit="pts"
                icon={<Shield size={20} />}
                status={
                  systemStatus.blockchainHealth > 9900
                    ? 'healthy'
                    : systemStatus.blockchainHealth > 9800
                      ? 'warning'
                      : 'critical'
                }
                sparklineData={integritySparkline}
              />

              {/* Batch custody node card */}
              <MetricCard
                label="Batch Custody Node"
                value="Transit Hub 4"
                icon={<MapPin size={20} />}
                status="healthy"
                sparklineData={[100, 100, 100, 100, 100, 100, 100, 100, 100, 100]}
              />

              {/* Anomaly risk index card */}
              <MetricCard
                label="Anomaly Risk Index"
                value={systemStatus.anomalyRiskIndex}
                unit="/1.00"
                icon={<AlertTriangle size={20} />}
                status={
                  systemStatus.anomalyRiskIndex < 0.2
                    ? 'healthy'
                    : systemStatus.anomalyRiskIndex < 0.5
                      ? 'warning'
                      : 'critical'
                }
                trend="down"
              />
            </div>

            {/* Main content grid - Responsive 2-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left column: Real-time stream (spans 2 cols on large screens) */}
              <div className="lg:col-span-2">
                <RealTimeStream data={sensorData} />
              </div>

              {/* Right column: Ledger timeline */}
              <div className="lg:col-span-1">
                <LedgerAuditTimeline blocks={mockBlockchainBlocks} />
              </div>
            </div>

            {/* Anomaly console - Full width */}
            <div className="mt-6">
              <AnomalyIncidentConsole incidents={mockAnomalies} />
            </div>

            {/* Footer info */}
            <div className="mt-8 pt-6 border-t border-zinc-700/30 text-center text-xs text-zinc-500">
              <p>ColdChain Monitor v1.0 • Next-Gen IoT-Blockchain Vaccine Cold Chain • Last update: {new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        </main>
      </div>

      {/* Close sidebar on mobile when clicking outside */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}
