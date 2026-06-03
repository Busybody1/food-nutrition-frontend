'use client'

import { useEffect, useState } from 'react'
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
  AdminRefreshButton,
  DashboardLoading,
  DashboardAlert,
  DashboardEmpty,
} from '@/components/admin/admin-ui'

export default function AdminBillingPage() {
  const [summary, setSummary] = useState<Record<string, unknown>>({})
  const [subs, setSubs] = useState<Array<Record<string, unknown>>>([])
  const [series, setSeries] = useState<Array<Record<string, unknown>>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    setError('')
    Promise.all([
      adminAPI.getRevenueSummary(),
      adminAPI.getSubscriptions({ limit: 50 }),
      adminAPI.getRevenueTimeseries(12),
    ])
      .then(([s, sub, ts]) => {
        setSummary(s)
        setSubs(sub.subscriptions)
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
  }

  useEffect(() => {
    load()
  }, [])

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
          <AdminStatGrid className="mb-6">
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

          <AdminPanel className="mb-6">
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
            <AdminPanelHeader title="Subscriptions" icon={CreditCard} />
            {subs.length === 0 ? (
              <DashboardEmpty icon={CreditCard} title="No subscriptions" />
            ) : (
              <AdminPanelBody noPadding>
                <AdminTableWrap>
                  <AdminTable>
                    <thead>
                      <tr>
                        <th>Customer</th>
                        <th>Plan</th>
                        <th>Status</th>
                        <th>Period end</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subs.map((s) => (
                        <tr key={String(s.id)}>
                          <td>{String(s.email)}</td>
                          <td>{String(s.plan_name ?? s.plan_id)}</td>
                          <td>
                            <span className="inline-flex rounded-md bg-surface-elevated px-2 py-0.5 text-xs font-medium capitalize">
                              {String(s.status)}
                            </span>
                          </td>
                          <td className="text-ink-muted">
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
            )}
          </AdminPanel>
        </>
      )}
    </AdminPage>
  )
}
