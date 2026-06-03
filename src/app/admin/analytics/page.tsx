'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  BarChart3,
  Users,
  Activity,
  Zap,
  Clock,
  Database,
} from 'lucide-react'

import { adminAPI, AdminAnalytics } from '@/lib/api/admin'
import { AdminLineChart, AdminPieChart } from '@/components/admin/admin-charts'
import { formatCount, formatMs, formatPercent, toNumber } from '@/lib/utils/format'
import {
  AdminPage,
  AdminPageHeader,
  AdminPageBody,
  AdminStatGrid,
  DashboardStatCard,
  AdminPanel,
  AdminPanelHeader,
  AdminPanelBody,
  AdminTimeRangeToggle,
  AdminRefreshButton,
  DashboardLoading,
  DashboardAlert,
  DashboardEmpty,
} from '@/components/admin/admin-ui'

export default function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AdminAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('7d')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const loadAnalyticsData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError('')
      const data = await adminAPI.getAnalytics(timeRange)
      setAnalyticsData(data)
      setLastUpdated(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics data')
    } finally {
      setIsLoading(false)
    }
  }, [timeRange])

  useEffect(() => {
    loadAnalyticsData()
    const interval = setInterval(loadAnalyticsData, 30000)
    return () => clearInterval(interval)
  }, [loadAnalyticsData])

  const dailyChartData =
    analyticsData?.daily_usage?.map((d) => ({
      date: new Date(d.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
      requests: toNumber(d.requests),
    })) ?? []

  const latencyPie =
    analyticsData?.response_time_distribution?.map((d) => ({
      name: d.response_time_range,
      value: toNumber(d.count),
    })) ?? []

  const statusPie =
    analyticsData?.status_code_distribution?.map((d) => ({
      name: String(d.status_code),
      value: toNumber(d.count),
    })) ?? []

  if (isLoading && !analyticsData) {
    return (
      <AdminPage>
        <DashboardLoading message="Loading analytics…" />
      </AdminPage>
    )
  }

  return (
    <AdminPage>
      <AdminPageHeader
        title="Analytics"
        description={
          lastUpdated
            ? `Platform metrics · updated ${lastUpdated.toLocaleTimeString()}`
            : 'Monitor API usage, latency, and errors.'
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <AdminTimeRangeToggle
              value={timeRange}
              options={[
                { value: '7d' as const, label: '7d' },
                { value: '30d' as const, label: '30d' },
                { value: '90d' as const, label: '90d' },
                { value: '1y' as const, label: '1y' },
              ]}
              onChange={setTimeRange}
            />
            <AdminRefreshButton onClick={loadAnalyticsData} loading={isLoading} />
          </div>
        }
      />

      {error && <DashboardAlert variant="error">{error}</DashboardAlert>}

      <AdminPageBody>
        <AdminStatGrid>
          <DashboardStatCard
            label="Total requests"
            value={formatCount(analyticsData?.total_requests ?? 0)}
            hint={`Last ${timeRange}`}
            icon={Activity}
            accent="brand"
          />
          <DashboardStatCard
            label="Active users"
            value={formatCount(analyticsData?.active_users ?? 0)}
            hint={`${formatCount(analyticsData?.total_users ?? 0)} total`}
            icon={Users}
            accent="green"
          />
          <DashboardStatCard
            label="Avg response"
            value={`${formatMs(analyticsData?.avg_response_time_ms)}ms`}
            hint="Average latency"
            icon={Clock}
            accent="purple"
          />
          <DashboardStatCard
            label="Error rate"
            value={`${formatPercent(analyticsData?.error_rate_percent)}%`}
            hint={
              toNumber(analyticsData?.error_rate_percent) < 5 ? 'Healthy' : 'Needs attention'
            }
            icon={Zap}
            accent="orange"
          />
        </AdminStatGrid>

        <AdminPanel>
          <AdminPanelHeader title="Daily usage trends" icon={BarChart3} />
          <AdminPanelBody>
            {dailyChartData.length > 0 ? (
              <AdminLineChart data={dailyChartData} xKey="date" yKey="requests" height={280} />
            ) : (
              <DashboardEmpty
                icon={BarChart3}
                title="No usage data yet"
                description="Charts populate as API requests are recorded."
              />
            )}
          </AdminPanelBody>
        </AdminPanel>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AdminPanel>
            <AdminPanelHeader title="Top endpoints" icon={Database} />
            <AdminPanelBody>
              <div className="space-y-4">
                {analyticsData?.top_endpoints?.length ? (
                  analyticsData.top_endpoints.map((endpoint, index) => {
                    const maxRequests = Math.max(
                      ...analyticsData.top_endpoints.map((e) => toNumber(e.request_count))
                    )
                    const requestCount = toNumber(endpoint.request_count)
                    const pct = maxRequests > 0 ? (requestCount / maxRequests) * 100 : 0
                    return (
                      <div key={index} className="space-y-1.5">
                        <div className="flex justify-between gap-3 text-sm">
                          <p className="font-mono text-xs text-ink truncate flex-1">
                            {endpoint.endpoint}
                          </p>
                          <span className="tabular-nums font-medium shrink-0">
                            {formatCount(requestCount)}
                          </span>
                        </div>
                        <div className="dashboard-progress-track h-1.5">
                          <div
                            className="dashboard-progress-fill bg-brand"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <p className="text-xs text-ink-muted">
                          {formatMs(endpoint.avg_response_time)} avg
                        </p>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-sm text-ink-muted text-center py-6">No endpoint data</p>
                )}
              </div>
            </AdminPanelBody>
          </AdminPanel>

          <AdminPanel>
            <AdminPanelHeader title="Top users" icon={Users} />
            <AdminPanelBody>
              <div className="space-y-3">
                {analyticsData?.top_users?.length ? (
                  analyticsData.top_users.map((user, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between gap-4 py-2 border-b border-surface-border/50 last:border-0"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-ink truncate">
                          {[user.first_name, user.last_name].filter(Boolean).join(' ') || user.email}
                        </p>
                        <p className="text-xs text-ink-muted truncate">{user.email}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold tabular-nums">
                          {formatCount(user.request_count)}
                        </p>
                        <p className="text-xs text-ink-muted">requests</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-ink-muted text-center py-6">No user data</p>
                )}
              </div>
            </AdminPanelBody>
          </AdminPanel>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AdminPanel>
            <AdminPanelHeader title="Response time distribution" />
            <AdminPanelBody>
              {latencyPie.length > 0 ? (
                <AdminPieChart data={latencyPie} nameKey="name" valueKey="value" />
              ) : (
                <DashboardEmpty icon={Clock} title="No latency data" />
              )}
            </AdminPanelBody>
          </AdminPanel>
          <AdminPanel>
            <AdminPanelHeader title="Status code distribution" />
            <AdminPanelBody>
              {statusPie.length > 0 ? (
                <AdminPieChart data={statusPie} nameKey="name" valueKey="value" />
              ) : (
                <DashboardEmpty icon={Activity} title="No status data" />
              )}
            </AdminPanelBody>
          </AdminPanel>
        </div>
      </AdminPageBody>
    </AdminPage>
  )
}
