'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DashboardPage as DashboardShell,
  DashboardPageHeader,
  DashboardStatCard,
  DashboardLoading,
  DashboardAlert,
  DashboardProgress,
  DashboardQuickAction,
  DashboardEmpty,
} from '@/components/dashboard/dashboard-shell'
import {
  Key,
  BarChart3,
  CreditCard,
  Activity,
  TrendingUp,
  RefreshCw,
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

  useEffect(() => {
    if (!loading && isAuthenticated) {
      loadDashboardData()
    }
  }, [isAuthenticated, loading])

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

  if (loading || isLoading) {
    return <DashboardLoading message="Loading dashboard..." />
  }

  if (!isAuthenticated) return null

  const usagePct =
    stats && stats.monthlyQuota > 0
      ? Math.min((stats.requestsThisMonth / stats.monthlyQuota) * 100, 100)
      : 0

  return (
    <DashboardShell>
      <DashboardPageHeader
        title={`Welcome back${user?.first_name ? `, ${user.first_name}` : ''}`}
        description="Monitor API usage, manage keys, and billing from one place."
      >
        <Button
          variant="outline"
          size="sm"
          onClick={loadDashboardData}
          disabled={isLoading}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </DashboardPageHeader>

      {error && <DashboardAlert variant="error">{error}</DashboardAlert>}

      {stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <DashboardStatCard
              label="API keys"
              value={`${stats.activeApiKeys} / ${stats.totalApiKeys}`}
              hint="Active keys"
              icon={Key}
              accent="brand"
            />
            <DashboardStatCard
              label="This month"
              value={stats.requestsThisMonth.toLocaleString()}
              hint="API requests"
              icon={BarChart3}
              accent="green"
            />
            <DashboardStatCard
              label="Quota used"
              value={`${usagePct.toFixed(1)}%`}
              hint={`${stats.monthlyQuota.toLocaleString()} monthly limit`}
              icon={TrendingUp}
              accent="purple"
            />
            <DashboardStatCard
              label="Current plan"
              value={stats.planName}
              hint={stats.planPrice > 0 ? `$${stats.planPrice}/mo` : 'Free tier'}
              icon={CreditCard}
              accent="orange"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="dashboard-panel">
              <div className="dashboard-panel-header">
                <h2 className="dashboard-panel-title">Quick actions</h2>
              </div>
              <div className="dashboard-panel-body space-y-2">
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
              </div>
            </div>

            <div className="dashboard-panel">
              <div className="dashboard-panel-header">
                <h2 className="dashboard-panel-title">Monthly usage</h2>
                <span className="text-xs font-medium text-ink-muted tabular-nums">
                  {stats.requestsThisMonth.toLocaleString()} / {stats.monthlyQuota.toLocaleString()}
                </span>
              </div>
              <div className="dashboard-panel-body space-y-5">
                <div>
                  <div className="flex justify-between text-xs text-ink-muted mb-2">
                    <span>Consumed</span>
                    <span className="font-medium text-ink">{usagePct.toFixed(1)}%</span>
                  </div>
                  <DashboardProgress
                    value={stats.requestsThisMonth}
                    max={stats.monthlyQuota}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-brand bg-surface-elevated px-4 py-3">
                    <p className="text-xs text-ink-muted">Remaining</p>
                    <p className="text-lg font-semibold text-ink tabular-nums mt-0.5">
                      {Math.max(0, stats.monthlyQuota - stats.requestsThisMonth).toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-brand bg-surface-elevated px-4 py-3">
                    <p className="text-xs text-ink-muted">Resets</p>
                    <p className="text-lg font-semibold text-ink mt-0.5">
                      {new Date(
                        new Date().getFullYear(),
                        new Date().getMonth() + 1,
                        1
                      ).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="dashboard-panel">
            <div className="dashboard-panel-header">
              <h2 className="dashboard-panel-title">Recent activity</h2>
              <Button variant="ghost" size="sm" onClick={loadDashboardData} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            <div className="dashboard-panel-body">
              {stats.recentActivity.length === 0 ? (
                <DashboardEmpty
                  icon={Activity}
                  title="No activity yet"
                  description="API key events and usage alerts will show up here."
                />
              ) : (
                <ul className="space-y-3">
                  {stats.recentActivity.map((activity) => (
                    <li
                      key={activity.id}
                      className="flex items-start justify-between gap-3 py-2 border-b border-surface-border/50 last:border-0"
                    >
                      <p className="text-sm text-ink">{activity.message}</p>
                      <Badge variant="secondary">{activity.type.replace('_', ' ')}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  )
}
