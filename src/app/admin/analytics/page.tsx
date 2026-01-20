'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  BarChart3,
  Users, Activity, Zap, Clock, Database, Globe, RefreshCw
} from 'lucide-react'

import { apiClient } from '@/lib/api/client'

interface AnalyticsData {
  time_range: string
  total_users: number
  active_users: number
  total_requests: number
  avg_response_time_ms: number
  error_rate_percent: number
  top_endpoints: Array<{
    endpoint: string
    request_count: number
    avg_response_time: number
    error_count: number
  }>
  top_users: Array<{
    email: string
    first_name: string
    last_name: string
    request_count: number
    avg_response_time: number
  }>
  daily_usage: Array<{
    date: string
    requests: number
    errors: number
    avg_response_time: number
    active_users: number
  }>
}

export default function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('7d')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const loadAnalyticsData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError('')
      
      const response = await apiClient.get<AnalyticsData>('/api/v1/admin/analytics', {
        time_range: timeRange
      })
      
      setAnalyticsData(response.data)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Failed to load analytics data:', error)
      setError(error instanceof Error ? error.message : 'Failed to load analytics data')
    } finally {
      setIsLoading(false)
    }
  }, [timeRange])

  useEffect(() => {
    loadAnalyticsData()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadAnalyticsData, 30000)
    return () => clearInterval(interval)
  }, [loadAnalyticsData])

  // Simple chart component for daily usage
  const SimpleChart = ({ data }: { data: AnalyticsData['daily_usage'] }) => {
    if (!data || data.length === 0) return null
    
    const maxRequests = Math.max(...data.map(d => d.requests))
    
    return (
      <div className="h-80 flex items-end space-x-1 p-4">
        {data.map((day, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div
              className="bg-blue-500 w-full rounded-t"
              style={{ 
                height: `${(day.requests / maxRequests) * 200}px`,
                minHeight: '4px'
              }}
              title={`${day.date}: ${day.requests} requests`}
            />
            <div className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-left">
              {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-600 mb-2">Error loading analytics data</div>
          <div className="text-sm text-gray-600">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Usage Analytics</h1>
          <p className="text-gray-600 mt-2">
            Monitor API usage, user activity, and system performance
            {lastUpdated && (
              <span className="text-sm text-gray-500 ml-2">
                • Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={loadAnalyticsData}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <div className="flex items-center space-x-2">
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
            <Button
              variant={timeRange === '1y' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('1y')}
            >
              1 Year
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData?.total_requests.toLocaleString() || '0'}
                </p>
                <p className="text-sm text-gray-600">
                  Last {timeRange}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData?.active_users.toLocaleString() || '0'}
                </p>
                <p className="text-sm text-gray-600">
                  {analyticsData?.total_users.toLocaleString() || '0'} total users
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData?.avg_response_time_ms.toFixed(1) || '0'}ms
                </p>
                <p className="text-sm text-gray-600">
                  Average latency
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <Zap className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Error Rate</p>
                <p className="text-2xl font-bold text-gray-900">        
                  {(analyticsData?.error_rate_percent || 0).toFixed(2)}%        
                </p>
                <p className="text-sm text-gray-600">
                  {(analyticsData?.error_rate_percent || 0) < 5 ? 'Excellent' : 'Needs attention'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Usage Trends</CardTitle>
        </CardHeader>
        <CardContent>
          {analyticsData?.daily_usage && analyticsData.daily_usage.length > 0 ? (
            <SimpleChart data={analyticsData.daily_usage} />
          ) : (
            <div className="h-80 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No data available</p>
                <p className="text-sm text-gray-400">
                  Usage data will appear here once API requests are made
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Endpoints and Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Endpoints */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="w-5 h-5 mr-2" />
              Top Endpoints
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData?.top_endpoints && analyticsData.top_endpoints.length > 0 ? (
                analyticsData.top_endpoints.map((endpoint, index) => {
                  const maxRequests = Math.max(...analyticsData.top_endpoints.map(e => e.request_count))
                  const percentage = (endpoint.request_count / maxRequests) * 100
                  
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{endpoint.endpoint}</p>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="ml-4 text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {endpoint.request_count.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {endpoint.avg_response_time.toFixed(1)}ms avg
                        </p>
                      </div>
                    </div>
                  )
                })
              ) : (
                <p className="text-gray-500 text-center py-4">No endpoint data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Top Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData?.top_users && analyticsData.top_users.length > 0 ? (
                analyticsData.top_users.map((user, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <div className="ml-4 text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {user.request_count.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">requests</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No user data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Geographic Distribution Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="w-5 h-5 mr-2" />
            Geographic Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Globe className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Geographic distribution chart</p>
              <p className="text-sm text-gray-400">Integration with analytics service</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
