'use client'

import { useState, useEffect } from 'react'
import { useAdmin } from '@/lib/hooks/use-admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { UnauthorizedErrorMessage } from '@/components/ui/error-message'
import { 
  Users, Activity, TrendingUp, AlertTriangle, 
  Database, Clock, DollarSign, Zap
} from 'lucide-react'
import Link from 'next/link'

interface DashboardStats {
  totalUsers: number
  activeUsers: number
  totalRequests: number
  requestsToday: number
  requestsThisMonth: number
  revenue: number
  revenueGrowth: number
  averageResponseTime: number
  errorRate: number
  systemUptime: number
  timeRange?: '7d' | '30d' | '1y'
  dailyUsageData?: Array<{
    date: string
    requests: number
    errors: number
    avg_response_time: number
    active_users: number
  }>
  systemMetrics?: {
    nodeVersion: string
    databaseVersion: string
    redisVersion: string
    uptime: string
    memoryUsage: string
    diskUsage: string
    activeSubscriptions: number
    requestsToday: number
    errorRateToday: number
    systemLoad: number
  }
}

interface AnalyticsData {
  total_users: number
  active_users: number
  total_requests: number
  avg_response_time_ms: number
  error_rate_percent: number
  daily_usage: Array<{
    date: string
    requests: number
    errors: number
    avg_response_time: number
    active_users: number
  }>
}

interface SystemMetricsData {
  nodeVersion: string
  databaseVersion: string
  redisVersion: string
  uptime: string
  memoryUsage: string
  diskUsage: string
  activeSubscriptions: number
  requestsToday: number
  errorRateToday: number
  systemLoad: number
}

interface RecentActivity {
  id: string
  type: 'user_registered' | 'user_upgraded' | 'api_usage' | 'error_occurred'
  message: string
  timestamp: string
  severity: 'info' | 'warning' | 'error'
}

// Usage Chart Component
const UsageChart = ({ data }: { data: DashboardStats['dailyUsageData'] }) => {
  if (!data || data.length === 0) return null
  
  const maxRequests = Math.max(...data.map(d => d.requests))
  const maxErrors = Math.max(...data.map(d => d.errors))
  
  return (
    <div className="h-64 space-y-4">
      {/* Chart */}
      <div className="h-48 flex items-end space-x-1 p-4 bg-gray-50 rounded-lg">
        {data.map((day, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div className="flex flex-col items-end space-y-1 w-full">
              {/* Requests bar */}
              <div
                className="bg-blue-500 w-full rounded-t"
                style={{ 
                  height: `${(day.requests / maxRequests) * 120}px`,
                  minHeight: '2px'
                }}
                title={`${day.date}: ${day.requests} requests`}
              />
              {/* Errors bar */}
              {day.errors > 0 && (
                <div
                  className="bg-red-500 w-full rounded-b"
                  style={{ 
                    height: `${(day.errors / maxErrors) * 40}px`,
                    minHeight: '1px'
                  }}
                  title={`${day.date}: ${day.errors} errors`}
                />
              )}
            </div>
            <div className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-left">
              {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
          </div>
        ))}
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span className="text-gray-600">Requests</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span className="text-gray-600">Errors</span>
        </div>
      </div>
    </div>
  )
}

function AdminDashboard() {
  const { user, isSuperAdmin, hasPermission } = useAdmin()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData(stats?.timeRange || '7d')
  }, [stats?.timeRange])

  const handleTimeRangeChange = (newTimeRange: '7d' | '30d' | '1y') => {
    setStats(prev => prev ? { ...prev, timeRange: newTimeRange } : null)
  }

  const loadDashboardData = async (timeRange: '7d' | '30d' | '1y' = '7d') => {
    try {
      // Import API client
      const { apiClient } = await import('@/lib/api/client')
      
      // Load analytics data and system metrics in parallel
      const [analyticsResponse, systemMetricsResponse] = await Promise.all([
        apiClient.get('/api/v1/admin/analytics', { time_range: timeRange }),
        apiClient.get('/api/v1/admin/environment')
      ])
      
      const analyticsData = analyticsResponse.data
      const systemMetrics = systemMetricsResponse.data
      
      // Transform API data to dashboard stats
      const analyticsDataTyped = analyticsData as AnalyticsData
      const systemMetricsTyped = systemMetrics as SystemMetricsData
      const dashboardStats: DashboardStats = {
        totalUsers: analyticsDataTyped.total_users || 0,
        activeUsers: analyticsDataTyped.active_users || 0,
        totalRequests: analyticsDataTyped.total_requests || 0,
        requestsToday: systemMetricsTyped.requestsToday || 0,
        requestsThisMonth: analyticsDataTyped.total_requests || 0, // Using total for now
        revenue: 0, // Revenue data not available in analytics
        revenueGrowth: 0, // Revenue growth not available in analytics
        averageResponseTime: analyticsDataTyped.avg_response_time_ms || 0,
        errorRate: systemMetricsTyped.errorRateToday || analyticsDataTyped.error_rate_percent || 0,
        systemUptime: 99.9, // Calculate from uptime string if needed
        timeRange: timeRange,
        dailyUsageData: analyticsDataTyped.daily_usage || [],
        systemMetrics: systemMetricsTyped
      }

      // Load recent activity (mock data for now)
      const recentActivity: RecentActivity[] = [
        {
          id: '1',
          type: 'user_registered',
          message: 'New user registered',
          timestamp: new Date().toISOString(),
          severity: 'info'
        },
        {
          id: '2',
          type: 'api_usage',
          message: 'High API usage detected',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          severity: 'warning'
        }
      ]

      setStats(dashboardStats)
      setRecentActivity(recentActivity)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registered':
        return Users
      case 'user_upgraded':
        return TrendingUp
      case 'api_usage':
        return Activity
      case 'error_occurred':
        return AlertTriangle
      default:
        return Activity
    }
  }

  const getActivityColor = (severity: string) => {
    switch (severity) {
      case 'info':
        return 'text-blue-600 bg-blue-100'
      case 'warning':
        return 'text-yellow-600 bg-yellow-100'
      case 'error':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back, {user?.first_name}! Monitor system performance, user activity, and business metrics.
        </p>
        <div className="flex items-center space-x-2 mt-2">
          <Badge className="bg-blue-100 text-blue-800">
            Admin
          </Badge>
          {isSuperAdmin && (
            <Badge className="bg-purple-100 text-purple-800">
              Super Admin
            </Badge>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers.toLocaleString()}</p>
                <p className="text-sm text-green-600">
                  +{stats?.activeUsers} active
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Requests Today</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.requestsToday.toLocaleString()}</p>
                <p className="text-sm text-gray-600">
                  {stats?.requestsThisMonth.toLocaleString()} this month
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${stats?.revenue.toLocaleString()}</p>
                <p className="text-sm text-green-600">
                  +{stats?.revenueGrowth}% from last month
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Zap className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">System Health</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.systemMetrics?.systemLoad || 0}% CPU
                </p>
                <p className="text-sm text-gray-600">
                  {stats?.systemMetrics?.uptime || 'Unknown uptime'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Memory: {stats?.systemMetrics?.memoryUsage || 'Unknown'} | 
                  Disk: {stats?.systemMetrics?.diskUsage || 'Unknown'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usage Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                API Usage Trends
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant={stats?.timeRange === '7d' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => handleTimeRangeChange('7d')}
                >
                  7D
                </Button>
                <Button 
                  variant={stats?.timeRange === '30d' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => handleTimeRangeChange('30d')}
                >
                  30D
                </Button>
                <Button 
                  variant={stats?.timeRange === '1y' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => handleTimeRangeChange('1y')}
                >
                  1Y
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.dailyUsageData && stats.dailyUsageData.length > 0 ? (
              <UsageChart data={stats.dailyUsageData} />
            ) : (
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Database className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No usage data available</p>
                  <p className="text-sm text-gray-400">Data will appear as API calls are made</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Recent Activity
              </div>
              {hasPermission('admin:analytics:view') && (
                <Link href="/admin/analytics">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => {
                const Icon = getActivityIcon(activity.type)
                return (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${getActivityColor(activity.severity)}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Information */}
      {stats?.systemMetrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="w-5 h-5 mr-2" />
              System Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Runtime</h4>
                <p className="text-sm text-gray-600">Python: {stats.systemMetrics.nodeVersion}</p>
                <p className="text-sm text-gray-600">Database: {stats.systemMetrics.databaseVersion}</p>
                <p className="text-sm text-gray-600">Redis: {stats.systemMetrics.redisVersion}</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Performance</h4>
                <p className="text-sm text-gray-600">CPU Load: {stats.systemMetrics.systemLoad}%</p>
                <p className="text-sm text-gray-600">Memory: {stats.systemMetrics.memoryUsage}</p>
                <p className="text-sm text-gray-600">Disk: {stats.systemMetrics.diskUsage}</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Activity</h4>
                <p className="text-sm text-gray-600">Active Subscriptions: {stats.systemMetrics.activeSubscriptions}</p>
                <p className="text-sm text-gray-600">Requests Today: {stats.systemMetrics.requestsToday}</p>
                <p className="text-sm text-gray-600">Error Rate: {stats.systemMetrics.errorRateToday}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {hasPermission('admin:users:view') && (
              <Link href="/admin/users">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  Manage Users
                </Button>
              </Link>
            )}
            {hasPermission('admin:analytics:view') && (
              <Link href="/admin/analytics">
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
              </Link>
            )}
            {hasPermission('admin:settings:view') && (
              <Link href="/admin/settings">
                <Button variant="outline" className="w-full justify-start">
                  <Clock className="w-4 h-4 mr-2" />
                  System Settings
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Admin Dashboard with Error Boundary
function AdminDashboardContent() {
  return <AdminDashboard />
}

export default function AdminDashboardPage() {
  return (
    <ErrorBoundary fallback={<UnauthorizedErrorMessage />}>
      <AdminDashboardContent />
    </ErrorBoundary>
  )
}