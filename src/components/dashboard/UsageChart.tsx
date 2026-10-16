'use client'

import { BarChart3, AlertTriangle, Route } from 'lucide-react'
import {
  DashboardEmpty,
  DashboardPanel,
  DashboardPanelBody,
  DashboardPanelHeader,
  DashboardPill,
  DashboardTable,
  DashboardTableWrap,
  RateBar,
} from '@/components/dashboard/dashboard-shell'
import {
  AreaTrendChart,
  BarTrendChart,
  formatShortDate,
} from '@/components/dashboard/dashboard-charts'

export interface UsageData {
  date: string
  requests: number
  errors: number
  avgResponseTime: number
}

export interface EndpointUsage {
  endpoint: string
  request_count: number
  avg_response_time: number
  error_count: number
}

function usageEndpointLabel(endpoint: string): string {
  const match = endpoint.match(/\/api\/v1\/mcp\/([a-z0-9_]+)/i)
  if (match) return `MCP ${match[1].replace(/_/g, ' ')}`
  return endpoint.replace(/_/g, ' ')
}

function longDate(value: unknown): string {
  const d = new Date(String(value))
  if (Number.isNaN(d.getTime())) return String(value ?? '')
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function UsageTrendCards({
  data,
  rangeLabel,
}: {
  data: UsageData[]
  rangeLabel: string
}) {
  const totalRequests = data.reduce((sum, d) => sum + d.requests, 0)
  const totalErrors = data.reduce((sum, d) => sum + d.errors, 0)
  const errorRate = totalRequests > 0 ? (totalErrors / totalRequests) * 100 : null
  const avgResponse =
    data.length > 0 ? Math.round(data.reduce((sum, d) => sum + d.avgResponseTime, 0) / data.length) : null
  const latest = data.length > 0 ? data[data.length - 1] : null
  const previous = data.length > 1 ? data[data.length - 2] : null
  const dayChange = latest && previous ? latest.requests - previous.requests : null

  return (
    <div className="dashboard-grid-wide">
      <DashboardPanel>
        <DashboardPanelHeader title="Requests" icon={BarChart3} description={rangeLabel} />
        <DashboardPanelBody>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <p className="dashboard-summary-value">{totalRequests.toLocaleString()}</p>
            {dayChange != null && (
              <span className="text-xs text-dash-muted tabular-nums">
                {dayChange > 0
                  ? `+${dayChange.toLocaleString()} vs previous day`
                  : dayChange < 0
                    ? `${dayChange.toLocaleString()} vs previous day`
                    : 'Same as previous day'}
              </span>
            )}
          </div>
          {data.length > 0 ? (
            <AreaTrendChart
              className="mt-4"
              data={data as unknown as Array<Record<string, unknown>>}
              xKey="date"
              height={260}
              xTickFormatter={formatShortDate}
              labelFormatter={longDate}
              series={[{ key: 'requests', name: 'Requests' }]}
            />
          ) : (
            <DashboardEmpty
              icon={BarChart3}
              title="No requests in this range"
              description="Calls made with your API keys will chart here."
            />
          )}
        </DashboardPanelBody>
      </DashboardPanel>

      <DashboardPanel>
        <DashboardPanelHeader title="Errors" icon={AlertTriangle} description={rangeLabel} />
        <DashboardPanelBody>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <p className="dashboard-summary-value">{totalErrors.toLocaleString()}</p>
            <DashboardPill tone={errorRate != null && errorRate > 5 ? 'rose' : 'neutral'}>
              <span className="tabular-nums">
                {errorRate != null ? `${errorRate.toFixed(2)}%` : '—'}
              </span>
              error rate
            </DashboardPill>
          </div>
          <p className="mt-1 text-xs text-dash-muted tabular-nums">
            Avg response {avgResponse != null ? `${avgResponse}ms` : '—'}
            <span className="text-dash-dim"> · </span>
            Latest day {latest ? `${Math.round(latest.avgResponseTime)}ms` : '—'}
          </p>
          {data.length > 0 ? (
            <BarTrendChart
              className="mt-3"
              data={data as unknown as Array<Record<string, unknown>>}
              xKey="date"
              yKey="errors"
              name="Errors"
              height={232}
              xTickFormatter={formatShortDate}
              labelFormatter={longDate}
            />
          ) : (
            <DashboardEmpty icon={AlertTriangle} title="No errors to chart" />
          )}
        </DashboardPanelBody>
      </DashboardPanel>
    </div>
  )
}

export function EndpointUsageTable({ endpointData }: { endpointData: EndpointUsage[] }) {
  const total = endpointData.reduce((sum, e) => sum + e.request_count, 0)

  return (
    <DashboardPanel>
      <DashboardPanelHeader
        title="Endpoint usage"
        icon={Route}
        description={`${endpointData.length.toLocaleString()} endpoints`}
      />
      {endpointData.length === 0 ? (
        <DashboardPanelBody>
          <DashboardEmpty
            icon={Route}
            title="No endpoint data yet"
            description="Endpoints appear after your first API request in this range."
          />
        </DashboardPanelBody>
      ) : (
        <DashboardPanelBody flush>
          <DashboardTableWrap>
            <DashboardTable>
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
                {endpointData.map((endpoint) => {
                  const share = total > 0 ? (endpoint.request_count / total) * 100 : 0
                  const errorRate =
                    endpoint.request_count > 0
                      ? (endpoint.error_count / endpoint.request_count) * 100
                      : 0
                  return (
                    <tr key={endpoint.endpoint}>
                      <td className="max-w-[320px]">
                        <p className="truncate font-medium text-dash-ink" title={endpoint.endpoint}>
                          {usageEndpointLabel(endpoint.endpoint)}
                        </p>
                      </td>
                      <td className="dashboard-num font-medium text-dash-ink">
                        {endpoint.request_count.toLocaleString()}
                      </td>
                      <td>
                        <RateBar value={share} />
                      </td>
                      <td className="dashboard-num">{Math.round(endpoint.avg_response_time)}ms</td>
                      <td className="dashboard-num">
                        <span className="inline-flex items-center justify-end gap-2">
                          {endpoint.error_count.toLocaleString()}
                          <DashboardPill
                            tone={errorRate > 5 ? 'rose' : errorRate > 1 ? 'orange' : 'green'}
                          >
                            {errorRate.toFixed(1)}%
                          </DashboardPill>
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </DashboardTable>
          </DashboardTableWrap>
        </DashboardPanelBody>
      )}
    </DashboardPanel>
  )
}
