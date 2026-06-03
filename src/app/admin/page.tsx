'use client'

import { useState, useEffect } from 'react'
import { useAdmin } from '@/lib/hooks/use-admin'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { UnauthorizedErrorMessage } from '@/components/ui/error-message'
import { 
  Users, Activity, TrendingUp, AlertTriangle,
  Database, Clock, Zap
} from 'lucide-react'
import Link from 'next/link'
import { AdminDualLineChart } from '@/components/admin/admin-charts'
import {
  AdminPage,
  AdminPageHeader,
  AdminStatGrid,
  DashboardStatCard,
  AdminPanel,
  AdminPanelHeader,
  AdminPanelBody,
  AdminTimeRangeToggle,
  AdminActivityFeed,
  AdminRefreshButton,
  AdminSkeletonStats,
  DashboardAlert,
  DashboardEmpty,
  DashboardQuickAction,
} from '@/components/admin/admin-ui'

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

function AdminDashboard() {
  const { user, isSuperAdmin, hasPermission } = useAdmin()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '1y'>('7d')

  useEffect(() => {
    loadDashboardData(timeRange)
  }, [timeRange])

  const handleTimeRangeChange = (newTimeRange: '7d' | '30d' | '1y') => {
    setTimeRange(newTimeRange)
  }

  const loadDashboardData = async (range: '7d' | '30d' | '1y' = '7d') => {
    setIsLoading(true)
    setError(null)
    try {
      const { apiClient } = await import('@/lib/api/client')

      const { adminAPI } = await import('@/lib/api/admin')
      const [analyticsResult, metricsResult, auditResult, requestsResult, systemMetricsResponse] =
        await Promise.allSettled([
          adminAPI.getAnalytics(range === '1y' ? '1y' : range === '30d' ? '30d' : '7d'),
          adminAPI.getSystemMetrics(),
          adminAPI.getAuditLog({ limit: 8 }),
          adminAPI.getApiRequests({ limit: 8 }),
          apiClient.get('/api/v1/admin/environment'),
        ])
      
      if (analyticsResult.status === 'rejected') {
        const reason = analyticsResult.reason
        const message =
          reason instanceof Error ? reason.message : 'Failed to load analytics'
        setError(message)
      }

      const analyticsDataTyped =
        analyticsResult.status === 'fulfilled'
          ? (analyticsResult.value as AnalyticsData)
          : null
      const metricsTyped =
        metricsResult.status === 'fulfilled' ? metricsResult.value : null
      const systemMetricsTyped =
        systemMetricsResponse.status === 'fulfilled'
          ? (systemMetricsResponse.value.data as SystemMetricsData)
          : undefined

      const dashboardStats: DashboardStats = {
        totalUsers: analyticsDataTyped?.total_users ?? 0,
        activeUsers: analyticsDataTyped?.active_users ?? 0,
        totalRequests: analyticsDataTyped?.total_requests ?? 0,
        requestsToday: systemMetricsTyped?.requestsToday ?? 0,
        requestsThisMonth: analyticsDataTyped?.total_requests ?? 0,
        revenue: metricsTyped?.revenue ?? 0,
        revenueGrowth: metricsTyped?.revenueGrowth ?? 0,
        averageResponseTime: metricsTyped?.averageResponseTime ?? analyticsDataTyped?.avg_response_time_ms ?? 0,
        errorRate:
          metricsTyped?.errorRate ??
          systemMetricsTyped?.errorRateToday ??
          analyticsDataTyped?.error_rate_percent ??
          0,
        systemUptime: metricsTyped?.systemUptime ?? 99.9,
        timeRange: range,
        dailyUsageData: analyticsDataTyped?.daily_usage ?? [],
        systemMetrics: systemMetricsTyped,
      }

      const activity: RecentActivity[] = []
      if (auditResult.status === 'fulfilled') {
        for (const e of auditResult.value.entries) {
          activity.push({
            id: `audit-${e.id}`,
            type: 'api_usage',
            message: `${e.action} on ${e.target_type || 'system'}${e.target_id ? ` #${e.target_id}` : ''}`,
            timestamp: e.created_at,
            severity: 'info',
          })
        }
      }
      if (requestsResult.status === 'fulfilled') {
        for (const r of requestsResult.value.requests) {
          activity.push({
            id: `req-${r.id}`,
            type: r.status_code >= 400 ? 'error_occurred' : 'api_usage',
            message: `${r.method} ${r.endpoint} (${r.status_code})`,
            timestamp: r.created_at,
            severity: r.status_code >= 500 ? 'error' : r.status_code >= 400 ? 'warning' : 'info',
          })
        }
      }
      activity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

      setStats(dashboardStats)
      setRecentActivity(activity.slice(0, 12))
    } catch (err) {
      console.error('Failed to load dashboard data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
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

  const chartData =
    stats?.dailyUsageData?.map((d) => ({
      date: new Date(d.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
      requests: d.requests,
      errors: d.errors,
    })) ?? []

  const activityItems = recentActivity.map((a) => ({
    id: a.id,
    message: a.message,
    timestamp: a.timestamp,
    severity: a.severity,
    icon: getActivityIcon(a.type),
  }))

  return (
    <AdminPage>
      <AdminPageHeader
        title={`Welcome${user?.first_name ? `, ${user.first_name}` : ''}`}
        description={`Platform health and API usage for the last ${
          timeRange === '7d' ? '7 days' : timeRange === '30d' ? '30 days' : 'year'
        }.`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-violet-100 text-violet-800 border-violet-200/80">Admin</Badge>
            {isSuperAdmin && <Badge variant="secondary">Super admin</Badge>}
            <AdminTimeRangeToggle
              value={timeRange}
              options={[
                { value: '7d' as const, label: '7 days' },
                { value: '30d' as const, label: '30 days' },
                { value: '1y' as const, label: '1 year' },
              ]}
              onChange={handleTimeRangeChange}
            />
            <AdminRefreshButton onClick={() => loadDashboardData(timeRange)} loading={isLoading} />
          </div>
        }
      />

      {error && (
        <DashboardAlert variant="warning">
          {error}
          <Button variant="outline" size="sm" className="ml-3" onClick={() => loadDashboardData(timeRange)}>
            Retry
          </Button>
        </DashboardAlert>
      )}

      {isLoading && !stats ? (
        <AdminSkeletonStats />
      ) : (
        <>
          <AdminStatGrid className="mb-6">
            <DashboardStatCard
              label="Total users"
              value={stats?.totalUsers.toLocaleString() ?? '—'}
              hint={`${stats?.activeUsers ?? 0} active in period`}
              icon={Users}
              accent="brand"
            />
            <DashboardStatCard
              label="API requests"
              value={stats?.totalRequests.toLocaleString() ?? '—'}
              hint={`${stats?.requestsToday ?? 0} today`}
              icon={Activity}
              accent="green"
            />
            <DashboardStatCard
              label="Avg response"
              value={
                stats?.averageResponseTime != null
                  ? `${Math.round(stats.averageResponseTime)}ms`
                  : '—'
              }
              hint={`Error rate ${stats?.errorRate?.toFixed(2) ?? '0'}%`}
              icon={Zap}
              accent="purple"
            />
            <DashboardStatCard
              label="Revenue (MTD)"
              value={stats?.revenue != null ? `$${stats.revenue.toLocaleString()}` : '—'}
              hint={
                stats?.revenueGrowth != null
                  ? `${stats.revenueGrowth >= 0 ? '+' : ''}${stats.revenueGrowth}% vs last month`
                  : undefined
              }
              icon={TrendingUp}
              accent="orange"
            />
          </AdminStatGrid>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <AdminPanel>
              <AdminPanelHeader title="API usage trends" icon={TrendingUp} />
              <AdminPanelBody>
                {chartData.length > 0 ? (
                  <AdminDualLineChart
                    data={chartData}
                    xKey="date"
                    lines={[
                      { key: 'requests', name: 'Requests', color: '#7c3aed' },
                      { key: 'errors', name: 'Errors', color: '#EF4444' },
                    ]}
                  />
                ) : (
                  <DashboardEmpty
                    icon={Database}
                    title="No usage data yet"
                    description="Charts populate as developers call the API."
                  />
                )}
              </AdminPanelBody>
            </AdminPanel>

            <AdminPanel>
              <AdminPanelHeader
                title="Recent activity"
                icon={Activity}
                actions={
                  hasPermission('admin:analytics:view') ? (
                    <Link href="/admin/requests">
                      <Button variant="outline" size="sm">
                        View log
                      </Button>
                    </Link>
                  ) : undefined
                }
              />
              <AdminPanelBody>
                <AdminActivityFeed items={activityItems} />
              </AdminPanelBody>
            </AdminPanel>
          </div>

          {stats?.systemMetrics && (
            <AdminPanel className="mb-6">
              <AdminPanelHeader title="System information" icon={Database} />
              <AdminPanelBody>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-ink-dim">Runtime</h4>
                    <p className="text-ink-muted">Python {stats.systemMetrics.nodeVersion}</p>
                    <p className="text-ink-muted truncate">{stats.systemMetrics.databaseVersion}</p>
                    <p className="text-ink-muted">Redis {stats.systemMetrics.redisVersion}</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-ink-dim">Performance</h4>
                    <p className="text-ink-muted">CPU {stats.systemMetrics.systemLoad}%</p>
                    <p className="text-ink-muted">Memory {stats.systemMetrics.memoryUsage}</p>
                    <p className="text-ink-muted">Uptime {stats.systemMetrics.uptime}</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-ink-dim">Activity</h4>
                    <p className="text-ink-muted">{stats.systemMetrics.activeSubscriptions} subscriptions</p>
                    <p className="text-ink-muted">{stats.systemMetrics.requestsToday} requests today</p>
                    <p className="text-ink-muted">{stats.systemMetrics.errorRateToday}% errors today</p>
                  </div>
                </div>
              </AdminPanelBody>
            </AdminPanel>
          )}

          <AdminPanel>
            <AdminPanelHeader title="Quick actions" />
            <AdminPanelBody className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 !p-4">
              {hasPermission('admin:users:view') && (
                <DashboardQuickAction href="/admin/users" icon={Users} title="Manage users" description="Accounts, plans, API keys" primary />
              )}
              {hasPermission('admin:analytics:view') && (
                <DashboardQuickAction href="/admin/analytics" icon={TrendingUp} title="Analytics" description="Endpoints, latency, errors" />
              )}
              {hasPermission('admin:monitoring:view') && (
                <DashboardQuickAction href="/admin/monitoring" icon={Activity} title="Monitoring" description="Services and alerts" />
              )}
              {hasPermission('admin:settings:view') && (
                <DashboardQuickAction href="/admin/settings" icon={Clock} title="Settings" description="Maintenance and feature flags" />
              )}
            </AdminPanelBody>
          </AdminPanel>
        </>
      )}
    </AdminPage>
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