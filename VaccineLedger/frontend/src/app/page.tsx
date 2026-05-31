'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { TopBar } from '@/components/TopBar'
import { ProductTable, BreachLog } from '@/components/ProductTable'
import { ProductDetailCard, BreachLogDetail } from '@/components/ProductDetailCard'
import { mockSystemStatus } from '@/data/mockData'

const SAFE_MIN = 2.0
const SAFE_MAX = 8.0

const parseTimestamp = (value: unknown) => {
  if (value instanceof Date) {
    return value.toISOString()
  }

  if (typeof value === 'number') {
    return new Date(value).toISOString()
  }

  if (typeof value === 'string' && value) {
    const parsed = Date.parse(value)
    if (!Number.isNaN(parsed)) {
      return new Date(parsed).toISOString()
    }
  }

  return new Date().toISOString()
}

const normalizeTelemetry = (payload: any): BreachLog | null => {
  if (!payload || typeof payload !== 'object') {
    return null
  }

  const rawTemp = Number(
    payload.temperature ?? payload.temp ?? payload.temperature_raw ?? payload.temp_raw
  )

  if (Number.isNaN(rawTemp)) {
    return null
  }

  const temperatureC = rawTemp / 10
  const integrity = Number(payload.integrity_post_breach ?? payload.integrity ?? payload.integrityScore ?? 100)
  const statusText = String(payload.status ?? '').toUpperCase()
  const isBreach = statusText === 'BREACH' || temperatureC < SAFE_MIN || temperatureC > SAFE_MAX

  return {
    id: String(payload.log_id ?? payload.id ?? payload.tx_index ?? payload.index ?? Date.now()),
    timestamp: parseTimestamp(payload.timestamp ?? payload.time ?? payload.ts),
    temperatureRaw: rawTemp,
    temperatureC,
    gps: String(payload.gps ?? payload.location ?? payload.coordinates ?? 'Unknown'),
    integrity: Number.isNaN(integrity) ? 100 : integrity,
    status: isBreach ? 'BREACH' : 'SAFE',
    txHash: payload.tx_hash ?? payload.txHash,
    blockHeight: payload.block_height ?? payload.blockNumber,
  }
}

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [systemStatus] = useState(mockSystemStatus)
  const [logs, setLogs] = useState<BreachLog[]>([])
  const [selectedLog, setSelectedLog] = useState<BreachLogDetail | null>(null)
  const [currentTemp, setCurrentTemp] = useState<number | null>(null)
  const [integrityScore, setIntegrityScore] = useState(100)
  const [breachCount, setBreachCount] = useState(0)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const toastTimer = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:8000/ws/telemetry')

    socket.onmessage = (event) => {
      let payload: any = null

      try {
        payload = JSON.parse(event.data)
      } catch {
        payload = event.data
      }

      const items = Array.isArray(payload) ? payload : [payload]

      items.forEach((item) => {
        const log = normalizeTelemetry(item)
        if (!log) {
          return
        }

        setLogs((prev) => [log, ...prev])
        setCurrentTemp(log.temperatureC)
        setIntegrityScore(log.integrity)
        if (log.status === 'BREACH') {
          setBreachCount((prev) => prev + 1)
          setToastMessage('Cold-chain breach detected. Ledger entry anchored.')
        }
      })
    }

    socket.onerror = () => {
      setToastMessage('Telemetry stream disconnected. Retrying...')
    }

    return () => {
      socket.close()
    }
  }, [])

  useEffect(() => {
    if (!toastMessage) {
      return
    }

    if (toastTimer.current) {
      clearTimeout(toastTimer.current)
    }

    toastTimer.current = setTimeout(() => {
      setToastMessage(null)
    }, 3500)

    return () => {
      if (toastTimer.current) {
        clearTimeout(toastTimer.current)
      }
    }
  }, [toastMessage])

  const integrityDisplay = `${integrityScore.toFixed(2)}%`
  const currentTempDisplay = currentTemp !== null ? `${currentTemp.toFixed(1)} C` : '--'
  const tempStatus = currentTemp === null
    ? 'idle'
    : currentTemp < SAFE_MIN || currentTemp > SAFE_MAX
      ? 'breach'
      : 'safe'

  const kpiCards = useMemo(() => ([
    {
      label: 'Product Integrity Score',
      value: integrityDisplay,
      accent: 'text-emerald-600',
      background: 'from-emerald-50 to-white',
    },
    {
      label: 'Total Breaches Logged',
      value: breachCount.toString(),
      accent: 'text-rose-600',
      background: 'from-rose-50 to-white',
    },
    {
      label: 'Current Temperature',
      value: currentTempDisplay,
      accent: tempStatus === 'breach' ? 'text-rose-600' : 'text-emerald-600',
      background: tempStatus === 'breach' ? 'from-rose-50 to-white' : 'from-emerald-50 to-white',
    },
  ]), [integrityDisplay, breachCount, currentTempDisplay, tempStatus])

  return (
    <div className="flex h-screen bg-bg-primary">
      <Sidebar isOpen={sidebarOpen} onToggle={setSidebarOpen} />

      <div className="flex-1 flex flex-col md:ml-64">
        <TopBar status={systemStatus} />

        <main className="flex-1 overflow-auto bg-bg-primary">
          <div className="p-6 max-w-full">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-text-primary">PharmaTrace Live Telemetry</h1>
                <p className="text-sm text-text-secondary mt-1">Real-time cold-chain integrity monitoring and breach ledger.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {kpiCards.map((card) => (
                <div
                  key={card.label}
                  className={`rounded-xl border border-border-light bg-gradient-to-br ${card.background} p-6 shadow-card-shadow`}
                >
                  <p className="text-xs uppercase tracking-wide text-text-secondary mb-2">{card.label}</p>
                  <p className={`text-3xl font-bold ${card.accent} ${tempStatus === 'breach' && card.label === 'Current Temperature' ? 'animate-pulse' : ''}`}>
                    {card.value}
                  </p>
                  <p className="text-xs text-text-secondary mt-2">Updated live from telemetry stream.</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-6">
              <div>
                <ProductTable
                  logs={logs}
                  onSelectRow={setSelectedLog}
                  selectedId={selectedLog?.id}
                />
              </div>

              <div className="relative">
                <div className="lg:sticky lg:top-6 transition-transform duration-300 ease-out">
                  <ProductDetailCard log={selectedLog} />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {toastMessage && (
        <div className="fixed right-6 bottom-6 z-50">
          <div className="bg-slate-900 text-white px-4 py-3 rounded-lg shadow-lg border border-white/10">
            <p className="text-sm font-medium">{toastMessage}</p>
          </div>
        </div>
      )}
    </div>
  )
}
