'use client'

import dynamic from 'next/dynamic'
import React, { useMemo, useState, useEffect } from 'react'
import { Thermometer, Shield, FlaskConical, Clock } from 'lucide-react'
import CountUp from 'react-countup'
import { useColdSeal, getTempStatus } from '@/hooks/useColdSeal';
import { MetricCard } from '@/components/MetricCard'
import { LiveChart } from '@/components/LiveChart'
import { AuditTimeline } from '@/components/AuditTimeline'
import { BreachBanner } from '@/components/BreachBanner'

const MapTracker = dynamic(() => import('@/components/MapTracker').then((mod) => mod.MapTracker), {
  ssr: false,
})

const getScoreColor = (value: number) => {
  if (value > 80) return 'text-cold-green'
  if (value > 50) return 'text-cold-amber'
  return 'text-cold-orange'
}

const getRecommendationBadge = (text?: string) => {
  const normalized = (text || '').toLowerCase()
  if (normalized.includes('destroy') || normalized.includes('unsafe')) {
    return 'bg-red-50 text-red-600 animate-breach-pulse'
  }
  if (normalized.includes('caution') || normalized.includes('approaching')) {
    return 'bg-amber-50 text-amber-600'
  }
  if (normalized.includes('excellent') || normalized.includes('recommended')) {
    return 'bg-emerald-50 text-emerald-600'
  }
  return 'bg-white/5 text-cold-muted'
}

export default function LiveMonitorPage() {
  const {
    liveData,
    tempHistory,
    gpsHistory,
    integrityScore,
    logCount,
    auditRecords,
  } = useColdSeal()

  const temperatureC = liveData ? liveData.temp / 10 : 0
  const temperatureStatus = liveData ? getTempStatus(temperatureC) : 'SAFE'
  const isBreach = temperatureStatus === 'BREACH'
  const recommendation = liveData?.recommendation
  const recommendationBadge = getRecommendationBadge(recommendation)

  const [bannerDismissed, setBannerDismissed] = useState(false)

  useEffect(() => {
    if (isBreach) {
      setBannerDismissed(false)
    }
  }, [isBreach, liveData?.timestamp])

  const sparklineData = useMemo(
    () => tempHistory.slice(-20).map((point) => ({ value: point.temperature })),
    [tempHistory]
  )

  const tempColor = isBreach ? 'text-cold-orange' : 'text-cold-amber'

  return (
    <div className="pt-8">
      <div className="mb-8">
        <h1 className="text-3xl font-display text-cold-text">Live Monitor</h1>
        <p className="text-sm text-cold-muted mt-2">
          Real-time vaccine cold chain telemetry and blockchain integrity
        </p>
      </div>

      <BreachBanner
        visible={isBreach && !bannerDismissed}
        temperatureC={temperatureC}
        onDismiss={() => setBannerDismissed(true)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Live Temperature"
          value={<CountUp end={temperatureC} decimals={1} duration={0.3} suffix=" C" />}
          icon={<Thermometer size={18} />}
          accentClassName={tempColor}
          footer={
            <div className={`mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs ${isBreach ? 'chip-orange' : 'chip-green'}`}>
              <span className={`w-2 h-2 rounded-full ${isBreach ? 'bg-cold-orange' : 'bg-cold-green'} animate-pulse`} />
              {isBreach ? 'BREACH' : 'SAFE'}
            </div>
          }
        >
          <div className="h-10 mt-2">
            {sparklineData.length > 1 && (
              <svg viewBox="0 0 100 40" className="w-[120px] h-[40px]">
                <polyline
                  fill="none"
                  stroke={isBreach ? '#FF6B35' : '#F5A623'}
                  strokeWidth="2"
                  points={sparklineData
                    .map((point, index) => {
                      const x = (index / (sparklineData.length - 1)) * 100
                      const y = 40 - (point.value / 15) * 40
                      return `${x},${Math.max(0, Math.min(40, y))}`
                    })
                    .join(' ')}
                />
              </svg>
            )}
          </div>
        </MetricCard>

        <MetricCard
          title="Chain Integrity"
          value={<CountUp end={integrityScore} decimals={0} duration={0.3} suffix=" pts" />}
          icon={<Shield size={18} />}
          accentClassName={getScoreColor(integrityScore)}
          footer={<p className="text-xs text-cold-muted">Out of 10,000 pts</p>}
        />

        <MetricCard
          title="Vaccine Viability"
          value={
            liveData?.viability !== undefined ? (
              <CountUp end={liveData.viability} decimals={2} duration={0.3} suffix="%" />
            ) : (
              '100.00%'
            )
          }
          icon={<FlaskConical size={18} />}
          accentClassName={getScoreColor(liveData?.viability ?? 100)}
        >
          <div className="mt-3">
            <div className="h-2 rounded-full bg-black/40 overflow-hidden">
              <div
                className="h-full bg-cold-amber transition-all duration-1000"
                style={{ width: `${Math.min(100, Math.max(0, liveData?.viability ?? 100))}%` }}
              />
            </div>
            {recommendation && (
              <div className={`mt-3 inline-flex items-center px-3 py-1 rounded-full text-[11px] ${recommendationBadge}`}>
                {recommendation}
              </div>
            )}
            {liveData?.expires_in_hours !== undefined && (
              <p className="text-xs text-cold-muted mt-3">
                Shelf Life Remaining: {liveData.expires_in_hours.toFixed(1)} Hours
              </p>
            )}
          </div>
        </MetricCard>

        <MetricCard
          title="Shelf Life"
          value={
            liveData?.expires_in_hours !== undefined ? (
              <CountUp end={liveData.expires_in_hours} decimals={1} duration={0.3} suffix=" hrs" />
            ) : (
              '0.0 hrs'
            )
          }
          icon={<Clock size={18} />}
          accentClassName="text-cold-amber"
          footer={
            <p className="text-xs text-cold-muted">
              {liveData?.humidity !== undefined
                ? `${liveData.humidity.toFixed(0)}% RH`
                : 'Updated from telemetry stream'}
            </p>
          }
        />
      </div>

      <div className="mt-10 grid grid-cols-1 lg:grid-cols-[3fr,2fr] gap-6">
        <MapTracker points={gpsHistory} />
        <LiveChart data={tempHistory} />
      </div>

      <div className="mt-10">
        <AuditTimeline records={auditRecords} logCount={logCount} />
      </div>
    </div>
  )
}
