'use client'

import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import {
  Activity, AlertTriangle, CheckCircle, Clock,
  Server, Database, Zap, Gauge, RefreshCw, Eye
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import {
  AdminPage,
  AdminPageHeader,
  AdminPanel,
  AdminPanelBody,
  AdminPanelHeader,
  AdminStatGrid,
  AdminTable,
  AdminTableWrap,
  DashboardEmpty,
  DashboardIconTile,
  DashboardPageSkeleton,
  DashboardPill,
  DashboardStatCard,
  DashboardStatList,
  RateBar,
  DASHBOARD_ICON_STROKE,
  type DashboardTone,
} from '@/components/admin/admin-ui'

interface SystemStatus {
  overall: 'healthy' | 'warning' | 'critical'
  uptime: number
  responseTime: number
  errorRate: number
  throughput: number
}

interface ServiceStatus {
  name: string
  status: 'healthy' | 'warning' | 'critical'
  uptime: number
  responseTime: number
  lastCheck: string
  description?: string
}

interface Alert {
  id: string
  type: 'error' | 'warning' | 'info'
  title: string
  description: string
  timestamp: string
  resolved: boolean
  severity: 'low' | 'medium' | 'high' | 'critical'
}

interface LogEntry {
  id: string
  timestamp: string
  level: 'info' | 'warning' | 'error' | 'debug'
  service: string
  message: string
  details?: Record<string, unknown>
}

function StatusPill({ tone, children }: { tone: DashboardTone; children: ReactNode }) {
  return (
    <DashboardPill tone={tone} className="capitalize">
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {children}
    </DashboardPill>
  )
}

export default function APIMonitoring() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null)
  const [services, setServices] = useState<ServiceStatus[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)

  const loadMonitoringData = async () => {
    try {
      const { adminAPI } = await import('@/lib/api/admin')

      const [metricsResult, healthResult, envResult] = await Promise.allSettled([
        adminAPI.getSystemMetrics(),
        adminAPI.getSystemHealth(),
        adminAPI.getEnvironmentInfo(),
      ])

      if (metricsResult.status === 'rejected' && healthResult.status === 'rejected') {
        const reason = metricsResult.reason ?? healthResult.reason
        throw reason instanceof Error ? reason : new Error('Failed to load monitoring data')
      }

      const metrics =
        metricsResult.status === 'fulfilled' ? metricsResult.value : null
      const health =
        healthResult.status === 'fulfilled' ? healthResult.value : null
      const env =
        envResult.status === 'fulfilled' ? envResult.value : null

      const errorRatePercent =
        metrics?.errorRate != null ? metrics.errorRate * 100 : env?.errorRateToday ?? 0
      const throughput =
        env?.requestsToday != null
          ? Math.max(1, Math.round(Number(env.requestsToday) / (24 * 60)))
          : 0

      const serviceStatuses = health?.services ?? []
      const overallFromServices = serviceStatuses.some((s) => s.status === 'critical')
        ? 'critical'
        : serviceStatuses.some((s) => s.status === 'warning')
          ? 'warning'
          : 'healthy'

      setSystemStatus({
        overall: overallFromServices,
        uptime: metrics?.systemUptime ?? 99.9,
        responseTime: metrics?.averageResponseTime ?? 0,
        errorRate: errorRatePercent,
        throughput,
      })
      setServices(serviceStatuses)
      setAlerts(health?.alerts ?? [])
      setLogs(health?.logs ?? [])
    } catch (error) {
      console.error('Failed to load monitoring data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    loadMonitoringData()

    if (autoRefresh) {
      const interval = setInterval(loadMonitoringData, 30000)
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const getStatusTone = (status: string): DashboardTone => {
    switch (status) {
      case 'healthy':
        return 'green'
      case 'warning':
        return 'orange'
      case 'critical':
        return 'rose'
      default:
        return 'neutral'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return CheckCircle
      case 'warning':
        return AlertTriangle
      case 'critical':
        return AlertTriangle
      default:
        return Activity
    }
  }

  const getLogLevelTone = (level: string): DashboardTone => {
    switch (level) {
      case 'info':
        return 'indigo'
      case 'warning':
        return 'orange'
      case 'error':
        return 'rose'
      case 'debug':
        return 'neutral'
      default:
        return 'neutral'
    }
  }

  const getSeverityTone = (severity: string): DashboardTone => {
    switch (severity) {
      case 'low':
        return 'indigo'
      case 'medium':
        return 'orange'
      case 'high':
        return 'orange'
      case 'critical':
        return 'rose'
      default:
        return 'neutral'
    }
  }

  if (isLoading) {
    return <DashboardPageSkeleton kpis={4} label="Loading monitoring" />
  }

  const overall = systemStatus?.overall ?? ''
  const activeAlertCount = alerts.filter(a => !a.resolved).length
  const healthyCount = services.filter((s) => s.status === 'healthy').length
  const warningCount = services.filter((s) => s.status === 'warning').length
  const criticalCount = services.filter((s) => s.status === 'critical').length

  return (
    <AdminPage>
      <AdminPageHeader
        title="API Monitoring"
        description="Real-time system health, performance metrics, and alerts"
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              aria-pressed={autoRefresh}
              className={cn('h-9 gap-1.5', autoRefresh && 'bg-dash-pill hover:bg-dash-pill')}
            >
              <RefreshCw
                className={cn('h-4 w-4', autoRefresh && 'animate-spin text-dash-teal-strong')}
                strokeWidth={DASHBOARD_ICON_STROKE}
                aria-hidden
              />
              Auto Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={loadMonitoringData}
              className="h-9 gap-1.5"
            >
              <RefreshCw className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} aria-hidden />
              Refresh Now
            </Button>
          </>
        }
      />

      <AdminStatGrid columns={4}>
        <DashboardStatCard
          label="System Status"
          value={systemStatus ? <span className="capitalize">{systemStatus.overall}</span> : null}
          icon={getStatusIcon(overall)}
          accent={getStatusTone(overall)}
          hint={
            !systemStatus
              ? undefined
              : systemStatus.overall === 'healthy'
                ? 'All systems operational'
                : `${warningCount + criticalCount} of ${services.length} services need attention`
          }
        />
        <DashboardStatCard
          label="Uptime"
          value={systemStatus ? `${systemStatus.uptime}%` : null}
          icon={Clock}
          accent="brand"
          hint="Last 30 days"
        />
        <DashboardStatCard
          label="Response Time"
          value={systemStatus ? `${systemStatus.responseTime}ms` : null}
          icon={Zap}
          accent="indigo"
          hint="Average"
        />
        <DashboardStatCard
          label="Throughput"
          value={systemStatus ? `${systemStatus.throughput}/min` : null}
          icon={Activity}
          accent="orange"
          hint="Requests per minute"
        />
      </AdminStatGrid>

      <div className="dashboard-grid-wide">
        <AdminPanel>
          <AdminPanelHeader
            title="Service Status"
            icon={Server}
            description={`${services.length} ${services.length === 1 ? 'service' : 'services'}`}
          />
          {services.length === 0 ? (
            <AdminPanelBody>
              <DashboardEmpty icon={Server} title="No services reported" />
            </AdminPanelBody>
          ) : (
            <AdminPanelBody noPadding>
              <AdminTableWrap>
                <AdminTable>
                  <thead>
                    <tr>
                      <th>Service</th>
                      <th>Status</th>
                      <th className="dashboard-num">Uptime</th>
                      <th className="dashboard-num">Response</th>
                      <th className="dashboard-num">Last check</th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.map((service, index) => (
                      <tr key={index}>
                        <td>
                          <div className="flex min-w-0 items-center gap-3">
                            <DashboardIconTile icon={Server} tone="neutral" className="h-8 w-8" />
                            <div className="min-w-0">
                              <p className="font-medium text-dash-ink">{service.name}</p>
                              {service.description && (
                                <p className="text-xs text-dash-muted">{service.description}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <StatusPill tone={getStatusTone(service.status)}>{service.status}</StatusPill>
                        </td>
                        <td className="dashboard-num">
                          <RateBar value={service.uptime} label={`${service.uptime}%`} />
                        </td>
                        <td className="dashboard-num whitespace-nowrap">{service.responseTime}ms</td>
                        <td className="dashboard-num whitespace-nowrap text-dash-muted">
                          {new Date(service.lastCheck).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </AdminTable>
              </AdminTableWrap>
            </AdminPanelBody>
          )}
        </AdminPanel>

        <AdminPanel>
          <AdminPanelHeader title="Health summary" icon={Gauge} />
          <AdminPanelBody>
            <DashboardStatList
              className="-my-2.5"
              items={[
                {
                  label: 'Error rate',
                  value: systemStatus
                    ? `${systemStatus.errorRate.toLocaleString(undefined, { maximumFractionDigits: 2 })}%`
                    : null,
                },
                {
                  label: 'Healthy services',
                  value: services.length > 0 ? `${healthyCount} of ${services.length}` : null,
                },
                { label: 'Warnings', value: warningCount },
                { label: 'Critical', value: criticalCount },
                { label: 'Active alerts', value: activeAlertCount },
                { label: 'Auto refresh', value: autoRefresh ? 'Every 30s' : 'Off' },
              ]}
            />
          </AdminPanelBody>
        </AdminPanel>
      </div>

      <div className="dashboard-grid-narrow-wide">
        <AdminPanel>
          <AdminPanelHeader
            title="Active Alerts"
            icon={AlertTriangle}
            actions={
              <DashboardPill tone={activeAlertCount > 0 ? 'rose' : 'neutral'} className="tabular-nums">
                {activeAlertCount} active
              </DashboardPill>
            }
          />
          <AdminPanelBody>
            {alerts.length === 0 ? (
              <DashboardEmpty icon={CheckCircle} title="No alerts" />
            ) : (
              <ul className="-my-3">
                {alerts.map((alert) => (
                  <li key={alert.id} className="dashboard-activity-item">
                    <DashboardIconTile
                      icon={alert.resolved ? CheckCircle : AlertTriangle}
                      tone={alert.resolved ? 'neutral' : 'rose'}
                      className="h-8 w-8"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-[13px] font-medium leading-5 text-dash-ink">{alert.title}</h4>
                        <StatusPill tone={getSeverityTone(alert.severity)}>{alert.severity}</StatusPill>
                      </div>
                      <p className="mt-0.5 text-xs leading-5 text-dash-muted">{alert.description}</p>
                      <p className="mt-0.5 text-xs text-dash-dim">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 w-8 shrink-0 p-0" aria-label="View alert">
                      <Eye className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} aria-hidden />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </AdminPanelBody>
        </AdminPanel>

        <AdminPanel>
          <AdminPanelHeader
            title="Recent Logs"
            icon={Database}
            description={`${logs.length} ${logs.length === 1 ? 'entry' : 'entries'}`}
          />
          {logs.length === 0 ? (
            <AdminPanelBody>
              <DashboardEmpty icon={Database} title="No recent logs" />
            </AdminPanelBody>
          ) : (
            <AdminPanelBody noPadding>
              <div className="max-h-96 overflow-y-auto rounded-b-2xl">
                <AdminTableWrap>
                  <AdminTable>
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>Level</th>
                        <th>Service</th>
                        <th>Message</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log) => (
                        <tr key={log.id}>
                          <td className="whitespace-nowrap tabular-nums text-dash-muted">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </td>
                          <td>
                            <StatusPill tone={getLogLevelTone(log.level)}>{log.level}</StatusPill>
                          </td>
                          <td className="whitespace-nowrap font-medium text-dash-ink">{log.service}</td>
                          <td className="min-w-[16rem]">
                            <p className="text-dash-body">{log.message}</p>
                            {log.details && (
                              <details className="mt-1">
                                <summary className="cursor-pointer text-xs text-dash-teal-strong">
                                  View details
                                </summary>
                                <pre className="dashboard-code-block mt-1.5 block overflow-x-auto whitespace-pre">
                                  {JSON.stringify(log.details, null, 2)}
                                </pre>
                              </details>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </AdminTable>
                </AdminTableWrap>
              </div>
            </AdminPanelBody>
          )}
        </AdminPanel>
      </div>
    </AdminPage>
  )
}
