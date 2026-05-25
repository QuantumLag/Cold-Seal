// Core types for the vaccine cold chain monitoring system

export interface SensorReading {
  timestamp: number
  temperature: number
  humidity: number
  light: number
}

export interface MetricCardProps {
  label: string
  value: string | number
  unit?: string
  icon: React.ReactNode
  status: 'healthy' | 'warning' | 'critical'
  sparklineData?: number[]
  trend?: 'up' | 'down' | 'stable'
}

export interface BlockchainBlock {
  blockNumber: number
  transactionHash: string
  eventType: 'Handover Attestation' | 'Anomaly Anchor' | 'Temperature Alert' | 'Custody Transfer'
  timestamp: number
  nodeAddress: string
  verified: boolean
  details: string
}

export interface AnomalyIncident {
  id: string
  timestamp: number
  severity: 'warning' | 'critical'
  type: string
  description: string
  reason: string
  sensorLocation: string
  reading: number
  threshold: number
  resolved: boolean
}

export interface SystemStatus {
  edgeNodeSync: number // 0-100%
  walletAddress: string
  blockchainHealth: number // 0-100%
  anomalyRiskIndex: number // 0-1.0
  activeBatch: string
  lastUpdate: number
}

export interface ChartDataPoint {
  timestamp: number
  temperature: number
  humidity: number
  light: number
}

export type NavItem = {
  label: string
  href: string
  icon: React.ReactNode
  badge?: number
}
