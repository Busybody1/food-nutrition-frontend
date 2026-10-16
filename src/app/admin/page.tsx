'use client'

import { useState, useEffect } from 'react'
import { useAdmin } from '@/lib/hooks/use-admin'
import { Button } from '@/components/ui/button'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { UnauthorizedErrorMessage } from '@/components/ui/error-message'
import {
  Users, Activity, TrendingUp, AlertTriangle,
  Database, Clock, Zap, PieChart, Server, ListChecks,
} from 'lucide-react'
import Link from 'next/link'
import {
  AreaTrendChart,
  BarTrendChart,
  DonutChart,
} from '@/components/admin/admin-charts'
import {
  AdminPage,
  AdminPageHeader,
  AdminStatGrid,
  DashboardStatCard,
  AdminPanel,
  AdminPanelHeader,
  AdminPanelBody,
  AdminTimeRangeToggle,
  AdminRefreshButton,
  AdminSkeletonStats,
  AdminTable,
  AdminTableWrap,
  DashboardAlert,
  DashboardEmpty,
  DashboardQuickAction,
  DashboardPill,
  DashboardSkeleton,
  DashboardStatList,
  DeltaPill,
  DASHBOARD_ICON_STROKE,
} from '@/components/admin/admin-ui'
import { formatAuditTarget } from '@/lib/api/admin'
import type { AdminAnalytics } from '@/lib/api/admin'
import { cn } from '@/lib/utils/cn'

type TimeRange = '7d' | '30d' | '1y'

interface DailyUsagePoint {
  date: string
  requests: number
  errors: number
  avg_response_time: number
  active_users: number
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

interface DashboardStats {
  totalUsers: number | null
  activeUsers: number | null
  totalRequests: number | null
  requestsToday: number | null
  revenue: number | null
  revenueGrowth: number | null
  averageResponseTime: number | null
  errorRate: number | null
  systemUptime: number | null
  dailyUsageData: DailyUsagePoint[]
  statusMix: Array<{ status_code: number; count: number }>
  systemMetrics?: SystemMetricsData
}

interface RecentActivity {
  id: string
  type: 'user_registered' | 'user_upgraded' | 'api_usage' | 'error_occurred'
  message: string
  timestamp: string
  severity: 'info' | 'warning' | 'error'
}

function finiteOrNull(...values: unknown[]): number | null {
  for (const value of values) {
    if (value == null || value === '') continue
    const n = typeof value === 'number' ? value : Number(value)
    if (Number.isFinite(n)) return n
  }
  return null
}

function countOrDash(value: number | null): string | null {
  return value == null ? null : value.toLocaleString()
}

function AdminDashboard() {
  const { user, isSuperAdmin, hasPermission } = useAdmin()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<TimeRange>('7d')

  const handleTimeRangeChange = (newTimeRange: TimeRange) => {
    setTimeRange(newTimeRange)
  }

  const loadDashboardData = async (range: TimeRange = '7d') => {
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
          ? (analyticsResult.value as AdminAnalytics)
          : null
      const metricsTyped =
        metricsResult.status === 'fulfilled' ? metricsResult.value : null
      const systemMetricsTyped =
        systemMetricsResponse.status === 'fulfilled'
          ? (systemMetricsResponse.value.data as SystemMetricsData | undefined)
          : undefined

      const dashboardStats: DashboardStats = {
        totalUsers: finiteOrNull(analyticsDataTyped?.total_users),
        activeUsers: finiteOrNull(analyticsDataTyped?.active_users),
        totalRequests: finiteOrNull(analyticsDataTyped?.total_requests),
        requestsToday: finiteOrNull(systemMetricsTyped?.requestsToday),
        revenue: finiteOrNull(metricsTyped?.revenue),
        revenueGrowth: finiteOrNull(metricsTyped?.revenueGrowth),
        averageResponseTime: finiteOrNull(
          metricsTyped?.averageResponseTime,
          analyticsDataTyped?.avg_response_time_ms
        ),
        errorRate: finiteOrNull(
          metricsTyped?.errorRate != null ? Number(metricsTyped.errorRate) * 100 : null,
          systemMetricsTyped?.errorRateToday,
          analyticsDataTyped?.error_rate_percent
        ),
        systemUptime: finiteOrNull(metricsTyped?.systemUptime),
        dailyUsageData: analyticsDataTyped?.daily_usage ?? [],
        statusMix: analyticsDataTyped?.status_code_distribution ?? [],
        systemMetrics: systemMetricsTyped,
      }

      const activity: RecentActivity[] = []
      if (auditResult.status === 'fulfilled') {
        for (const e of auditResult.value.entries) {
          activity.push({
            id: `audit-${e.id}`,
            type: e.action === 'user.delete' ? 'error_occurred' : 'api_usage',
            message: `${e.action} on ${formatAuditTarget(e)}`,
            timestamp: e.created_at,
            severity: e.action === 'user.delete' ? 'warning' : 'info',
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

  useEffect(() => {
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    loadDashboardData(timeRange)
  }, [timeRange])

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

  const rangeLabel =
    timeRange === '7d' ? 'Last 7 days' : timeRange === '30d' ? 'Last 30 days' : 'Last 12 months'

  const chartData =
    stats?.dailyUsageData.map((d) => ({
      date: new Date(d.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
      requests: d.requests,
      errors: d.errors,
    })) ?? []

  const periodErrors = chartData.reduce((sum, d) => sum + (Number(d.errors) || 0), 0)

  const statusMix =
    stats?.statusMix.map((d) => ({ name: String(d.status_code), value: Number(d.count) || 0 })) ?? []
  const hasStatusMix = statusMix.some((d) => d.value > 0)

  const sm = stats?.systemMetrics

  const platformPanel = stats ? (
    <AdminPanel>
      <AdminPanelHeader title="Platform" icon={Server} description="Business and service health" />
      <AdminPanelBody>
        <DashboardStatList
          items={[
            { label: 'Total users', value: countOrDash(stats.totalUsers) },
            {
              label: 'Revenue (MTD)',
              value: stats.revenue != null ? `$${stats.revenue.toLocaleString()}` : null,
              hint: (
                <DeltaPill value={stats.revenueGrowth} label="vs last month" />
              ),
            },
            {
              label: 'Avg response',
              value:
                stats.averageResponseTime != null
                  ? `${Math.round(stats.averageResponseTime)}ms`
                  : null,
            },
            {
              label: 'System uptime',
              value: stats.systemUptime != null ? `${stats.systemUptime}%` : null,
            },
            {
              label: 'Active subscriptions',
              value: sm?.activeSubscriptions != null ? sm.activeSubscriptions.toLocaleString() : null,
            },
          ]}
        />
      </AdminPanelBody>
    </AdminPanel>
  ) : null

  return (
    <AdminPage>
      <AdminPageHeader
        title={`Welcome${user?.first_name ? `, ${user.first_name}` : ''}`}
        description={`Platform health and API usage for the last ${
          timeRange === '7d' ? '7 days' : timeRange === '30d' ? '30 days' : 'year'
        }.`}
        meta={
          <>
            <DashboardPill tone="neutral">Admin</DashboardPill>
            {isSuperAdmin && <DashboardPill tone="indigo">Super admin</DashboardPill>}
          </>
        }
        actions={
          <>
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
          </>
        }
      />

      {error && (
        <DashboardAlert variant="warning">
          {error}
          <Button variant="outline" size="sm" className="h-8" onClick={() => loadDashboardData(timeRange)}>
            Retry
          </Button>
        </DashboardAlert>
      )}

      {isLoading && !stats ? (
        <>
          <AdminSkeletonStats count={3} />
          <div className="dashboard-grid-wide" aria-hidden>
            <div className="dashboard-card h-[360px] p-5">
              <DashboardSkeleton className="h-4 w-36" />
              <DashboardSkeleton className="mt-6 h-[260px] w-full rounded-xl" />
            </div>
            <div className="dashboard-card h-[360px] p-5">
              <DashboardSkeleton className="h-4 w-28" />
              <DashboardSkeleton className="mt-6 h-[260px] w-full rounded-xl" />
            </div>
          </div>
        </>
      ) : (
        <>
          <AdminStatGrid columns={3}>
            <DashboardStatCard
              label="Requests today"
              value={countOrDash(stats?.requestsToday ?? null)}
              hint={
                stats?.totalRequests != null
                  ? `${stats.totalRequests.toLocaleString()} in the ${rangeLabel.toLowerCase()}`
                  : undefined
              }
              icon={Activity}
              accent="brand"
            />
            <DashboardStatCard
              label="Active users"
              value={countOrDash(stats?.activeUsers ?? null)}
              hint={
                stats?.totalUsers != null
                  ? `${stats.totalUsers.toLocaleString()} total users`
                  : undefined
              }
              icon={Users}
              accent="indigo"
            />
            <DashboardStatCard
              label="Error rate"
              value={stats?.errorRate != null ? `${stats.errorRate.toFixed(2)}%` : null}
              hint={
                stats?.averageResponseTime != null
                  ? `Avg response ${Math.round(stats.averageResponseTime)}ms`
                  : undefined
              }
              icon={Zap}
              accent={stats?.errorRate != null && stats.errorRate >= 5 ? 'rose' : 'green'}
            />
          </AdminStatGrid>

          <div className="dashboard-grid-wide">
            <AdminPanel>
              <AdminPanelHeader title="API requests" icon={TrendingUp} description={rangeLabel} />
              <AdminPanelBody>
                <p className="dashboard-summary-value">
                  {stats?.totalRequests != null ? stats.totalRequests.toLocaleString() : '—'}
                </p>
                {chartData.length > 0 ? (
                  <AreaTrendChart
                    className="mt-4"
                    data={chartData}
                    xKey="date"
                    height={260}
                    series={[{ key: 'requests', name: 'Requests' }]}
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
              <AdminPanelHeader title="Errors" icon={AlertTriangle} description={rangeLabel} />
              <AdminPanelBody>
                <p className="dashboard-summary-value">
                  {chartData.length > 0 ? periodErrors.toLocaleString() : '—'}
                </p>
                {chartData.length > 0 ? (
                  <BarTrendChart
                    className="mt-4"
                    data={chartData}
                    xKey="date"
                    yKey="errors"
                    name="Errors"
                    height={260}
                  />
                ) : (
                  <DashboardEmpty icon={AlertTriangle} title="No error data yet" />
                )}
              </AdminPanelBody>
            </AdminPanel>
          </div>

          <div className="dashboard-grid-narrow-wide">
            <div className="flex min-w-0 flex-col gap-5">
              {hasStatusMix && (
                <AdminPanel>
                  <AdminPanelHeader title="Status codes" icon={PieChart} description={rangeLabel} />
                  <AdminPanelBody>
                    <DonutChart data={statusMix} centerLabel="responses" />
                  </AdminPanelBody>
                </AdminPanel>
              )}
              {platformPanel}
            </div>

            <AdminPanel className="flex flex-col">
              <AdminPanelHeader
                title="Recent activity"
                icon={ListChecks}
                description="Latest audit entries and API requests"
                actions={
                  hasPermission('admin:analytics:view') ? (
                    <Button asChild variant="outline" size="sm" className="h-9">
                      <Link href="/admin/requests">View log</Link>
                    </Button>
                  ) : undefined
                }
              />
              {recentActivity.length === 0 ? (
                <AdminPanelBody>
                  <DashboardEmpty
                    icon={Activity}
                    title="No recent activity"
                    description="No activity in this period yet."
                  />
                </AdminPanelBody>
              ) : (
                <AdminPanelBody noPadding>
                  <AdminTableWrap>
                    <AdminTable>
                      <thead>
                        <tr>
                          <th>Event</th>
                          <th>Source</th>
                          <th className="dashboard-num">Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentActivity.map((a) => {
                          const Icon = getActivityIcon(a.type)
                          return (
                            <tr key={a.id}>
                              <td className="max-w-0 w-full">
                                <div className="flex min-w-0 items-center gap-3">
                                  <span
                                    className={cn(
                                      'dashboard-icon-tile',
                                      a.severity === 'error'
                                        ? 'bg-dash-negative-soft text-dash-negative'
                                        : a.severity === 'warning'
                                          ? 'bg-dash-warning-soft text-dash-warning'
                                          : 'bg-dash-teal-soft text-dash-teal-strong'
                                    )}
                                    aria-hidden
                                  >
                                    <Icon className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} />
                                  </span>
                                  <span className="truncate text-dash-ink" title={a.message}>
                                    {a.message}
                                  </span>
                                </div>
                              </td>
                              <td>
                                <DashboardPill tone="neutral">
                                  {a.id.startsWith('audit-') ? 'Audit' : 'Request'}
                                </DashboardPill>
                              </td>
                              <td className="dashboard-num whitespace-nowrap text-xs text-dash-muted">
                                {new Date(a.timestamp).toLocaleString()}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </AdminTable>
                  </AdminTableWrap>
                </AdminPanelBody>
              )}
            </AdminPanel>
          </div>

          <div className="dashboard-grid-halves">
            {sm && (
              <AdminPanel>
                <AdminPanelHeader title="System information" icon={Database} />
                <AdminPanelBody className="grid gap-x-8 sm:grid-cols-2">
                  <DashboardStatList
                    items={[
                      { label: 'Python', value: sm.nodeVersion },
                      {
                        label: 'Database',
                        value: (
                          <span className="block max-w-[180px] truncate" title={sm.databaseVersion}>
                            {sm.databaseVersion}
                          </span>
                        ),
                      },
                      { label: 'Redis', value: sm.redisVersion },
                    ]}
                  />
                  <DashboardStatList
                    items={[
                      { label: 'CPU', value: sm.systemLoad != null ? `${sm.systemLoad}%` : null },
                      { label: 'Memory', value: sm.memoryUsage },
                      { label: 'Uptime', value: sm.uptime },
                      {
                        label: 'Requests today',
                        value: sm.requestsToday != null ? sm.requestsToday.toLocaleString() : null,
                      },
                      {
                        label: 'Errors today',
                        value: sm.errorRateToday != null ? `${sm.errorRateToday}%` : null,
                      },
                    ]}
                  />
                </AdminPanelBody>
              </AdminPanel>
            )}

            <AdminPanel>
              <AdminPanelHeader title="Quick actions" icon={Clock} />
              <AdminPanelBody className="grid gap-2 sm:grid-cols-2">
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
          </div>
        </>
      )}
    </AdminPage>
  )
}

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
