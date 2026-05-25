import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatAddress = (address: string, chars = 6): string => {
  if (!address) return ''
  return `${address.slice(0, chars)}...${address.slice(-chars)}`
}

export const formatTime = (timestamp: number): string => {
  const now = Date.now()
  const diff = now - timestamp
  
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (seconds < 60) return `${seconds}s ago`
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

export const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })
}

export const getStatusColor = (status: 'healthy' | 'warning' | 'critical'): string => {
  switch (status) {
    case 'healthy':
      return 'text-emerald-400'
    case 'warning':
      return 'text-amber-400'
    case 'critical':
      return 'text-red-400'
    default:
      return 'text-zinc-400'
  }
}

export const getStatusBgColor = (status: 'healthy' | 'warning' | 'critical'): string => {
  switch (status) {
    case 'healthy':
      return 'bg-emerald-400/10 border-emerald-500/20'
    case 'warning':
      return 'bg-amber-400/10 border-amber-500/20'
    case 'critical':
      return 'bg-red-400/10 border-red-500/20'
    default:
      return 'bg-zinc-400/10 border-zinc-500/20'
  }
}

export const getStatusGlow = (status: 'healthy' | 'warning' | 'critical'): string => {
  switch (status) {
    case 'healthy':
      return 'shadow-glow'
    case 'warning':
      return 'shadow-glow-amber'
    case 'critical':
      return 'shadow-glow-red'
    default:
      return ''
  }
}
