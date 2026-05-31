'use client'

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { API_BASE, SAFE_TEMP_MAX, SAFE_TEMP_MIN, WS_URL } from '@/lib/constants'

export type ConnectionStatus = 'live' | 'disconnected'

export type LiveTelemetry = {
  temp: number
  humidity: number
  gps: string
  status: string
  timestamp: string
  score?: number
  viability?: number
  recommendation?: string
  expires_in_hours?: number
}

export type GpsPoint = {
  lat: number
  lon: number
  timestamp: string
  status: string
  tempC: number
}

export type AuditRecord = {
  logId: number
  temp: number
  gps: string
  timestamp: string
  status: string
  txHash?: string
}

export type AnomalyEvent = {
  id: string
  timestamp: string
  score: number
  reason: string
}

export type ColdSealState = {
  liveData: LiveTelemetry | null
  tempHistory: { timestamp: string; temperature: number; humidity: number }[]
  humidHistory: { timestamp: string; humidity: number }[]
  gpsHistory: GpsPoint[]
  integrityScore: number
  logCount: number
  auditRecords: AuditRecord[]
  anomalyEvents: AnomalyEvent[]
  connectionStatus: ConnectionStatus
}

const ColdSealContext = createContext<ColdSealState | null>(null)

const parseGps = (gps: string): { lat: number; lon: number } | null => {
  const parts = gps.split(',').map((value) => Number(value.trim()))
  if (parts.length < 2 || Number.isNaN(parts[0]) || Number.isNaN(parts[1])) {
    return null
  }
  return { lat: parts[0], lon: parts[1] }
}

const clampHistory = <T,>(values: T[], maxSize: number) => {
  if (values.length <= maxSize) return values
  return values.slice(values.length - maxSize)
}

const safeNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value)
  return Number.isNaN(parsed) ? fallback : parsed
}

export const ColdSealProvider = ({ children }: { children: React.ReactNode }) => {
  const [liveData, setLiveData] = useState<LiveTelemetry | null>(null)
  const [tempHistory, setTempHistory] = useState<ColdSealState['tempHistory']>([])
  const [humidHistory, setHumidHistory] = useState<ColdSealState['humidHistory']>([])
  const [gpsHistory, setGpsHistory] = useState<GpsPoint[]>([])
  const [integrityScore, setIntegrityScore] = useState(0)
  const [logCount, setLogCount] = useState(0)
  const [auditRecords, setAuditRecords] = useState<AuditRecord[]>([])
  const [anomalyEvents, setAnomalyEvents] = useState<AnomalyEvent[]>([])
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected')

  const socketRef = useRef<WebSocket | null>(null)
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttempts = useRef(0)

  useEffect(() => {
    let isMounted = true

    const connect = () => {
      if (!isMounted) return

      try {
        const socket = new WebSocket(WS_URL)

        socket.onopen = () => {
          if (!isMounted) return
          reconnectAttempts.current = 0
          setConnectionStatus('live')
        }

        socket.onmessage = (event) => {
          if (!isMounted) return
          let payload: any = null

          try {
            payload = JSON.parse(event.data)
          } catch {
            payload = event.data
          }

          const data = payload?.data ?? payload
          if (!data || typeof data !== 'object') {
            return
          }

          const tempRaw = safeNumber(data.temp ?? data.temperature ?? data.temperature_raw ?? 0, 0)
          const temperatureC = tempRaw / 10
          const humidity = safeNumber(data.humidity ?? 0, 0)
          const gps = String(data.gps ?? '0,0')
          const timestamp = String(data.timestamp ?? new Date().toISOString())
          const status = String(data.status ?? '')

          const nextLive: LiveTelemetry = {
            temp: tempRaw,
            humidity,
            gps,
            status,
            timestamp,
            score: data.score !== undefined ? safeNumber(data.score, 0) : undefined,
            viability: data.viability !== undefined ? safeNumber(data.viability, 0) : undefined,
            recommendation: data.recommendation ? String(data.recommendation) : undefined,
            expires_in_hours: data.expires_in_hours !== undefined ? safeNumber(data.expires_in_hours, 0) : undefined,
          }

          setLiveData(nextLive)
          setTempHistory((prev) =>
            clampHistory(
              [...prev, { timestamp, temperature: temperatureC, humidity }],
              30
            )
          )
          setHumidHistory((prev) =>
            clampHistory([...prev, { timestamp, humidity }], 30)
          )

          const coords = parseGps(gps)
          if (coords) {
            setGpsHistory((prev) =>
              clampHistory(
                [...prev, { ...coords, timestamp, status, tempC: temperatureC }],
                10
              )
            )
          }

          const anomalyScore = data.anomaly_score ?? data.anomalyScore
          if (anomalyScore !== undefined) {
            const nextEvent: AnomalyEvent = {
              id: String(data.anomaly_id ?? `${timestamp}-${anomalyScore}`),
              timestamp,
              score: safeNumber(anomalyScore, 0),
              reason: String(data.anomaly_reason ?? data.reason ?? 'Anomaly detected'),
            }
            setAnomalyEvents((prev) => clampHistory([...prev, nextEvent], 50))
          }
        }

        socket.onerror = () => {
          if (!isMounted) return
          setConnectionStatus('disconnected')
        }

        socket.onclose = () => {
          if (!isMounted) return
          setConnectionStatus('disconnected')

          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000)
          reconnectAttempts.current += 1
          reconnectTimer.current = setTimeout(connect, delay)
        }

        socketRef.current = socket
      } catch {
        setConnectionStatus('disconnected')
      }
    }

    connect()

    return () => {
      isMounted = false
      if (socketRef.current) {
        socketRef.current.close()
      }
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current)
      }
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const loadIntegrityScore = async () => {
      try {
        const response = await fetch(`${API_BASE}/integrity-score`)
        const data = await response.json()
        if (isMounted) {
          setIntegrityScore(safeNumber(data, 0))
        }
      } catch {
        if (isMounted) {
          setIntegrityScore(0)
        }
      }
    }

    const loadLogCount = async () => {
      try {
        const response = await fetch(`${API_BASE}/log-count`)
        const data = await response.json()
        if (isMounted) {
          setLogCount(safeNumber(data, 0))
        }
      } catch {
        if (isMounted) {
          setLogCount(0)
        }
      }
    }

    const loadAuditRecords = async () => {
      try {
        const response = await fetch(`${API_BASE}/blockchain-records`)
        const data = await response.json()
        if (isMounted && Array.isArray(data)) {
          const mapped = data.map((record: any, index: number) => ({
            logId: safeNumber(record.log_id ?? record.id ?? index + 1, index + 1),
            temp: safeNumber(record.temp ?? record.temperature ?? record.temp_raw ?? 0, 0),
            gps: String(record.gps ?? '0,0'),
            timestamp: String(record.timestamp ?? new Date().toISOString()),
            status: String(record.status ?? 'SAFE'),
            txHash: record.tx_hash ?? record.txHash,
          }))
          setAuditRecords(mapped)
        }
      } catch {
        if (isMounted) {
          setAuditRecords([])
        }
      }
    }

    const loadAll = () => {
      loadIntegrityScore()
      loadLogCount()
      loadAuditRecords()
    }

    loadAll()
    const interval = setInterval(loadAll, 10000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [])

  const value = useMemo(
    () => ({
      liveData,
      tempHistory,
      humidHistory,
      gpsHistory,
      integrityScore,
      logCount,
      auditRecords,
      anomalyEvents,
      connectionStatus,
    }),
    [
      liveData,
      tempHistory,
      humidHistory,
      gpsHistory,
      integrityScore,
      logCount,
      auditRecords,
      anomalyEvents,
      connectionStatus,
    ]
  )

  return React.createElement(ColdSealContext.Provider, { value }, children)
}

export const useColdSeal = () => {
  const context = useContext(ColdSealContext)
  if (!context) {
    throw new Error('useColdSeal must be used within ColdSealProvider')
  }
  return context
}

export const getTempStatus = (temperatureC: number) => {
  if (temperatureC < SAFE_TEMP_MIN || temperatureC > SAFE_TEMP_MAX) {
    return 'BREACH'
  }
  return 'SAFE'
}
