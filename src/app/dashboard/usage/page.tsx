'use client'

import { useState, useEffect, useCallback } from 'react'
import { UsageTrendCards, EndpointUsageTable } from '@/components/dashboard/UsageChart'
import type { UsageData, EndpointUsage } from '@/components/dashboard/UsageChart'
import { useAuth } from '@/lib/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DashboardPage,
  DashboardPageHeader,
  DashboardPageSkeleton,
  DashboardAlert,
  DashboardSegmented,
  DashboardStatCard,
  DASHBOARD_ICON_STROKE,
} from '@/components/dashboard/dashboard-shell'
import { Activity, Download, Gauge, RefreshCw, Zap } from 'lucide-react'

interface UsageStats {
  requests_this_month: number
  monthly_quota: number
  rate_limit_per_minute: number
  plan_name: string
  remaining_requests: number
}

type TimeRange = '7d' | '30d' | '90d'

const RANGE_LABELS: Record<TimeRange, string> = {
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
}

export default function UsagePage() {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const [usageData, setUsageData] = useState<UsageData[]>([])
  const [endpointData, setEndpointData] = useState<EndpointUsage[]>([])
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [error, setError] = useState('')
  const [timeRange, setTimeRange] = useState<TimeRange>('7d')

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isAuthenticated, loading, router])

  const loadUsageData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError('')

      const { api } = await import('@/lib/api/client')

      const [usageResponse, endpointResponse, statsResponse] = await Promise.all([
        api.usage.getUsageData(timeRange),
        api.usage.getEndpointUsage(timeRange),
        api.usage.getUsageStats()
      ])

      if (usageResponse.success) {
        setUsageData(usageResponse.data as UsageData[])
      } else {
        throw new Error(`Usage Data: ${usageResponse.message || 'Failed to load usage data'}`)
      }

      if (endpointResponse.success) {
        setEndpointData(endpointResponse.data as EndpointUsage[])
      }

      if (statsResponse.success) {
        setUsageStats(statsResponse.data as UsageStats)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load usage data')
    } finally {
      setIsLoading(false)
    }
  }, [timeRange])

  useEffect(() => {
    if (!loading && isAuthenticated) {
      /* eslint-disable-next-line react-hooks/set-state-in-effect */
      loadUsageData()
    }
  }, [isAuthenticated, loading, timeRange, loadUsageData])

  const handleExport = async () => {
    try {
      setIsExporting(true)

      const { api } = await import('@/lib/api/client')

      const response = await api.usage.exportUsageData(timeRange)

      if (response.success) {

        const blob = new Blob([response.data as BlobPart], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `usage-data-${timeRange}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      } else {
        throw new Error(response.message || 'Export failed')
      }
    } catch (err) {
      console.error('Export failed:', err)
      setError(err instanceof Error ? err.message : 'Export failed')
    } finally {
      setIsExporting(false)
    }
  }

  if (loading || isLoading) {
    return <DashboardPageSkeleton kpis={3} label="Loading usage analytics..." />
  }

  if (!isAuthenticated) {
    return null
  }

  const now = new Date()
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const periodEndLabel = periodEnd.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
  const daysRemaining = periodEnd.getDate() - now.getDate()

  const quota = usageStats?.monthly_quota ?? 0
  const current = usageStats?.requests_this_month ?? 0
  const usagePercentage = quota > 0 ? (current / quota) * 100 : 0
  const rateLimit = usageStats?.rate_limit_per_minute || 0

  return (
    <DashboardPage>
      <DashboardPageHeader
        title="Usage analytics"
        description="Track requests, errors, and quota consumption over time."
        meta={
          usageStats?.plan_name ? (
            <span className="dashboard-meta-pill" title="Current plan">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
              {usageStats.plan_name}
              <span className="text-dash-dim" aria-hidden>
                ·
              </span>
              <span className="text-dash-muted">Active</span>
            </span>
          ) : undefined
        }
      >
        <DashboardSegmented
          value={timeRange}
          onChange={setTimeRange}
          ariaLabel="Time range"
          options={[
            { value: '7d', label: '7d' },
            { value: '30d', label: '30d' },
            { value: '90d', label: '90d' },
          ]}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={loadUsageData}
          disabled={isLoading}
          className="h-9 gap-1.5"
        >
          <RefreshCw
            className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
            strokeWidth={DASHBOARD_ICON_STROKE}
          />
          Refresh
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          disabled={isExporting}
          className="h-9 gap-1.5"
        >
          <Download className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} />
          {isExporting ? 'Exporting...' : 'Export'}
        </Button>
      </DashboardPageHeader>

      {error && <DashboardAlert variant="error">{error}</DashboardAlert>}

      <div className="dashboard-grid-kpi">
        <DashboardStatCard
          label="Requests this month"
          value={usageStats ? current.toLocaleString() : null}
          hint={
            usageStats
              ? `${Math.round(usagePercentage)}% of ${quota.toLocaleString()} monthly quota`
              : undefined
          }
          icon={Activity}
          accent="brand"
        />
        <DashboardStatCard
          label="Remaining"
          value={usageStats ? Math.max(0, quota - current).toLocaleString() : null}
          hint={`Period ends ${periodEndLabel} · ${daysRemaining} days left`}
          icon={Gauge}
          accent="indigo"
        />
        <DashboardStatCard
          label="Rate limit"
          value={usageStats ? `${rateLimit.toLocaleString()}/min` : null}
          hint={
            usageStats
              ? `${(rateLimit * 60).toLocaleString()}/hour · ${(rateLimit * 60 * 24).toLocaleString()}/day`
              : undefined
          }
          icon={Zap}
          accent="orange"
        />
      </div>

      <UsageTrendCards data={usageData} rangeLabel={RANGE_LABELS[timeRange]} />

      <EndpointUsageTable endpointData={endpointData} />
    </DashboardPage>
  )
}
