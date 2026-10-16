'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { adminAPI } from '@/lib/api/admin'
import { CreditCard, DollarSign, Receipt, Users } from 'lucide-react'
import { AdminLineChart } from '@/components/admin/admin-charts'
import { formatCount } from '@/lib/utils/format'
import {
  AdminPage,
  AdminPageHeader,
  AdminPanel,
  AdminPanelHeader,
  AdminPanelBody,
  AdminStatGrid,
  DashboardStatCard,
  AdminTableWrap,
  AdminTable,
  AdminSortableTh,
  AdminPagination,
  AdminSortState,
  AdminRefreshButton,
  DashboardLoading,
  DashboardAlert,
  DashboardEmpty,
  DashboardPill,
  DashboardStatList,
  type DashboardTone,
} from '@/components/admin/admin-ui'

type SubSortKey = 'created_at' | 'current_period_end' | 'status' | 'email' | 'plan_price'

function formatUsd(value: number): string {
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
}

function subscriptionTone(status: string): DashboardTone {
  if (status === 'active' || status === 'trialing') return 'green'
  if (status === 'past_due' || status === 'incomplete' || status === 'paused') return 'orange'
  if (status === 'unpaid' || status === 'incomplete_expired') return 'rose'
  return 'neutral'
}

export default function AdminBillingPage() {
  const [summary, setSummary] = useState<Record<string, unknown>>({})
  const [subs, setSubs] = useState<Array<Record<string, unknown>>>([])
  const [subsTotal, setSubsTotal] = useState(0)
  const [series, setSeries] = useState<Array<Record<string, unknown>>>([])
  const [loading, setLoading] = useState(true)
  const [subsLoading, setSubsLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [sort, setSort] = useState<AdminSortState<SubSortKey>>({
    key: 'created_at',
    order: 'desc',
  })

  const loadSummary = useCallback(() => {
    setLoading(true)
    setError('')
    Promise.all([adminAPI.getRevenueSummary(), adminAPI.getRevenueTimeseries(12)])
      .then(([s, ts]) => {
        setSummary(s)
        setSeries(
          ts.timeseries.map((row) => ({
            month: row.month
              ? new Date(String(row.month)).toLocaleDateString('en', {
                  month: 'short',
                  year: '2-digit',
                })
              : '',
            revenue: row.revenue_usd,
          }))
        )
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load billing'))
      .finally(() => setLoading(false))
  }, [])

  const loadSubs = useCallback(() => {
    setSubsLoading(true)
    adminAPI
      .getSubscriptions({
        skip: (page - 1) * pageSize,
        limit: pageSize,
        sort_by: sort.key,
        sort_order: sort.order,
      })
      .then((res) => {
        setSubs(res.subscriptions)
        setSubsTotal(res.total ?? res.subscriptions.length)
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load subscriptions'))
      .finally(() => setSubsLoading(false))
  }, [page, pageSize, sort])

  const load = useCallback(() => {
    loadSummary()
    loadSubs()
  }, [loadSummary, loadSubs])

  useEffect(() => {
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    loadSummary()
  }, [loadSummary])

  useEffect(() => {
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    loadSubs()
  }, [loadSubs])

  const applySort = (next: AdminSortState<SubSortKey>) => {
    setSort(next)
    setPage(1)
  }
  const applyPageSize = (next: number) => {
    setPageSize(next)
    setPage(1)
  }

  const revenueValues = series.map((row) => Number(row.revenue) || 0)
  const windowRevenue = revenueValues.reduce((sum, value) => sum + value, 0)
  const peakRevenue = revenueValues.length > 0 ? Math.max(...revenueValues) : null
  const peakRow = peakRevenue != null ? series[revenueValues.indexOf(peakRevenue)] : null
  const latestRow = series.length > 0 ? series[series.length - 1] : null
  const totalRevenue = Number(summary.total_revenue_usd ?? 0)
  const paymentEvents = Number(summary.payment_events ?? 0)

  return (
    <AdminPage>
      <AdminPageHeader
        title="Billing & revenue"
        description="Read-only view of Stripe billing events and active subscriptions."
        actions={<AdminRefreshButton onClick={load} loading={loading} />}
      />

      {error && <DashboardAlert variant="error">{error}</DashboardAlert>}

      {loading ? (
        <DashboardLoading message="Loading billing data…" />
      ) : (
        <>
          <AdminStatGrid columns={3}>
            <DashboardStatCard
              label="Total revenue"
              value={`$${Number(summary.total_revenue_usd ?? 0).toLocaleString()}`}
              icon={DollarSign}
              accent="green"
            />
            <DashboardStatCard
              label="Payment events"
              value={formatCount(Number(summary.payment_events ?? 0))}
              icon={CreditCard}
              accent="brand"
            />
            <DashboardStatCard
              label="Active subscriptions"
              value={formatCount(Number(summary.active_subscriptions ?? 0))}
              icon={Users}
              accent="indigo"
            />
          </AdminStatGrid>

          <div className="dashboard-grid-wide">
            <AdminPanel>
              <AdminPanelHeader title="Revenue trend (12 months)" icon={DollarSign} />
              <AdminPanelBody>
                {series.length > 0 ? (
                  <AdminLineChart
                    data={series}
                    xKey="month"
                    yKey="revenue"
                    name="Revenue"
                    height={280}
                    valueFormatter={(value) => formatUsd(Number(value) || 0)}
                  />
                ) : (
                  <DashboardEmpty
                    icon={DollarSign}
                    title="No revenue data yet"
                    description="Payment events will appear after Stripe invoices succeed."
                  />
                )}
              </AdminPanelBody>
            </AdminPanel>

            <AdminPanel>
              <AdminPanelHeader
                title="Revenue summary"
                icon={Receipt}
                description="Based on succeeded payment events."
              />
              <AdminPanelBody>
                <DashboardStatList
                  items={[
                    {
                      label: 'Last 12 months',
                      value: series.length > 0 ? formatUsd(windowRevenue) : null,
                    },
                    {
                      label: 'Best month',
                      value: peakRow && peakRevenue != null ? formatUsd(peakRevenue) : null,
                      hint:
                        peakRow && peakRow.month ? (
                          <DashboardPill tone="neutral">{String(peakRow.month)}</DashboardPill>
                        ) : undefined,
                    },
                    {
                      label: 'Latest month',
                      value: latestRow ? formatUsd(Number(latestRow.revenue) || 0) : null,
                      hint:
                        latestRow && latestRow.month ? (
                          <DashboardPill tone="neutral">{String(latestRow.month)}</DashboardPill>
                        ) : undefined,
                    },
                    {
                      label: 'Average per payment',
                      value: paymentEvents > 0 ? formatUsd(totalRevenue / paymentEvents) : null,
                    },
                  ]}
                />
              </AdminPanelBody>
            </AdminPanel>
          </div>

          <AdminPanel>
            <AdminPanelHeader
              title="Subscriptions"
              icon={CreditCard}
              actions={
                <span className="dashboard-meta-pill tabular-nums">
                  {subsTotal.toLocaleString()} total
                </span>
              }
            />
            {subs.length === 0 && !subsLoading ? (
              <DashboardEmpty icon={CreditCard} title="No subscriptions" />
            ) : (
              <>
                <AdminPanelBody noPadding>
                  <AdminTableWrap>
                    <AdminTable>
                      <thead>
                        <tr>
                          <AdminSortableTh
                            label="Customer"
                            sortKey="email"
                            sort={sort}
                            onSort={applySort}
                            defaultOrder="asc"
                          />
                          <AdminSortableTh
                            label="Plan"
                            sortKey="plan_price"
                            sort={sort}
                            onSort={applySort}
                          />
                          <th className="dashboard-num">Monthly price</th>
                          <AdminSortableTh
                            label="Status"
                            sortKey="status"
                            sort={sort}
                            onSort={applySort}
                            defaultOrder="asc"
                          />
                          <AdminSortableTh
                            label="Started"
                            sortKey="created_at"
                            sort={sort}
                            onSort={applySort}
                          />
                          <AdminSortableTh
                            label="Period end"
                            sortKey="current_period_end"
                            sort={sort}
                            onSort={applySort}
                          />
                        </tr>
                      </thead>
                      <tbody className={subsLoading ? 'opacity-60 transition-opacity' : undefined}>
                        {subs.map((s) => (
                          <tr key={String(s.id)}>
                            <td>
                              <div className="flex min-w-0 items-center gap-3">
                                <span
                                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-dash-pill text-xs font-semibold uppercase text-dash-body"
                                  aria-hidden
                                >
                                  {String(s.email ?? '').charAt(0) || '?'}
                                </span>
                                {s.user_id ? (
                                  <Link
                                    href={`/admin/users/${s.user_id}`}
                                    className="truncate font-medium text-dash-ink hover:text-dash-teal-strong hover:underline"
                                  >
                                    {String(s.email)}
                                  </Link>
                                ) : (
                                  <span className="truncate font-medium text-dash-ink">{String(s.email)}</span>
                                )}
                              </div>
                            </td>
                            <td className="text-dash-ink">{String(s.plan_name ?? s.plan_id ?? '—')}</td>
                            <td className="dashboard-num whitespace-nowrap">
                              {s.plan_price != null && s.plan_price !== ''
                                ? formatUsd(Number(s.plan_price) || 0)
                                : '—'}
                            </td>
                            <td>
                              <DashboardPill
                                tone={subscriptionTone(String(s.status))}
                                className="capitalize"
                              >
                                {String(s.status)}
                              </DashboardPill>
                            </td>
                            <td className="whitespace-nowrap text-dash-muted">
                              {s.created_at
                                ? new Date(String(s.created_at)).toLocaleDateString()
                                : '—'}
                            </td>
                            <td className="whitespace-nowrap text-dash-muted">
                              {s.current_period_end
                                ? new Date(String(s.current_period_end)).toLocaleDateString()
                                : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </AdminTable>
                  </AdminTableWrap>
                </AdminPanelBody>
                <AdminPagination
                  page={page}
                  pageSize={pageSize}
                  total={subsTotal}
                  onPageChange={setPage}
                  onPageSizeChange={applyPageSize}
                  loading={subsLoading}
                  noun="subscriptions"
                />
              </>
            )}
          </AdminPanel>
        </>
      )}
    </AdminPage>
  )
}
