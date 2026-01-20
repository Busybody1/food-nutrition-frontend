'use client'

import { useState, useEffect, useCallback } from 'react'
import { UsageChart } from '@/components/dashboard/UsageChart'
import { useAuth } from '@/lib/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading usage data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Usage Analytics</h1>
            <p className="text-gray-600">
              Monitor your API usage, performance, and quota consumption
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex space-x-2">
              <Button
                variant={timeRange === '7d' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange('7d')}
              >
                7 Days
              </Button>
              <Button
                variant={timeRange === '30d' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange('30d')}
              >
                30 Days
              </Button>
              <Button
                variant={timeRange === '90d' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange('90d')}
              >
                90 Days
              </Button>
            </div>
            <Button
              variant="outline"
              onClick={loadUsageData}
              disabled={isLoading}
              className="flex items-center"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? 'Exporting...' : 'Export'}
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {usageStats && (
          <UsageChart
            data={usageData}
            endpointData={endpointData}
            currentUsage={usageStats.requests_this_month}
            quota={usageStats.monthly_quota}
            planName={usageStats.plan_name}
          />
        )}

        {/* Additional Stats Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  <span className="text-sm text-gray-600">Start Date</span>
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
      </div>
    </div>
  )
}
