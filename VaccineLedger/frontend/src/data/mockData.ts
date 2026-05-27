import { SensorReading, BlockchainBlock, AnomalyIncident, SystemStatus } from '@/types'

// Generate mock sensor readings for the last hour
export const generateMockSensorData = (): SensorReading[] => {
  const now = Date.now()
  const data: SensorReading[] = []
  
  for (let i = 0; i < 60; i++) {
    const timestamp = now - (60 - i) * 60000 // 1 minute intervals
    const baseTemp = 2 + Math.sin(i / 10) * 0.5 + (Math.random() - 0.5) * 0.3
    const humidity = 45 + Math.cos(i / 15) * 5 + (Math.random() - 0.5) * 3
    const light = 30 + Math.sin(i / 8) * 20 + (Math.random() - 0.5) * 10
    
    data.push({
      timestamp,
      temperature: parseFloat(baseTemp.toFixed(2)),
      humidity: parseFloat(humidity.toFixed(1)),
      light: parseFloat(light.toFixed(1)),
    })
  }
  
  return data
}

// Mock blockchain blocks
export const mockBlockchainBlocks: BlockchainBlock[] = [
  {
    blockNumber: 15847,
    transactionHash: '0x7f2a9c...',
    eventType: 'Handover Attestation',
    timestamp: Date.now() - 5000,
    nodeAddress: '0x71C...3a9',
    verified: true,
    details: 'Batch VQ-2024-001 transferred from Hub 3 to Hub 4',
  },
  {
    blockNumber: 15846,
    transactionHash: '0xc3f4b2...',
    eventType: 'Temperature Alert',
    timestamp: Date.now() - 35000,
    nodeAddress: '0xaB5...2f1',
    verified: true,
    details: 'Temperature deviation corrected at Transit Point 2',
  },
  {
    blockNumber: 15845,
    transactionHash: '0x9d1f5e...',
    eventType: 'Custody Transfer',
    timestamp: Date.now() - 125000,
    nodeAddress: '0x71C...3a9',
    verified: true,
    details: 'Batch custody transferred to Regional Distribution Center',
  },
  {
    blockNumber: 15844,
    transactionHash: '0x2e4a6c...',
    eventType: 'Anomaly Anchor',
    timestamp: Date.now() - 215000,
    nodeAddress: '0x4f7...8c2',
    verified: true,
    details: 'Machine learning anomaly detected and anchored to ledger',
  },
  {
    blockNumber: 15843,
    transactionHash: '0x8b3f1a...',
    eventType: 'Handover Attestation',
    timestamp: Date.now() - 365000,
    nodeAddress: '0x71C...3a9',
    verified: true,
    details: 'Initial custody attestation at manufacturing facility',
  },
]

// Mock anomaly incidents
export const mockAnomalies: AnomalyIncident[] = [
  {
    id: 'anom-001',
    timestamp: Date.now() - 300000,
    severity: 'warning',
    type: 'Temperature Fluctuation',
    description: 'Minor temperature spike detected at Transit Hub 4',
    reason: 'Transient warming during vehicle dock loading procedure. Corrected within 2 minutes.',
    sensorLocation: 'Transit Hub 4 - Sensor A2',
    reading: 2.8,
    threshold: 2.5,
    resolved: true,
  },
  {
    id: 'anom-002',
    timestamp: Date.now() - 125000,
    severity: 'critical',
    type: 'Extreme Temperature Drift',
    description: 'Critical temperature deviation detected',
    reason: 'Refrigeration unit compressor cycle anomaly. Emergency cooling activated.',
    sensorLocation: 'Transit Hub 2 - Sensor B1',
    reading: 4.2,
    threshold: 2.5,
    resolved: false,
  },
  {
    id: 'anom-003',
    timestamp: Date.now() - 45000,
    severity: 'warning',
    type: 'Humidity Threshold',
    description: 'Humidity levels elevated slightly',
    reason: 'Environmental factors during peak distribution hours. Within acceptable range.',
    sensorLocation: 'Distribution Center - Sensor C3',
    reading: 58,
    threshold: 55,
    resolved: true,
  },
]

// Mock system status
export const mockSystemStatus: SystemStatus = {
  edgeNodeSync: 100,
  walletAddress: '0x71C94679857203ACb96eDA56D4881E30db7f3a9',
  blockchainHealth: 9950,
  anomalyRiskIndex: 0.12,
  activeBatch: 'VQ-2024-001-BATCH-447',
  lastUpdate: Date.now(),
}

// Sparkline data for metric cards
export const temperatureSparkline = [2.0, 2.1, 2.05, 2.15, 2.2, 2.1, 2.05, 2.08, 2.12, 2.15]
export const integritySparkline = [9940, 9945, 9950, 9948, 9952, 9955, 9950, 9948, 9950, 9950]
