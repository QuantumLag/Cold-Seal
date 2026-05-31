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

  const data = payload.data || payload
  const rawTemp = Number(
    data.temperature ?? data.temp ?? data.temperature_raw ?? data.temp_raw
  )

  if (Number.isNaN(rawTemp)) {
    return null
  }

  const temperatureC = rawTemp / 10
  const integrity = Number(data.integrity_post_breach ?? data.integrity ?? data.integrityScore ?? 100)
  const statusText = String(data.status ?? '').toUpperCase()
  const isBreach = statusText === 'BREACH' || temperatureC < SAFE_MIN || temperatureC > SAFE_MAX
  const score = Number(data.score ?? payload.score ?? 100)
  const viability = Number(data.viability ?? payload.viability ?? 100)
  const recommendation = String(data.recommendation ?? payload.recommendation ?? '')
  const expiresInHours = Number(data.expires_in_hours ?? payload.expires_in_hours ?? -1)

  return {
    id: String(data.log_id ?? data.id ?? payload.tx_index ?? payload.index ?? Date.now()),
    timestamp: parseTimestamp(data.timestamp ?? data.time ?? data.ts ?? payload.timestamp),
    temperatureRaw: rawTemp,
    temperatureC,
    gps: String(data.gps ?? data.location ?? data.coordinates ?? 'Unknown'),
    integrity: Number.isNaN(integrity) ? 100 : integrity,
    status: isBreach ? 'BREACH' : 'SAFE',
    txHash: data.tx_hash ?? data.txHash,
    blockHeight: data.block_height ?? data.blockNumber,
    score: Number.isNaN(score) ? 100 : score,
    viability: Number.isNaN(viability) ? 100 : viability,
    recommendation,
    expiresInHours: Number.isNaN(expiresInHours) ? -1 : expiresInHours,
  }
}

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [systemStatus] = useState(mockSystemStatus)
  const [logs, setLogs] = useState<BreachLog[]>([])
  const [selectedLog, setSelectedLog] = useState<BreachLogDetail | null>(null)
  const [currentTemp, setCurrentTemp] = useState<number | null>(null)
  const [integrityScore, setIntegrityScore] = useState(100)
  const [slaScore, setSlaScore] = useState(100)
  const [viability, setViability] = useState(100)
  const [recommendation, setRecommendation] = useState('')
  const [expiresInHours, setExpiresInHours] = useState<number | null>(null)
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
        if (log.score !== undefined) {
          setSlaScore(log.score)
        }
        if (log.viability !== undefined) {
          setViability(log.viability)
        }
        if (log.recommendation) {
          setRecommendation(log.recommendation)
        }
        if (log.expiresInHours !== undefined && log.expiresInHours >= 0) {
          setExpiresInHours(log.expiresInHours)
        }
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

  const getRecommendationStyle = (text: string) => {
    const lower = text.toLowerCase()
    if (lower.includes('destroy') || lower.includes('unsafe')) {
      return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', animate: true }
    }
    if (lower.includes('caution') || lower.includes('approaching')) {
      return { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', animate: false }
    }
    return { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', animate: false }
  }

  const kpiCards = useMemo(() => ([
    {
      label: 'SLA Compliance Status',
      value: `${slaScore.toFixed(2)}%`,
      accent: 'text-blue-600',
      background: 'from-blue-50 to-white',
      icon: '🔗',
    },
    {
      label: 'Biological Vaccine Viability',
      value: `${viability.toFixed(2)}%`,
      accent: 'text-emerald-600',
      background: 'from-emerald-50 to-white',
      icon: '🧪',
    },
  ]), [slaScore, viability])

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {kpiCards.map((card) => (
                <div
                  key={card.label}
                  className={`rounded-xl border border-border-light bg-gradient-to-br ${card.background} p-6 shadow-card-shadow`}
                >
                  <p className="text-2xl mr-2 inline-block">{card.icon}</p>
                  <p className="text-xs uppercase tracking-wide text-text-secondary mb-2 inline-block">{card.label}</p>
                  <p className={`text-3xl font-bold ${card.accent} mt-3`}>
                    {card.value}
                  </p>
                  <p className="text-xs text-text-secondary mt-2">Updated live from telemetry stream.</p>
                </div>
              ))}
            </div>

            {(expiresInHours !== null || recommendation) && (
              <div className="bg-white rounded-xl border border-border-light shadow-card-shadow p-6 mb-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Predictive Stability Metrics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {expiresInHours !== null && (
                    <div className="bg-bg-primary rounded-lg p-4">
                      <p className="text-xs uppercase tracking-wide text-text-secondary mb-2">Estimated Shelf Life Remaining</p>
                      <p className="text-2xl font-bold text-text-primary">{expiresInHours.toFixed(1)} Hours</p>
                    </div>
                  )}
                  {recommendation && (
                    <div className={`rounded-lg p-4 border ${
                      getRecommendationStyle(recommendation).bg
                    } ${
                      getRecommendationStyle(recommendation).border
                    } ${
                      getRecommendationStyle(recommendation).animate ? 'animate-pulse' : ''
                    }`}>
                      <p className="text-xs uppercase tracking-wide mb-1 opacity-70">Clinical Recommendation</p>
                      <p className={`text-sm font-semibold ${
                        getRecommendationStyle(recommendation).text
                      }`}>
                        {recommendation}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

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
