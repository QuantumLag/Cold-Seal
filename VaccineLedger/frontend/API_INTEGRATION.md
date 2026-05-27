# API Integration & Data Flow Guide

## Overview

This guide demonstrates how to integrate the ColdChain dashboard with your backend API.

## Real-Time Data Stream Integration

### WebSocket Connection for Live Updates

```typescript
// src/hooks/useSensorStream.ts
import { useEffect, useState } from 'react'
import { ChartDataPoint } from '@/types'

export const useSensorStream = () => {
  const [data, setData] = useState<ChartDataPoint[]>([])
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const ws = new WebSocket(
      process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:8000/stream'
    )

    ws.onopen = () => {
      setIsConnected(true)
      console.log('Connected to sensor stream')
    }

    ws.onmessage = (event) => {
      try {
        const newPoint: ChartDataPoint = JSON.parse(event.data)
        setData((prev) => [...prev.slice(-59), newPoint])
      } catch (error) {
        console.error('Failed to parse stream data:', error)
      }
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      setIsConnected(false)
    }

    ws.onclose = () => {
      setIsConnected(false)
    }

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close()
      }
    }
  }, [])

  return { data, isConnected }
}
```

### REST API Integration

```typescript
// src/lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const API_TIMEOUT = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000')

class ApiClient {
  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT)

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    } finally {
      clearTimeout(timeoutId)
    }
  }

  // Sensor endpoints
  getSensorData(duration: 'hour' | 'day' | 'week' = 'hour') {
    return this.request(`/api/sensors/data?duration=${duration}`)
  }

  getCurrentSensorReading() {
    return this.request('/api/sensors/current')
  }

  // Blockchain endpoints
  getBlockchainBlocks(limit: number = 5) {
    return this.request(`/api/blockchain/blocks?limit=${limit}`)
  }

  getBlockDetails(blockNumber: number) {
    return this.request(`/api/blockchain/blocks/${blockNumber}`)
  }

  // Anomaly endpoints
  getAnomalies(resolved?: boolean) {
    const query = resolved !== undefined ? `?resolved=${resolved}` : ''
    return this.request(`/api/anomalies${query}`)
  }

  resolveAnomaly(anomalyId: string) {
    return this.request(`/api/anomalies/${anomalyId}/resolve`, {
      method: 'PATCH',
    })
  }

  // System status
  getSystemStatus() {
    return this.request('/api/system/status')
  }
}

export const apiClient = new ApiClient()
```

### Using the API in Components

```typescript
// src/app/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api'
import { useSensorStream } from '@/hooks/useSensorStream'

export default function Dashboard() {
  const streamData = useSensorStream()
  const [blocks, setBlocks] = useState([])
  const [anomalies, setAnomalies] = useState([])
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        
        // Fetch all data in parallel
        const [blocksData, anomaliesData, statusData] = await Promise.all([
          apiClient.getBlockchainBlocks(10),
          apiClient.getAnomalies(),
          apiClient.getSystemStatus(),
        ])

        setBlocks(blocksData)
        setAnomalies(anomaliesData)
        setStatus(statusData)
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
        // Show error toast or fallback UI
      } finally {
        setLoading(false)
      }
    }

    loadData()
    
    // Refresh data every 30 seconds
    const interval = setInterval(loadData, 30000)

    return () => clearInterval(interval)
  }, [])

  if (loading) return <LoadingState />

  return (
    <Dashboard
      sensorData={streamData.data}
      blocks={blocks}
      anomalies={anomalies}
      status={status}
    />
  )
}
```

## Error Handling

```typescript
// src/hooks/useAsync.ts
import { useState, useEffect } from 'react'

interface UseAsyncState<T> {
  status: 'idle' | 'pending' | 'success' | 'error'
  data: T | null
  error: Error | null
}

export function useAsync<T>(
  fn: () => Promise<T>,
  dependencies: any[] = []
): UseAsyncState<T> {
  const [state, setState] = useState<UseAsyncState<T>>({
    status: 'idle',
    data: null,
    error: null,
  })

  useEffect(() => {
    const loadData = async () => {
      setState({ status: 'pending', data: null, error: null })
      try {
        const data = await fn()
        setState({ status: 'success', data, error: null })
      } catch (error) {
        setState({
          status: 'error',
          data: null,
          error: error instanceof Error ? error : new Error(String(error)),
        })
      }
    }

    loadData()
  }, dependencies)

  return state
}

// Usage
const { status, data, error } = useAsync(() => apiClient.getBlockchainBlocks())

if (status === 'error') return <ErrorBoundary error={error} />
if (status === 'pending') return <LoadingSpinner />
if (status === 'success') return <DataComponent data={data} />
```

## Data Transformation

```typescript
// src/lib/transformers.ts
import { ChartDataPoint, BlockchainBlock, AnomalyIncident } from '@/types'

// Transform API response to chart data
export const transformSensorData = (raw: any[]): ChartDataPoint[] => {
  return raw.map((point) => ({
    timestamp: new Date(point.timestamp).getTime(),
    temperature: parseFloat(point.temperature),
    humidity: parseFloat(point.humidity),
    light: parseFloat(point.light),
  }))
}

// Enrich blockchain data
export const transformBlockData = (raw: any[]): BlockchainBlock[] => {
  return raw.map((block) => ({
    blockNumber: block.number,
    transactionHash: block.hash,
    eventType: block.type as any,
    timestamp: new Date(block.createdAt).getTime(),
    nodeAddress: block.nodeAddress,
    verified: block.verified ?? true,
    details: block.metadata?.description || '',
  }))
}

// Process anomaly data
export const transformAnomalies = (raw: any[]): AnomalyIncident[] => {
  return raw.map((incident) => ({
    id: incident.id,
    timestamp: new Date(incident.detectedAt).getTime(),
    severity: incident.severity as 'warning' | 'critical',
    type: incident.type,
    description: incident.summary,
    reason: incident.mlAnalysis?.reason || 'Analysis pending...',
    sensorLocation: incident.sensor.location,
    reading: incident.value,
    threshold: incident.expectedRange.max,
    resolved: incident.resolvedAt !== null,
  }))
}
```

## Caching Strategy

```typescript
// src/lib/cache.ts
class CacheManager {
  private cache = new Map<string, { data: any; timestamp: number }>()
  private TTL = 5 * 60 * 1000 // 5 minutes

  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null

    const isExpired = Date.now() - item.timestamp > this.TTL
    if (isExpired) {
      this.cache.delete(key)
      return null
    }

    return item.data as T
  }

  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    })
  }

  clear(): void {
    this.cache.clear()
  }
}

export const cacheManager = new CacheManager()

// Usage with API
export async function getCachedBlockchainBlocks() {
  const cached = cacheManager.get('blockchain-blocks')
  if (cached) return cached

  const blocks = await apiClient.getBlockchainBlocks()
  cacheManager.set('blockchain-blocks', blocks)
  return blocks
}
```

## Retry Logic

```typescript
// src/lib/retry.ts
export async function retry<T>(
  fn: () => Promise<T>,
  options = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delayMs = 1000,
    backoff = true,
  } = options as any

  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      if (attempt < maxAttempts) {
        const delay = backoff
          ? delayMs * Math.pow(2, attempt - 1)
          : delayMs

        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError
}

// Usage
const data = await retry(
  () => apiClient.getBlockchainBlocks(),
  { maxAttempts: 5, backoff: true }
)
```

## State Management Pattern

```typescript
// src/hooks/useDashboardData.ts
import { useReducer, useEffect } from 'react'
import { apiClient } from '@/lib/api'

type DashboardState = {
  blocks: any[]
  anomalies: any[]
  status: any
  loading: boolean
  error: Error | null
}

type DashboardAction =
  | { type: 'LOADING' }
  | { type: 'SUCCESS'; payload: DashboardState }
  | { type: 'ERROR'; payload: Error }

const initialState: DashboardState = {
  blocks: [],
  anomalies: [],
  status: null,
  loading: true,
  error: null,
}

function reducer(state: DashboardState, action: DashboardAction) {
  switch (action.type) {
    case 'LOADING':
      return { ...state, loading: true, error: null }
    case 'SUCCESS':
      return { ...action.payload, loading: false, error: null }
    case 'ERROR':
      return { ...state, loading: false, error: action.payload }
    default:
      return state
  }
}

export function useDashboardData() {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    const loadData = async () => {
      dispatch({ type: 'LOADING' })
      try {
        const [blocks, anomalies, status] = await Promise.all([
          apiClient.getBlockchainBlocks(),
          apiClient.getAnomalies(),
          apiClient.getSystemStatus(),
        ])

        dispatch({
          type: 'SUCCESS',
          payload: { blocks, anomalies, status, loading: false, error: null },
        })
      } catch (error) {
        dispatch({
          type: 'ERROR',
          payload: error instanceof Error ? error : new Error(String(error)),
        })
      }
    }

    loadData()
    const interval = setInterval(loadData, 30000)

    return () => clearInterval(interval)
  }, [])

  return state
}
```

## Best Practices

1. **Always use AbortController** for fetch requests to prevent memory leaks
2. **Implement exponential backoff** for retries on failure
3. **Cache frequently accessed data** to reduce API calls
4. **Transform API data** to match your application types
5. **Handle errors gracefully** with user-friendly messages
6. **Use TypeScript** for type-safe API responses
7. **Implement request deduplication** to avoid duplicate calls
8. **Monitor API performance** and optimize queries
9. **Use loading states** to provide feedback to users
10. **Test API integration** with mock responses

---

For more details, see `README.md` and `SETUP.md`.
