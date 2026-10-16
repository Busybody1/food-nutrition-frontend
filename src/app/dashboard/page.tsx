'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { formatCompact } from '@/components/dashboard/dashboard-charts'
import {
  DashboardPage as DashboardShell,
  DashboardPageHeader,
  DashboardPageSkeleton,
  DashboardStatCard,
  DashboardAlert,
  DashboardProgress,
  DashboardQuickAction,
  DashboardEmpty,
  DashboardPanel,
  DashboardPanelHeader,
  DashboardPanelBody,
  DashboardPill,
  DASHBOARD_ICON_STROKE,
} from '@/components/dashboard/dashboard-shell'
import {
  Key,
  BarChart3,
  CreditCard,
  Activity,
  Gauge,
  RefreshCw,
  Zap,
  ArrowUpRight,
} from 'lucide-react'

interface ApiKey {
  id: number
  is_active: boolean
}

interface UsageStats {
  requests_this_month: number
  monthly_quota: number
}

interface UserProfile {
  plan: {
    name: string
    monthly_price: number
  }
}

interface ActivityItem {
  id: string
  type: 'api_key_created' | 'api_key_used' | 'quota_warning' | 'payment_success'
  message: string
  timestamp: string
}

interface DashboardStats {
  totalApiKeys: number
  activeApiKeys: number
  requestsThisMonth: number
  monthlyQuota: number
  planName: string
  planPrice: number
  recentActivity: ActivityItem[]
}

export default function DashboardPage() {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isAuthenticated, loading, router])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      setError('')
      const { api } = await import('@/lib/api/client')
      const [apiKeysResponse, usageResponse, profileResponse] = await Promise.all([
        api.apiKeys.list(),
        api.usage.getUsageStats(),
        api.user.getProfile(),
      ])

      let apiKeys: ApiKey[] = []
      let usageStats: UsageStats = { requests_this_month: 0, monthly_quota: 1000 }
      let userProfile: UserProfile = { plan: { name: 'Free', monthly_price: 0 } }

      if (apiKeysResponse.success) {
        const { normalizeApiKeyList } = await import('@/lib/api/api-keys')
        apiKeys = normalizeApiKeyList(apiKeysResponse.data) as ApiKey[]
      } else {
        throw new Error(`API Keys: ${apiKeysResponse.message || 'Failed to load API keys'}`)
      }

      if (usageResponse.success) {
        usageStats = usageResponse.data as UsageStats
      } else {
        throw new Error(`Usage Stats: ${usageResponse.message || 'Failed to load usage stats'}`)
      }

      if (profileResponse.success) {
        userProfile = profileResponse.data as UserProfile
      } else {
        throw new Error(`Profile: ${profileResponse.message || 'Failed to load profile'}`)
      }

      setStats({
        totalApiKeys: apiKeys.length,
        activeApiKeys: apiKeys.filter((key) => key.is_active).length,
        requestsThisMonth: usageStats.requests_this_month,
        monthlyQuota: usageStats.monthly_quota,
        planName: userProfile.plan.name,
        planPrice: userProfile.plan.monthly_price,
        recentActivity: [],
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!loading && isAuthenticated) {
      /* eslint-disable-next-line react-hooks/set-state-in-effect */
      loadDashboardData()
    }
  }, [isAuthenticated, loading])

  if (loading || isLoading) {
    return <DashboardPageSkeleton kpis={3} label="Loading dashboard..." />
  }

  if (!isAuthenticated) return null

  const usagePct =
    stats && stats.monthlyQuota > 0
      ? Math.min((stats.requestsThisMonth / stats.monthlyQuota) * 100, 100)
      : 0

  const resetDate = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    1
  ).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  const planMeta = stats ? (
    <Link
      href="/dashboard/billing"
      className="dashboard-meta-pill transition-colors hover:bg-dash-hover"
      title="Current plan"
    >
      <CreditCard className="h-3.5 w-3.5 text-dash-muted" strokeWidth={DASHBOARD_ICON_STROKE} aria-hidden />
      <span>{stats.planName}</span>
      <span className="text-dash-dim" aria-hidden>
        ·
      </span>
      <span className="tabular-nums text-dash-muted">
        {stats.planPrice > 0 ? `$${stats.planPrice}/mo` : 'Free tier'}
      </span>
    </Link>
  ) : undefined

  return (
    <DashboardShell>
      <DashboardPageHeader
        title={`Welcome back${user?.first_name ? `, ${user.first_name}` : ''}`}
        description="Monitor API usage, manage keys, and billing from one place."
        meta={planMeta}
      >
        <Button
          variant="outline"
          size="sm"
          onClick={loadDashboardData}
          disabled={isLoading}
          className="h-9 gap-1.5"
        >
          <RefreshCw
            className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
            strokeWidth={DASHBOARD_ICON_STROKE}
          />
          Refresh
        </Button>
      </DashboardPageHeader>

      {error && <DashboardAlert variant="error">{error}</DashboardAlert>}

      {stats && (
        <>
          <div className="dashboard-grid-kpi">
            <DashboardStatCard
              label="Requests this month"
              value={stats.requestsThisMonth.toLocaleString()}
              hint="API requests"
              icon={Activity}
              accent="brand"
            />
            <DashboardStatCard
              label="Quota used"
              value={`${usagePct.toFixed(1)}%`}
              hint={`${stats.monthlyQuota.toLocaleString()} monthly limit`}
              icon={Gauge}
              accent="indigo"
            />
            <DashboardStatCard
              label="Active API keys"
              value={stats.activeApiKeys.toLocaleString()}
              hint={`${stats.activeApiKeys} / ${stats.totalApiKeys} keys active`}
              icon={Key}
              accent="green"
            />
          </div>

          <div className="dashboard-grid-wide">
            <DashboardPanel className="flex flex-col">
              <DashboardPanelHeader
                title="Monthly usage"
                icon={BarChart3}
                description={`Resets ${resetDate}`}
                actions={
                  <Button asChild variant="outline" size="sm" className="h-9 gap-1.5">
                    <Link href="/dashboard/usage">
                      Usage details
                      <ArrowUpRight className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} aria-hidden />
                    </Link>
                  </Button>
                }
              />
              <DashboardPanelBody className="flex flex-1 flex-col">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="dashboard-summary-value">
                      {stats.requestsThisMonth.toLocaleString()}
                    </p>
                    <p className="mt-0.5 text-xs text-dash-muted tabular-nums">
                      of {stats.monthlyQuota.toLocaleString()} requests
                    </p>
                  </div>
                  <DashboardPill tone={usagePct >= 90 ? 'rose' : usagePct >= 75 ? 'orange' : 'brand'}>
                    <span className="tabular-nums">{usagePct.toFixed(1)}%</span> consumed
                  </DashboardPill>
                </div>
                <DashboardProgress
                  className="mt-5 h-3"
                  value={stats.requestsThisMonth}
                  max={stats.monthlyQuota}
                />
                <div className="mt-2 flex justify-between text-[11px] tabular-nums text-dash-dim" aria-hidden>
                  {[0, 0.25, 0.5, 0.75, 1].map((step) => (
                    <span key={step}>{formatCompact(stats.monthlyQuota * step)}</span>
                  ))}
                </div>
                <div className="mt-auto grid grid-cols-1 gap-3 pt-6 sm:grid-cols-3">
                  <div className="rounded-xl bg-dash-hover px-4 py-3">
                    <p className="text-xs text-dash-muted">Remaining</p>
                    <p className="mt-0.5 text-lg font-semibold leading-7 text-dash-ink tabular-nums">
                      {Math.max(0, stats.monthlyQuota - stats.requestsThisMonth).toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-xl bg-dash-hover px-4 py-3">
                    <p className="text-xs text-dash-muted">Monthly limit</p>
                    <p className="mt-0.5 text-lg font-semibold leading-7 text-dash-ink tabular-nums">
                      {stats.monthlyQuota.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-xl bg-dash-hover px-4 py-3">
                    <p className="text-xs text-dash-muted">Resets</p>
                    <p className="mt-0.5 text-lg font-semibold leading-7 text-dash-ink">{resetDate}</p>
                  </div>
                </div>
              </DashboardPanelBody>
            </DashboardPanel>

            <DashboardPanel>
              <DashboardPanelHeader title="Quick actions" icon={Zap} />
              <DashboardPanelBody className="space-y-2">
                <DashboardQuickAction
                  href="/dashboard/api-keys"
                  icon={Key}
                  title="Manage API keys"
                  description="Create, rotate, and revoke keys"
                />
                <DashboardQuickAction
                  href="/dashboard/usage"
                  icon={BarChart3}
                  title="Usage analytics"
                  description="Charts and endpoint breakdown"
                />
                <DashboardQuickAction
                  href="/pricing"
                  icon={CreditCard}
                  title="Upgrade plan"
                  description="Higher limits and priority support"
                  primary
                />
                <DashboardQuickAction
                  href="/dashboard/billing"
                  icon={CreditCard}
                  title="Billing & invoices"
                  description="Payment methods and subscription"
                />
              </DashboardPanelBody>
            </DashboardPanel>
          </div>

          <DashboardPanel>
            <DashboardPanelHeader
              title="Recent activity"
              icon={Activity}
              actions={
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadDashboardData}
                  disabled={isLoading}
                  className="h-8 w-8 p-0"
                  aria-label="Refresh activity"
                  title="Refresh activity"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
                    strokeWidth={DASHBOARD_ICON_STROKE}
                  />
                </Button>
              }
            />
            <DashboardPanelBody>
              {stats.recentActivity.length === 0 ? (
                <DashboardEmpty
                  icon={Activity}
                  title="No activity yet"
                  description="API key events and usage alerts will show up here."
                  className="py-8"
                />
              ) : (
                <ul>
                  {stats.recentActivity.map((activity) => (
                    <li key={activity.id} className="dashboard-activity-item items-center justify-between">
                      <p className="text-[13px] text-dash-ink">{activity.message}</p>
                      <DashboardPill tone="neutral">{activity.type.replace('_', ' ')}</DashboardPill>
                    </li>
                  ))}
                </ul>
              )}
            </DashboardPanelBody>
          </DashboardPanel>
        </>
      )}
    </DashboardShell>
  )
}
