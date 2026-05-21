'use client'

import { useState, useEffect, useCallback } from 'react'
import { UsageChart } from '@/components/dashboard/UsageChart'
import { useAuth } from '@/lib/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DashboardPage,
  DashboardPageHeader,
  DashboardLoading,
  DashboardAlert,
} from '@/components/dashboard/dashboard-shell'
import { RefreshCw, Calendar, Download } from 'lucide-react'

interface UsageData {
  date: string
  requests: number
  errors: number
  avgResponseTime: number
}

interface EndpointUsage {
  endpoint: string
  request_count: number
  avg_response_time: number
  error_count: number
}

interface UsageStats {
  requests_this_month: number
  monthly_quota: number
  rate_limit_per_minute: number
  plan_name: string
  remaining_requests: number
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
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d')

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isAuthenticated, loading, router])

  const loadUsageData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError('')

      // Import API client
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
      } else {
        console.warn('Failed to load endpoint data:', endpointResponse.message)
      }

      if (statsResponse.success) {
        setUsageStats(statsResponse.data as UsageStats)
      } else {
        console.warn('Failed to load usage stats:', statsResponse.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load usage data')
    } finally {
      setIsLoading(false)
    }
  }, [timeRange])

  // Load usage data
  useEffect(() => {
    if (!loading && isAuthenticated) {
      loadUsageData()
    }
  }, [isAuthenticated, loading, timeRange, loadUsageData])

  const handleExport = async () => {
    try {
      setIsExporting(true)
      
      // Import API client
      const { api } = await import('@/lib/api/client')
      
      const response = await api.usage.exportUsageData(timeRange)
      
      if (response.success) {
        // Create download link for the exported data
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
    return <DashboardLoading message="Loading usage analytics..." />
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <DashboardPage>
        <DashboardPageHeader
          title="Usage analytics"
          description="Track requests, errors, and quota consumption over time."
        >
          <div className="inline-flex rounded-brand border border-surface-border bg-white p-0.5">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTimeRange(range)}
                className="rounded-[10px] h-8 px-3"
              >
                {range === '7d' ? '7d' : range === '30d' ? '30d' : '90d'}
              </Button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={loadUsageData} disabled={isLoading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} disabled={isExporting} className="gap-2">
            <Download className="h-4 w-4" />
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>
        </DashboardPageHeader>

        {error && <DashboardAlert variant="error">{error}</DashboardAlert>}

        {usageStats && (
          <UsageChart
            data={usageData}
            endpointData={endpointData}
            currentUsage={usageStats.requests_this_month}
            quota={usageStats.monthly_quota}
            planName={usageStats.plan_name}
          />
        )}

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Current Period
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-ink-muted">Start Date</span>
                  <span className="text-sm font-medium">
                    {new Date().toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">End Date</span>
                  <span className="text-sm font-medium">
                    {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
                      .toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Days Remaining</span>
                  <span className="text-sm font-medium">
                    {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rate Limits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Per Minute</span>
                  <span className="text-sm font-medium">
                    {usageStats?.rate_limit_per_minute || 0} requests
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Per Hour</span>
                  <span className="text-sm font-medium">
                    {(usageStats?.rate_limit_per_minute || 0) * 60} requests
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Per Day</span>
                  <span className="text-sm font-medium">
                    {(usageStats?.rate_limit_per_minute || 0) * 60 * 24} requests
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Avg Response Time</span>
                  <span className="text-sm font-medium">
                    {usageData.length > 0 
                      ? Math.round(usageData.reduce((sum, d) => sum + d.avgResponseTime, 0) / usageData.length)
                      : 0}ms
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Error Rate</span>
                  <span className="text-sm font-medium">
                    {usageData.length > 0 
                      ? ((usageData.reduce((sum, d) => sum + d.errors, 0) / usageData.reduce((sum, d) => sum + d.requests, 0)) * 100).toFixed(2)
                      : 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Uptime</span>
                  <span className="text-sm font-medium text-green-600">99.9%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
    </DashboardPage>
  )
}
