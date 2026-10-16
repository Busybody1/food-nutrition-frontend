'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  AlertTriangle,
  BarChart3,
  Users,
  Activity,
  Zap,
  Clock,
  Database,
} from 'lucide-react'

import { adminAPI, AdminAnalytics } from '@/lib/api/admin'
import { AdminPieChart, AreaTrendChart, BarTrendChart } from '@/components/admin/admin-charts'
import { formatCount, formatMs, formatPercent, toNumber } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'
import {
  AdminPage,
  AdminPageHeader,
  AdminStatGrid,
  DashboardStatCard,
  AdminPanel,
  AdminPanelHeader,
  AdminPanelBody,
  AdminTableWrap,
  AdminTable,
  AdminTimeRangeToggle,
  AdminRefreshButton,
  DashboardAlert,
  DashboardEmpty,
  DashboardPageSkeleton,
  RateBar,
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
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    loadAnalyticsData()
    const interval = setInterval(loadAnalyticsData, 30000)
    return () => clearInterval(interval)
  }, [loadAnalyticsData])

  const dailyChartData =
    analyticsData?.daily_usage?.map((d) => ({
      date: new Date(d.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
      requests: toNumber(d.requests),
      errors: toNumber(d.errors),
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

  const totalRequests = toNumber(analyticsData?.total_requests)
  const periodErrors = dailyChartData.reduce((sum, d) => sum + d.errors, 0)
  const topEndpoints = analyticsData?.top_endpoints ?? []
  const topUsers = analyticsData?.top_users ?? []

  if (isLoading && !analyticsData) {
    return <DashboardPageSkeleton kpis={4} label="Loading analytics…" />
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
          <>
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
          </>
        }
      />

      {error && <DashboardAlert variant="error">{error}</DashboardAlert>}

      <AdminStatGrid columns={4}>
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
          accent="indigo"
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

      <div className="dashboard-grid-wide">
        <AdminPanel>
          <AdminPanelHeader
            title="Daily usage trends"
            icon={BarChart3}
            description={`Requests per day, last ${timeRange}`}
          />
          <AdminPanelBody>
            <p className="dashboard-summary-value">{formatCount(totalRequests)}</p>
            <p className="mt-0.5 text-xs text-dash-muted">Requests in this period</p>
            {dailyChartData.length > 0 ? (
              <AreaTrendChart
                className="mt-5"
                data={dailyChartData}
                xKey="date"
                series={[{ key: 'requests', name: 'Requests' }]}
                height={260}
              />
            ) : (
              <DashboardEmpty
                icon={BarChart3}
                title="No usage data yet"
                description="Charts populate as API requests are recorded."
              />
            )}
          </AdminPanelBody>
        </AdminPanel>

        <AdminPanel>
          <AdminPanelHeader
            title="Daily errors"
            icon={AlertTriangle}
            description="Responses with status 400 or above"
          />
          <AdminPanelBody>
            <p className="dashboard-summary-value">{formatCount(periodErrors)}</p>
            <p className="mt-0.5 text-xs text-dash-muted">Errors in this period</p>
            {dailyChartData.length > 0 ? (
              <BarTrendChart
                className="mt-5"
                data={dailyChartData}
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

      <div className="grid grid-cols-1 gap-5 2xl:grid-cols-[minmax(0,1.62fr)_minmax(0,1fr)]">
        <AdminPanel>
          <AdminPanelHeader
            title="Top endpoints"
            icon={Database}
            description={`Last ${timeRange}`}
          />
          {topEndpoints.length ? (
            <AdminPanelBody noPadding>
              <AdminTableWrap>
                <AdminTable>
                  <thead>
                    <tr>
                      <th>Endpoint</th>
                      <th className="dashboard-num">Requests</th>
                      <th>Share</th>
                      <th className="dashboard-num">Avg response</th>
                      <th className="dashboard-num">Errors</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topEndpoints.map((endpoint, index) => {
                      const requestCount = toNumber(endpoint.request_count)
                      const share = totalRequests > 0 ? (requestCount / totalRequests) * 100 : 0
                      const errorCount = toNumber(endpoint.error_count)
                      return (
                        <tr key={index}>
                          <td
                            className="max-w-[280px] truncate font-mono text-xs text-dash-ink"
                            title={endpoint.endpoint}
                          >
                            {endpoint.endpoint}
                          </td>
                          <td className="dashboard-num font-medium text-dash-ink">
                            {formatCount(requestCount)}
                          </td>
                          <td>
                            <RateBar value={share} />
                          </td>
                          <td className="dashboard-num whitespace-nowrap">
                            {formatMs(endpoint.avg_response_time)}ms
                          </td>
                          <td
                            className={cn(
                              'dashboard-num',
                              errorCount > 0 && 'font-medium text-dash-negative'
                            )}
                          >
                            {endpoint.error_count != null ? formatCount(errorCount) : '—'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </AdminTable>
              </AdminTableWrap>
            </AdminPanelBody>
          ) : (
            <AdminPanelBody>
              <DashboardEmpty icon={Database} title="No endpoint data" />
            </AdminPanelBody>
          )}
        </AdminPanel>

        <AdminPanel>
          <AdminPanelHeader title="Top users" icon={Users} description={`Last ${timeRange}`} />
          {topUsers.length ? (
            <AdminPanelBody noPadding>
              <AdminTableWrap>
                <AdminTable>
                  <thead>
                    <tr>
                      <th>User</th>
                      <th className="dashboard-num">Requests</th>
                      <th className="dashboard-num">Avg response</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topUsers.map((user, index) => {
                      const displayName =
                        [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email
                      return (
                        <tr key={index}>
                          <td className="max-w-[260px]">
                            <div className="flex min-w-0 items-center gap-3">
                              <span
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-dash-pill text-xs font-semibold uppercase text-dash-body"
                                aria-hidden
                              >
                                {displayName.charAt(0)}
                              </span>
                              <div className="min-w-0">
                                <p className="truncate font-medium text-dash-ink">{displayName}</p>
                                <p className="truncate text-xs text-dash-muted">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="dashboard-num font-medium text-dash-ink">
                            {formatCount(user.request_count)}
                          </td>
                          <td className="dashboard-num whitespace-nowrap">
                            {user.avg_response_time != null
                              ? `${formatMs(user.avg_response_time)}ms`
                              : '—'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </AdminTable>
              </AdminTableWrap>
            </AdminPanelBody>
          ) : (
            <AdminPanelBody>
              <DashboardEmpty icon={Users} title="No user data" />
            </AdminPanelBody>
          )}
        </AdminPanel>
      </div>

      <div className="dashboard-grid-halves">
        <AdminPanel>
          <AdminPanelHeader
            title="Response time distribution"
            icon={Clock}
            description={`Last ${timeRange}`}
          />
          <AdminPanelBody>
            {latencyPie.length > 0 ? (
              <AdminPieChart
                data={latencyPie}
                nameKey="name"
                valueKey="value"
                centerLabel="requests"
              />
            ) : (
              <DashboardEmpty icon={Clock} title="No latency data" />
            )}
          </AdminPanelBody>
        </AdminPanel>
        <AdminPanel>
          <AdminPanelHeader
            title="Status code distribution"
            icon={Activity}
            description={`Last ${timeRange}`}
          />
          <AdminPanelBody>
            {statusPie.length > 0 ? (
              <AdminPieChart
                data={statusPie}
                nameKey="name"
                valueKey="value"
                centerLabel="requests"
              />
            ) : (
              <DashboardEmpty icon={Activity} title="No status data" />
            )}
          </AdminPanelBody>
        </AdminPanel>
      </div>
    </AdminPage>
  )
}
