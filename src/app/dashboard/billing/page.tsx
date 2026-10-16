'use client'

import { useState, useEffect, useCallback, Suspense, type ReactNode } from 'react'
import { useAuth } from '@/lib/hooks/use-auth'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { PaymentErrorMessage } from '@/components/ui/error-message'
import {
  DASHBOARD_ICON_STROKE,
  DashboardPage,
  DashboardPageHeader,
  DashboardPanel,
  DashboardPanelHeader,
  DashboardPanelBody,
  DashboardTableWrap,
  DashboardTable,
  DashboardPill,
  DashboardIconTile,
  DashboardStatList,
  DashboardEmpty,
  DashboardLoading,
  DashboardAlert,
  DashboardProgress,
} from '@/components/dashboard/dashboard-shell'
import {
  Check,
  CheckCircle,
  CreditCard,
  DollarSign,
  Download,
  ExternalLink,
  Gauge,
  Layers,
  ListChecks,
  Receipt,
  RefreshCw,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { fetchPublicPlans } from '@/lib/pricing/fetch-plans'
import {
  formatPlanPrice,
  formatResultsPerQuery,
  getPlanCardHighlights,
  isContactSalesPlan,
  resolveResultsPerQuery,
  type PricingPlan,
} from '@/lib/pricing/plan-display'
import { ScheduleCallDialog } from '@/components/marketing/schedule-call-dialog'

const API_KEY_LIMIT_FALLBACK: Record<string, number> = {
  free: 1,
  basic: 3,
  core: 10,
  plus: 25,
  enterprise: 100,
  custom: 100,
}

function apiKeyLimitText(planName: string, maxApiKeys?: number): string {
  const count =
    maxApiKeys != null && maxApiKeys > 0
      ? maxApiKeys
      : API_KEY_LIMIT_FALLBACK[planName.toLowerCase()] ?? 1
  return `Up to ${count} API key${count === 1 ? '' : 's'}`
}

function foodsPerQueryText(planName: string, plans: PricingPlan[]): string {
  const match = plans.find((p) => p.name.toLowerCase() === planName.toLowerCase())
  return `${formatResultsPerQuery(resolveResultsPerQuery(planName, match?.max_results_per_query))} per query`
}

interface BillingInfo {
  user_id: number
  plan_name: string
  plan_price: number
  stripe_customer_id: string | null
  subscription_status: string | null
  next_billing_date: string | null
  current_usage: number
  usage_limit: number
  rate_limit_per_minute?: number
  max_api_keys?: number
}

interface Invoice {
  stripe_event_id: string
  event_type: string | null
  amount: number | null
  currency: string | null
  description: string | null
  created_at: string | null
}

interface UsageStats {
  requests_this_month: number
  monthly_quota: number
  rate_limit_per_minute?: number
  plan_name?: string
}

type FeatureGroup = { heading: string; items: string[] }

const HEADER_BUTTON = 'h-9 gap-1.5'

function UsageFigure({
  label,
  value,
  hint,
  children,
}: {
  label: string
  value: string
  hint?: string
  children?: ReactNode
}) {
  return (
    <div className="min-w-0 sm:px-5 sm:first:pl-0 sm:last:pr-0">
      <p className="text-xs font-medium text-dash-muted">{label}</p>
      <p className="dashboard-summary-value mt-1.5">{value}</p>
      {hint && <p className="mt-1 text-xs text-dash-muted">{hint}</p>}
      {children}
    </div>
  )
}

function UsageThisMonthCard({ used, limit }: { used: number; limit: number }) {
  const safeLimit = limit > 0 ? limit : 1
  const pct = Math.min(100, (used / safeLimit) * 100)
  const remaining = Math.max(0, limit - used)

  return (
    <DashboardPanel>
      <DashboardPanelHeader title="Usage this month" icon={Gauge} />
      <DashboardPanelBody>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-dash-border/70">
          <UsageFigure
            label="Requests used"
            value={used.toLocaleString()}
            hint={`of ${limit.toLocaleString()} total`}
          />
          <UsageFigure label="Usage percentage" value={`${pct.toFixed(1)}%`}>
            <DashboardProgress value={used} max={limit} className="mt-3" />
          </UsageFigure>
          <UsageFigure
            label="Remaining"
            value={remaining.toLocaleString()}
            hint="requests this month"
          />
        </div>
      </DashboardPanelBody>
    </DashboardPanel>
  )
}

function CurrentPlanPanel({
  planName,
  price,
  statusLabel,
  statusTone,
  nextBilling,
  noBillingRequired,
  actions,
}: {
  planName: string
  price: string
  statusLabel: string
  statusTone: 'green' | 'orange'
  nextBilling?: string | null
  noBillingRequired: boolean
  actions: ReactNode
}) {
  const rows: { label: string; value: ReactNode }[] = [
    { label: 'Status', value: <DashboardPill tone={statusTone}>{statusLabel}</DashboardPill> },
  ]
  if (nextBilling) rows.push({ label: 'Next billing', value: nextBilling })
  if (noBillingRequired) rows.push({ label: 'Billing', value: 'No billing required' })

  return (
    <DashboardPanel>
      <DashboardPanelHeader title="Current plan" icon={DollarSign} actions={actions} />
      <DashboardPanelBody>
        <div className="grid gap-5 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] sm:items-center">
          <div className="rounded-xl bg-dash-hover px-4 py-4">
            <h3 className="truncate text-[15px] font-semibold text-dash-ink">{planName}</h3>
            <p className="dashboard-summary-value mt-2">{price}</p>
            <p className="mt-0.5 text-xs text-dash-muted">per month</p>
          </div>
          <DashboardStatList items={rows} />
        </div>
      </DashboardPanelBody>
    </DashboardPanel>
  )
}

function PaymentMethodPanel({ onUpdate }: { onUpdate: () => void }) {
  return (
    <DashboardPanel>
      <DashboardPanelHeader
        title="Payment method"
        icon={CreditCard}
        actions={
          <Button variant="outline" size="sm" onClick={onUpdate} className={HEADER_BUTTON}>
            <ExternalLink className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} />
            Update
          </Button>
        }
      />
      <DashboardPanelBody>
        <div className="flex items-center gap-3 rounded-xl border border-dash-border bg-dash-hover px-4 py-3">
          <span className="flex h-9 w-14 shrink-0 items-center justify-center rounded-lg border border-dash-border bg-white">
            <CreditCard className="h-5 w-5 text-dash-dim" strokeWidth={DASHBOARD_ICON_STROKE} aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium tabular-nums text-dash-ink">•••• •••• •••• 4242</p>
            <p className="text-xs text-dash-muted">Expires 12/25</p>
          </div>
        </div>
      </DashboardPanelBody>
    </DashboardPanel>
  )
}

function PlanFeaturesPanel({ title, groups }: { title: string; groups: FeatureGroup[] }) {
  return (
    <DashboardPanel>
      <DashboardPanelHeader title={title} icon={ListChecks} />
      <DashboardPanelBody>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-1">
          {groups.map((group) => (
            <div key={group.heading} className="min-w-0">
              <h3 className="mb-2.5 text-[13px] font-semibold text-dash-ink">{group.heading}</h3>
              <ul className="space-y-2">
                {group.items.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-[13px] text-dash-body">
                    <CheckCircle
                      className="h-4 w-4 shrink-0 text-dash-positive"
                      strokeWidth={DASHBOARD_ICON_STROKE}
                      aria-hidden
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </DashboardPanelBody>
    </DashboardPanel>
  )
}

function BillingPlanCard({
  plan,
  currentPlanName,
  onSelect,
}: {
  plan: PricingPlan
  currentPlanName: string
  onSelect: (planId: number) => void
}) {
  const isCurrent = currentPlanName.toLowerCase() === plan.name.toLowerCase()
  const { amount, suffix } = formatPlanPrice(plan)
  const highlights = getPlanCardHighlights(
    plan.name,
    plan.monthly_quota,
    plan.rate_limit_per_minute,
    plan.max_api_keys,
    plan.max_results_per_query
  )
  const contactSales = isContactSalesPlan(plan.name)

  return (
    <div
      className={cn(
        'flex min-w-0 flex-col rounded-xl border p-4 transition-colors',
        isCurrent
          ? 'border-dash-teal/50 bg-dash-teal-soft/40'
          : 'border-dash-border bg-white hover:border-dash-border-strong'
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="truncate text-[15px] font-semibold text-dash-ink">{plan.name}</h4>
          <p className="mt-1 text-2xl font-semibold tracking-[-0.02em] tabular-nums text-dash-ink">
            {amount}
            {suffix && (
              <span className="text-xs font-normal tracking-normal text-dash-muted"> {suffix.replace('/mo', 'per month')}</span>
            )}
          </p>
        </div>
        {isCurrent && <DashboardPill tone="brand">Current</DashboardPill>}
      </div>
      <ul className="mb-4 space-y-1.5 text-[13px] text-dash-body">
        {highlights.slice(0, 4).map((item) => (
          <li key={item} className="flex items-start gap-2">
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-dash-teal-strong" strokeWidth={2} aria-hidden />
            <span className="min-w-0">{item}</span>
          </li>
        ))}
      </ul>
      <Button
        onClick={() => onSelect(plan.id)}
        variant={isCurrent ? 'outline' : 'default'}
        disabled={isCurrent}
        size="sm"
        className="mt-auto h-9 w-full"
      >
        {isCurrent ? 'Current Plan' : contactSales ? 'Schedule a call' : `Switch to ${plan.name}`}
      </Button>
    </div>
  )
}

function BillingPageContent() {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null)
  const [availablePlans, setAvailablePlans] = useState<PricingPlan[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isScheduleOpen, setIsScheduleOpen] = useState(false)

  const loadBillingData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError('')

      const { api } = await import('@/lib/api/client')

      const [profileResponse, usageResponse, plans] = await Promise.all([
        api.user.getProfile(),
        api.usage.getUsageStats(),
        fetchPublicPlans().catch(() => [] as PricingPlan[]),
      ])
      setAvailablePlans(plans.filter((p) => p.monthly_price > 0 || p.name.toLowerCase() !== 'free'))

      if (!profileResponse.success) {
        throw new Error('Failed to load user profile')
      }

      const userProfile = profileResponse.data as {
        plan?: {
          name?: string
          monthly_price?: number
          monthly_quota?: number
          max_api_keys?: number
        }
      }
      const usageStats = (usageResponse.success
        ? usageResponse.data
        : null) as UsageStats | null

      const planName = userProfile.plan?.name || usageStats?.plan_name || 'Free'
      const isFreePlan = planName === 'Free' || (userProfile.plan?.monthly_price || 0) === 0
      const currentUsage = usageStats?.requests_this_month ?? 0
      const usageLimit =
        usageStats?.monthly_quota ?? userProfile.plan?.monthly_quota ?? 1000
      const rateLimit = usageStats?.rate_limit_per_minute

      const maxApiKeys = userProfile.plan?.max_api_keys

      if (isFreePlan) {
        const billingInfo: BillingInfo = {
          user_id: user?.id || 0,
          plan_name: planName,
          plan_price: userProfile.plan?.monthly_price || 0,
          stripe_customer_id: '',
          subscription_status: 'inactive',
          next_billing_date: '',
          current_usage: currentUsage,
          usage_limit: usageLimit,
          rate_limit_per_minute: rateLimit,
          max_api_keys: maxApiKeys,
        }
        setBillingInfo(billingInfo)
        setInvoices([])
      } else {

        try {
          const [billingResponse, invoicesResponse] = await Promise.all([
            api.billing.getSubscription(),
            api.billing.getInvoices()
          ])

          if (billingResponse.success) {
            const subscription = billingResponse.data as {
              plan_name?: string;
              monthly_price?: number;
              stripe_customer_id?: string;
              status?: string;
              current_period_end?: string;
              monthly_quota?: number;
            }
            const billingInfo: BillingInfo = {
              user_id: user?.id || 0,
              plan_name: subscription.plan_name || planName,
              plan_price: subscription.monthly_price || 0,
              stripe_customer_id: subscription.stripe_customer_id || '',
              subscription_status: subscription.status || 'inactive',
              next_billing_date: subscription.current_period_end || '',
              current_usage: currentUsage,
              usage_limit: subscription.monthly_quota || usageLimit,
              rate_limit_per_minute: rateLimit,
              max_api_keys: maxApiKeys,
            }
            setBillingInfo(billingInfo)
          }

          if (invoicesResponse.success) {
            const invoices = invoicesResponse.data as Invoice[]
            setInvoices(invoices)
          }
        } catch {

          const billingInfo: BillingInfo = {
            user_id: user?.id || 0,
            plan_name: planName,
            plan_price: userProfile.plan?.monthly_price || 0,
            stripe_customer_id: '',
            subscription_status: 'inactive',
            next_billing_date: '',
            current_usage: currentUsage,
            usage_limit: usageLimit,
            rate_limit_per_minute: rateLimit,
            max_api_keys: maxApiKeys,
          }
          setBillingInfo(billingInfo)
          setInvoices([])
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load billing data')
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isAuthenticated, loading, router])

  useEffect(() => {
    if (!loading && isAuthenticated) {
      /* eslint-disable-next-line react-hooks/set-state-in-effect */
      loadBillingData()
    }
  }, [isAuthenticated, loading, loadBillingData])

  useEffect(() => {
    const success = searchParams.get('success')
    const canceled = searchParams.get('canceled')

    if (success === 'true') {
      /* eslint-disable-next-line react-hooks/set-state-in-effect */
      setSuccessMessage('Payment successful! Your subscription has been activated.')

      router.replace('/dashboard/billing')
    } else if (canceled === 'true') {
      setError('Payment was canceled. You can try again anytime.')

      router.replace('/dashboard/billing')
    }
  }, [searchParams, router])

  const handleManageBilling = async () => {
    try {

      const { api } = await import('@/lib/api/client')

      const response = await api.billing.createCustomerPortalSession()
      const portalUrl = (response.data as { url: string }).url
      window.open(portalUrl, '_blank')
    } catch (err) {
      console.error('Failed to open billing portal:', err)
    }
  }

  const handleUpgrade = () => {
    router.push('/pricing')
  }

  const handleUpgradeToPlan = (planId: number) => {
    router.push(`/pricing?plan_id=${planId}`)
  }

  const handleEnterpriseOrPlan = (planId: number, fallback: (id: number) => void) => {
    const plan = availablePlans.find((item) => item.id === planId)
    if (plan && isContactSalesPlan(plan.name)) {
      setIsScheduleOpen(true)
      return
    }
    fallback(planId)
  }

  const handlePlanChange = async (newPlanId: number) => {
    try {

      const { api } = await import('@/lib/api/client')

      const response = await api.billing.updateSubscription(newPlanId)

      if (response.success) {
        setSuccessMessage('Plan updated successfully!')

        await loadBillingData()
      } else {
        setError('Failed to update plan. Please try again.')
      }
    } catch (err) {
      console.error('Failed to update plan:', err)
      setError('Failed to update plan. Please try again.')
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number | null | undefined, currency: string = 'usd') => {
    if (amount === null || amount === undefined) return '$0.00'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount)
  }

  const getStatusTone = (): 'green' | 'orange' => {

    if (billingInfo && (billingInfo.plan_name !== 'Free' && billingInfo.plan_price > 0)) {
      return 'green'
    }

    return 'orange'
  }

  if (loading || isLoading) {
    return <DashboardLoading message="Loading billing..." />
  }

  if (!isAuthenticated) {
    return null
  }

  const isPaidPlan =
    billingInfo !== null && billingInfo.plan_name !== 'Free' && billingInfo.plan_price > 0

  const currentFeatureGroups: FeatureGroup[] = billingInfo
    ? [
        {
          heading: 'API Access',
          items: ['Food & Nutrition Search', 'UPC Lookup', 'Autocomplete API', 'Advanced Analytics'],
        },
        {
          heading: 'Support & Limits',
          items: [
            'Priority Support',
            `${billingInfo.rate_limit_per_minute || 100} requests/minute`,
            foodsPerQueryText(billingInfo.plan_name, availablePlans),
            `${billingInfo.usage_limit?.toLocaleString() || '750,000'} requests/month`,
            apiKeyLimitText(billingInfo.plan_name, billingInfo.max_api_keys),
          ],
        },
      ]
    : []

  const freeFeatureGroups: FeatureGroup[] = [
    {
      heading: 'API Access',
      items: ['Food & Nutrition Search', 'UPC Lookup', 'Autocomplete API', 'Basic Analytics'],
    },
    {
      heading: 'Limits',
      items: ['Community Support', '10 requests/minute', '1,000 requests/month', apiKeyLimitText('Free')],
    },
  ]

  const invoiceCount = `${invoices.length} ${invoices.length === 1 ? 'entry' : 'entries'}`

  return (
    <DashboardPage>
        <DashboardPageHeader
          title="Billing"
          description={
            billingInfo?.plan_name === 'Free' || (billingInfo?.plan_price || 0) === 0
              ? 'View your plan and upgrade when you need more capacity.'
              : 'Manage subscription, invoices, and payment methods.'
          }
          meta={
            billingInfo ? (
              <span className="dashboard-meta-pill tabular-nums">
                {billingInfo.plan_name} · {formatCurrency(billingInfo.plan_price)}/mo
              </span>
            ) : undefined
          }
        >
          <Button variant="outline" size="sm" onClick={loadBillingData} disabled={isLoading} className={HEADER_BUTTON}>
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
              strokeWidth={DASHBOARD_ICON_STROKE}
            />
            Refresh
          </Button>
          {billingInfo?.plan_name !== 'Free' && (billingInfo?.plan_price || 0) > 0 && (
            <Button size="sm" onClick={handleManageBilling} className={HEADER_BUTTON}>
              <CreditCard className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} />
              Manage billing
            </Button>
          )}
        </DashboardPageHeader>

        {successMessage && (
          <DashboardAlert variant="success">
            <span className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 shrink-0" strokeWidth={DASHBOARD_ICON_STROKE} />
              {successMessage}
            </span>
          </DashboardAlert>
        )}

        {error && !billingInfo && <DashboardAlert variant="error">{error}</DashboardAlert>}

        {billingInfo ? (
          <>
            <div className="dashboard-grid-wide">
              <CurrentPlanPanel
                planName={billingInfo.plan_name}
                price={formatCurrency(billingInfo.plan_price)}
                statusLabel={
                  billingInfo.plan_name === 'Free' || billingInfo.plan_price === 0
                    ? 'Free Plan'
                    : 'Active'
                }
                statusTone={getStatusTone()}
                nextBilling={
                  billingInfo.next_billing_date && billingInfo.plan_price > 0
                    ? formatDate(billingInfo.next_billing_date)
                    : null
                }
                noBillingRequired={billingInfo.plan_name === 'Free' || billingInfo.plan_price === 0}
                actions={
                  <>
                    <Button variant="outline" size="sm" onClick={handleUpgrade} className={HEADER_BUTTON}>
                      Upgrade Plan
                    </Button>
                    {isPaidPlan && (
                      <Button variant="outline" size="sm" onClick={handleManageBilling} className={HEADER_BUTTON}>
                        Manage
                      </Button>
                    )}
                  </>
                }
              />
              {isPaidPlan ? (
                <PaymentMethodPanel onUpdate={handleManageBilling} />
              ) : (
                <PlanFeaturesPanel title="Current plan features" groups={currentFeatureGroups} />
              )}
            </div>

            {isPaidPlan ? (
              <div className="dashboard-grid-wide">
                <UsageThisMonthCard
                  used={billingInfo.current_usage}
                  limit={billingInfo.usage_limit}
                />
                <PlanFeaturesPanel title="Current plan features" groups={currentFeatureGroups} />
              </div>
            ) : (
              <UsageThisMonthCard
                used={billingInfo.current_usage}
                limit={billingInfo.usage_limit}
              />
            )}

            {isPaidPlan && (
              <DashboardPanel>
                <DashboardPanelHeader
                  title="Billing history"
                  icon={Receipt}
                  description={invoices.length > 0 ? invoiceCount : undefined}
                  actions={
                    <Button variant="outline" size="sm" className={HEADER_BUTTON}>
                      <Download className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} />
                      Export
                    </Button>
                  }
                />
                {invoices.length === 0 ? (
                  <DashboardPanelBody>
                    <DashboardEmpty icon={Receipt} title="No billing history available" />
                  </DashboardPanelBody>
                ) : (
                  <DashboardPanelBody flush>
                    <DashboardTableWrap>
                      <DashboardTable>
                        <thead>
                          <tr>
                            <th>Description</th>
                            <th>Date</th>
                            <th>Event</th>
                            <th className="dashboard-num">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {invoices.map((invoice, index) => (
                            <tr key={index}>
                              <td>
                                <div className="flex min-w-0 items-center gap-3">
                                  <DashboardIconTile icon={CheckCircle} tone="green" />
                                  <span className="truncate font-medium text-dash-ink">
                                    {invoice.description || 'No description'}
                                  </span>
                                </div>
                              </td>
                              <td className="whitespace-nowrap text-dash-muted">
                                {formatDate(invoice.created_at)}
                              </td>
                              <td>
                                <DashboardPill tone="neutral">
                                  {invoice.event_type?.replace('.', ' ').toUpperCase() || 'UNKNOWN'}
                                </DashboardPill>
                              </td>
                              <td className="dashboard-num whitespace-nowrap font-medium text-dash-ink">
                                {formatCurrency(invoice.amount, invoice.currency || 'usd')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </DashboardTable>
                    </DashboardTableWrap>
                  </DashboardPanelBody>
                )}
              </DashboardPanel>
            )}

            <DashboardPanel>
              <DashboardPanelHeader title="Plan management" icon={Layers} />
              <DashboardPanelBody>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {availablePlans
                    .filter((p) => p.name.toLowerCase() !== 'free')
                    .map((plan) => (
                      <BillingPlanCard
                        key={plan.id}
                        plan={plan}
                        currentPlanName={billingInfo.plan_name}
                        onSelect={(planId) => handleEnterpriseOrPlan(planId, handlePlanChange)}
                      />
                    ))}
                </div>
              </DashboardPanelBody>
            </DashboardPanel>
          </>
        ) : (
          <>
            <div className="dashboard-grid-wide">
              <CurrentPlanPanel
                planName="Free Plan"
                price="$0.00"
                statusLabel="Free Plan"
                statusTone="green"
                noBillingRequired
                actions={
                  <Button size="sm" onClick={handleUpgrade} className={HEADER_BUTTON}>
                    Upgrade Plan
                  </Button>
                }
              />
              <PlanFeaturesPanel title="Free plan features" groups={freeFeatureGroups} />
            </div>

            <UsageThisMonthCard used={0} limit={1000} />

            <DashboardPanel>
              <DashboardPanelHeader
                title="Upgrade options"
                icon={Layers}
                actions={
                  <Button variant="outline" size="sm" onClick={handleUpgrade} className={HEADER_BUTTON}>
                    View All Plans
                  </Button>
                }
              />
              <DashboardPanelBody>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {availablePlans
                    .filter((p) => p.name.toLowerCase() !== 'free')
                    .slice(0, 2)
                    .map((plan) => (
                      <BillingPlanCard
                        key={plan.id}
                        plan={plan}
                        currentPlanName="Free"
                        onSelect={(planId) => handleEnterpriseOrPlan(planId, handleUpgradeToPlan)}
                      />
                    ))}
                </div>
              </DashboardPanelBody>
            </DashboardPanel>
          </>
        )}
      <ScheduleCallDialog isOpen={isScheduleOpen} onClose={() => setIsScheduleOpen(false)} />
    </DashboardPage>
  )
}

export default function BillingPage() {
  return (
    <ErrorBoundary fallback={<PaymentErrorMessage />}>
      <Suspense fallback={<DashboardLoading message="Loading billing page..." />}>
        <BillingPageContent />
      </Suspense>
    </ErrorBoundary>
  )
}
