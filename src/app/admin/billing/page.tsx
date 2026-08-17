'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { adminAPI } from '@/lib/api/admin'
import { CreditCard, DollarSign, Users } from 'lucide-react'
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
} from '@/components/admin/admin-ui'

type SubSortKey = 'created_at' | 'current_period_end' | 'status' | 'email' | 'plan_price'

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
    loadSummary()
  }, [loadSummary])

  useEffect(() => {
    loadSubs()
  }, [loadSubs])

  // Reset paging in the setters, not an effect, so each change fetches once.
  const applySort = (next: AdminSortState<SubSortKey>) => {
    setSort(next)
    setPage(1)
  }
  const applyPageSize = (next: number) => {
    setPageSize(next)
    setPage(1)
  }

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
          <AdminStatGrid>
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
              accent="purple"
            />
          </AdminStatGrid>

          <AdminPanel>
            <AdminPanelHeader title="Revenue trend (12 months)" icon={DollarSign} />
            <AdminPanelBody>
              {series.length > 0 ? (
                <AdminLineChart data={series} xKey="month" yKey="revenue" height={280} color="#22C55E" />
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
              title="Subscriptions"
              icon={CreditCard}
              actions={
                <span className="text-xs text-ink-muted tabular-nums">
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
                              {s.user_id ? (
                                <Link
                                  href={`/admin/users/${s.user_id}`}
                                  className="hover:text-brand-strong hover:underline"
                                >
                                  {String(s.email)}
                                </Link>
                              ) : (
                                String(s.email)
                              )}
                            </td>
                            <td>{String(s.plan_name ?? s.plan_id ?? '—')}</td>
                            <td>
                              <span className="inline-flex rounded-md bg-surface-elevated px-2 py-0.5 text-xs font-medium capitalize">
                                {String(s.status)}
                              </span>
                            </td>
                            <td className="text-ink-muted whitespace-nowrap">
                              {s.created_at
                                ? new Date(String(s.created_at)).toLocaleDateString()
                                : '—'}
                            </td>
                            <td className="text-ink-muted whitespace-nowrap">
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
