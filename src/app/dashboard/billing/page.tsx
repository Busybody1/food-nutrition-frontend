'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useAuth } from '@/lib/hooks/use-auth'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { PaymentErrorMessage } from '@/components/ui/error-message'
import {
  DashboardPage,
  DashboardPageHeader,
  DashboardLoading,
  DashboardAlert,
  DashboardProgress,
} from '@/components/dashboard/dashboard-shell'
import { 
  CreditCard, DollarSign, 
  CheckCircle, ExternalLink, RefreshCw, Download
} from 'lucide-react'
import { fetchPublicPlans } from '@/lib/pricing/fetch-plans'
import {
  formatPlanPrice,
  getPlanCardHighlights,
  isContactSalesPlan,
  type PricingPlan,
} from '@/lib/pricing/plan-display'

// Per-tier fallback only for when the profile did not carry plans.max_api_keys.
const API_KEY_LIMIT_FALLBACK: Record<string, number> = {
  free: 1,
  basic: 3,
  core: 10,
  plus: 25,
  enterprise: 100,
  custom: 100,
}

/** "Up to 3 API keys" / "Up to 1 API key" — prefers the backend value. */
function apiKeyLimitText(planName: string, maxApiKeys?: number): string {
  const count =
    maxApiKeys != null && maxApiKeys > 0
      ? maxApiKeys
      : API_KEY_LIMIT_FALLBACK[planName.toLowerCase()] ?? 1
  return `Up to ${count} API key${count === 1 ? '' : 's'}`
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

function UsageThisMonthCard({ used, limit }: { used: number; limit: number }) {
  const safeLimit = limit > 0 ? limit : 1
  const pct = Math.min(100, (used / safeLimit) * 100)
  const remaining = Math.max(0, limit - used)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usage This Month</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Requests Used</p>
            <p className="text-2xl font-bold text-gray-900">{used.toLocaleString()}</p>
            <p className="text-sm text-gray-600">of {limit.toLocaleString()} total</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Usage Percentage</p>
            <p className="text-2xl font-bold text-gray-900">{pct.toFixed(1)}%</p>
            <div className="mt-2">
              <DashboardProgress value={used} max={limit} />
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Remaining</p>
            <p className="text-2xl font-bold text-gray-900">{remaining.toLocaleString()}</p>
            <p className="text-sm text-gray-600">requests this month</p>
          </div>
        </div>
      </CardContent>
    </Card>
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
  const highlights = getPlanCardHighlights(plan.name, plan.monthly_quota, plan.rate_limit_per_minute)
  const contactSales = isContactSalesPlan(plan.name)

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-semibold text-gray-900">{plan.name}</h4>
          <p className="text-2xl font-bold text-gray-900">
            {amount}
            {suffix && <span className="text-sm font-normal text-gray-600"> {suffix.replace('/mo', 'per month')}</span>}
          </p>
        </div>
        {isCurrent && <Badge className="bg-green-100 text-green-800">Current</Badge>}
      </div>
      <ul className="text-sm text-gray-600 space-y-1 mb-4">
        {highlights.slice(0, 4).map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
      <Button
        onClick={() => onSelect(plan.id)}
        variant={isCurrent ? 'outline' : 'default'}
        disabled={isCurrent || contactSales}
        className="w-full"
      >
        {isCurrent ? 'Current Plan' : contactSales ? 'Contact sales' : `Switch to ${plan.name}`}
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
      // Backend plans.max_api_keys is the source of truth (only the profile carries it).
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
        // For paid plan users, load subscription and payment methods
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
          // If subscription API fails, fall back to free plan
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

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isAuthenticated, loading, router])

  // Load billing data
  useEffect(() => {
    if (!loading && isAuthenticated) {
      loadBillingData()
    }
  }, [isAuthenticated, loading, loadBillingData])

  // Handle URL parameters for success/cancel redirects
  useEffect(() => {
    const success = searchParams.get('success')
    const canceled = searchParams.get('canceled')
    
    if (success === 'true') {
      setSuccessMessage('Payment successful! Your subscription has been activated.')
      // Clear the URL parameters
      router.replace('/dashboard/billing')
    } else if (canceled === 'true') {
      setError('Payment was canceled. You can try again anytime.')
      // Clear the URL parameters
      router.replace('/dashboard/billing')
    }
  }, [searchParams, router])

  const handleManageBilling = async () => {
    try {
      // Import API client
      const { api } = await import('@/lib/api/client')
      
      // Create customer portal session
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

  const handlePlanChange = async (newPlanId: number) => {
    try {
      // Import API client
      const { api } = await import('@/lib/api/client')
      
      // Update subscription to new plan
      const response = await api.billing.updateSubscription(newPlanId)
      
      if (response.success) {
        setSuccessMessage('Plan updated successfully!')
        // Reload billing data to reflect changes
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

  const getStatusColor = () => {
    // For paid plans, always show green (active)
    if (billingInfo && (billingInfo.plan_name !== 'Free' && billingInfo.plan_price > 0)) {
      return 'bg-green-100 text-green-800'
    }
    
    // For free plans, show yellow
    return 'bg-yellow-100 text-yellow-800'
  }

  if (loading || isLoading) {
    return <DashboardLoading message="Loading billing..." />
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <DashboardPage>
        <DashboardPageHeader
          title="Billing"
          description={
            billingInfo?.plan_name === 'Free' || (billingInfo?.plan_price || 0) === 0
              ? 'View your plan and upgrade when you need more capacity.'
              : 'Manage subscription, invoices, and payment methods.'
          }
        >
          <Button variant="outline" size="sm" onClick={loadBillingData} disabled={isLoading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {billingInfo?.plan_name !== 'Free' && (billingInfo?.plan_price || 0) > 0 && (
            <Button size="sm" onClick={handleManageBilling} className="gap-2">
              <CreditCard className="h-4 w-4" />
              Manage billing
            </Button>
          )}
        </DashboardPageHeader>

        {successMessage && (
          <DashboardAlert variant="success">
            <span className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 shrink-0" />
              {successMessage}
            </span>
          </DashboardAlert>
        )}

        {error && !billingInfo && <DashboardAlert variant="error">{error}</DashboardAlert>}

        {billingInfo ? (
          <div className="space-y-6">
            {/* Current Plan */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Current Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {billingInfo.plan_name}
                    </h3>
                    <p className="text-3xl font-bold text-gray-900 mb-1">
                      {formatCurrency(billingInfo.plan_price)}
                    </p>
                    <p className="text-sm text-gray-600">per month</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    <Badge className={getStatusColor()}>
                      {billingInfo.plan_name === 'Free' || billingInfo.plan_price === 0 
                        ? 'Free Plan' 
                        : 'Active'
                      }
                    </Badge>
                    {billingInfo.next_billing_date && billingInfo.plan_price > 0 && (
                      <p className="text-sm text-gray-600 mt-2">
                        Next billing: {formatDate(billingInfo.next_billing_date)}
                      </p>
                    )}
                    {billingInfo.plan_name === 'Free' || billingInfo.plan_price === 0 ? (
                      <p className="text-sm text-gray-600 mt-2">
                        No billing required
                      </p>
                    ) : null}
                  </div>
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="outline"
                      onClick={handleUpgrade}
                      className="flex-1"
                    >
                      Upgrade Plan
                    </Button>
                    {(billingInfo.plan_name !== 'Free' && billingInfo.plan_price > 0) && (
                      <Button
                        variant="outline"
                        onClick={handleManageBilling}
                        className="flex-1"
                      >
                        Manage
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <UsageThisMonthCard
              used={billingInfo.current_usage}
              limit={billingInfo.usage_limit}
            />

            {/* Payment Method - Only for paid plans */}
            {(billingInfo.plan_name !== 'Free' && billingInfo.plan_price > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-16 bg-gray-100 rounded border flex items-center justify-center">
                        <CreditCard className="h-6 w-6 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">•••• •••• •••• 4242</p>
                        <p className="text-sm text-gray-600">Expires 12/25</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={handleManageBilling}
                      className="flex items-center"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Update
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Billing History - Only for paid plans */}
            {(billingInfo.plan_name !== 'Free' && billingInfo.plan_price > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Billing History</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {invoices.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No billing history available</p>
                    ) : (
                      invoices.map((invoice, index) => (
                        <div key={index} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
                          <div className="flex items-center space-x-4">
                            <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{invoice.description || 'No description'}</p>
                              <p className="text-sm text-gray-600">
                                {formatDate(invoice.created_at)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">
                              {formatCurrency(invoice.amount, invoice.currency || 'usd')}
                            </p>
                            <Badge variant="secondary" className="text-xs">
                              {invoice.event_type?.replace('.', ' ').toUpperCase() || 'UNKNOWN'}
                            </Badge>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Plan Management */}
            <Card>
              <CardHeader>
                <CardTitle>Plan Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {availablePlans
                    .filter((p) => p.name.toLowerCase() !== 'free')
                    .map((plan) => (
                      <BillingPlanCard
                        key={plan.id}
                        plan={plan}
                        currentPlanName={billingInfo.plan_name}
                        onSelect={handlePlanChange}
                      />
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Plan Features */}
            <Card>
              <CardHeader>
                <CardTitle>Current Plan Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">API Access</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        Food & Nutrition Search
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        UPC Lookup
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        Autocomplete API
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        Advanced Analytics
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Support & Limits</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        Priority Support
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        {billingInfo.rate_limit_per_minute || 100} requests/minute
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        {billingInfo.usage_limit?.toLocaleString() || '750,000'} requests/month
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        {apiKeyLimitText(billingInfo.plan_name, billingInfo.max_api_keys)}
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Fallback: Show free plan if no billing info but no error
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Current Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Free Plan
                    </h3>
                    <p className="text-3xl font-bold text-gray-900 mb-1">
                      $0.00
                    </p>
                    <p className="text-sm text-gray-600">per month</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    <Badge className="bg-green-100 text-green-800">
                      Free Plan
                    </Badge>
                    <p className="text-sm text-gray-600 mt-2">
                      No billing required
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Button
                      onClick={handleUpgrade}
                      className="flex-1"
                    >
                      Upgrade Plan
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <UsageThisMonthCard used={0} limit={1000} />

            {/* Plan Features */}
            <Card>
              <CardHeader>
                <CardTitle>Free Plan Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">API Access</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        Food & Nutrition Search
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        UPC Lookup
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        Autocomplete API
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        Basic Analytics
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Limits</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        Community Support
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        10 requests/minute
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        1,000 requests/month
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        {apiKeyLimitText('Free')}
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Upgrade Options */}
            <Card>
              <CardHeader>
                <CardTitle>Upgrade Options</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availablePlans
                    .filter((p) => p.name.toLowerCase() !== 'free')
                    .slice(0, 2)
                    .map((plan) => (
                      <BillingPlanCard
                        key={plan.id}
                        plan={plan}
                        currentPlanName="Free"
                        onSelect={handleUpgradeToPlan}
                      />
                    ))}
                </div>
                
                <div className="mt-4 text-center">
                  <Button
                    variant="outline"
                    onClick={handleUpgrade}
                    className="text-blue-600 border-blue-600 hover:bg-blue-50"
                  >
                    View All Plans
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
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
