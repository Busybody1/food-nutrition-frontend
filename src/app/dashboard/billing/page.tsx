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
  CreditCard, DollarSign, 
  CheckCircle, ExternalLink, RefreshCw, Download
} from 'lucide-react'

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
}

interface Invoice {
  stripe_event_id: string
  event_type: string | null
  amount: number | null
  currency: string | null
  description: string | null
  created_at: string | null
}

function BillingPageContent() {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const loadBillingData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError('')

      // Import API client
      const { api } = await import('@/lib/api/client')
      
      // First, get user profile to check plan
      const profileResponse = await api.user.getProfile()
      
      if (!profileResponse.success) {
        throw new Error('Failed to load user profile')
      }

      const userProfile = profileResponse.data as { plan?: { name?: string; monthly_price?: number; monthly_quota?: number } }
      const planName = userProfile.plan?.name || 'Free'
      const isFreePlan = planName === 'Free' || (userProfile.plan?.monthly_price || 0) === 0

      // For free plan users, create billing info from profile data only
      if (isFreePlan) {
        const billingInfo: BillingInfo = {
          user_id: user?.id || 0,
          plan_name: planName,
          plan_price: userProfile.plan?.monthly_price || 0,
          stripe_customer_id: '',
          subscription_status: 'inactive',
          next_billing_date: '',
          current_usage: 0,
          usage_limit: userProfile.plan?.monthly_quota || 1000
        }
        setBillingInfo(billingInfo)
        setInvoices([]) // No invoices for free plan
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
              plan_name: subscription.plan_name || 'Free',
              plan_price: subscription.monthly_price || 0,
              stripe_customer_id: subscription.stripe_customer_id || '',
              subscription_status: subscription.status || 'inactive',
              next_billing_date: subscription.current_period_end || '',
              current_usage: 0, // This would come from usage API
              usage_limit: subscription.monthly_quota || 1000
            }
            setBillingInfo(billingInfo)
          }

          if (invoicesResponse.success) {
            const invoices = invoicesResponse.data as Invoice[]
            setInvoices(invoices)
          }
        } catch (subscriptionError) {
          // If subscription API fails, fall back to free plan
          console.log('No subscription found, showing free plan:', subscriptionError)
          const billingInfo: BillingInfo = {
            user_id: user?.id || 0,
            plan_name: 'Free',
            plan_price: 0,
            stripe_customer_id: '',
            subscription_status: 'inactive',
            next_billing_date: '',
            current_usage: 0,
            usage_limit: 1000
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
    console.log('Upgrade button clicked - redirecting to pricing page')
    // Navigate to pricing page
    router.push('/pricing')
  }

  const handleUpgradeToPlan = (planId: number) => {
    console.log('Upgrade to plan clicked - redirecting to pricing page for plan:', planId)
    // Navigate to pricing page with plan pre-selected
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading billing information...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Billing & Subscription</h1>
            <p className="text-gray-600">
              {billingInfo?.plan_name === 'Free' || (billingInfo?.plan_price || 0) === 0
                ? 'View your current plan and upgrade options'
                : 'Manage your subscription, view invoices, and update payment methods'
              }
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={loadBillingData}
              disabled={isLoading}
              className="flex items-center"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            {(billingInfo?.plan_name !== 'Free' && (billingInfo?.plan_price || 0) > 0) && (
              <Button
                onClick={handleManageBilling}
                className="flex items-center"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Manage Billing
              </Button>
            )}
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
              <p className="text-green-800">{successMessage}</p>
            </div>
          </div>
        )}

        {error && !billingInfo && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">{error}</p>
          </div>
        )}

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

            {/* Usage Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Usage This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Requests Used</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {billingInfo.current_usage.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      of {billingInfo.usage_limit.toLocaleString()} total
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Usage Percentage</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {((billingInfo.current_usage / billingInfo.usage_limit) * 100).toFixed(1)}%
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ 
                          width: `${Math.min((billingInfo.current_usage / billingInfo.usage_limit) * 100, 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Remaining</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {(billingInfo.usage_limit - billingInfo.current_usage).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">requests this month</p>
                  </div>
                </div>
              </CardContent>
            </Card>

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
                  {/* Basic Plan */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">Basic</h4>
                        <p className="text-2xl font-bold text-gray-900">$9</p>
                        <p className="text-sm text-gray-600">per month</p>
                      </div>
                      {billingInfo.plan_name === 'Basic' && (
                        <Badge className="bg-green-100 text-green-800">Current</Badge>
                      )}
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1 mb-4">
                      <li>• 1,000 API calls/month</li>
                      <li>• 10 requests/minute</li>
                      <li>• Email support</li>
                      <li>• Basic analytics</li>
                    </ul>
                    <Button
                      onClick={() => handlePlanChange(2)}
                      variant={billingInfo.plan_name === 'Basic' ? "outline" : "default"}
                      disabled={billingInfo.plan_name === 'Basic'}
                      className="w-full"
                    >
                      {billingInfo.plan_name === 'Basic' ? 'Current Plan' : 'Switch to Basic'}
                    </Button>
                  </div>

                  {/* Professional Plan */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">Professional</h4>
                        <p className="text-2xl font-bold text-gray-900">$29</p>
                        <p className="text-sm text-gray-600">per month</p>
                      </div>
                      {billingInfo.plan_name === 'Professional' && (
                        <Badge className="bg-green-100 text-green-800">Current</Badge>
                      )}
                      {billingInfo.plan_name !== 'Professional' && (
                        <Badge className="bg-purple-100 text-purple-800">Popular</Badge>
                      )}
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1 mb-4">
                      <li>• 10,000 API calls/month</li>
                      <li>• 50 requests/minute</li>
                      <li>• Priority support</li>
                      <li>• Advanced analytics</li>
                    </ul>
                    <Button
                      onClick={() => handlePlanChange(3)}
                      variant={billingInfo.plan_name === 'Professional' ? "outline" : "default"}
                      disabled={billingInfo.plan_name === 'Professional'}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      {billingInfo.plan_name === 'Professional' ? 'Current Plan' : 'Switch to Professional'}
                    </Button>
                  </div>

                  {/* Enterprise Plan */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">Enterprise</h4>
                        <p className="text-2xl font-bold text-gray-900">$99</p>
                        <p className="text-sm text-gray-600">per month</p>
                      </div>
                      {billingInfo.plan_name === 'Enterprise' && (
                        <Badge className="bg-green-100 text-green-800">Current</Badge>
                      )}
                      {billingInfo.plan_name !== 'Enterprise' && (
                        <Badge className="bg-yellow-100 text-yellow-800">Best Value</Badge>
                      )}
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1 mb-4">
                      <li>• 50,000 API calls/month</li>
                      <li>• 100 requests/minute</li>
                      <li>• 24/7 support</li>
                      <li>• Custom integrations</li>
                    </ul>
                    <Button
                      onClick={() => handlePlanChange(4)}
                      variant={billingInfo.plan_name === 'Enterprise' ? "outline" : "default"}
                      disabled={billingInfo.plan_name === 'Enterprise'}
                      className="w-full bg-yellow-600 hover:bg-yellow-700"
                    >
                      {billingInfo.plan_name === 'Enterprise' ? 'Current Plan' : 'Switch to Enterprise'}
                    </Button>
                  </div>
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
                        Up to 10 API keys
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

            {/* Usage Summary for Free Plan */}
            <Card>
              <CardHeader>
                <CardTitle>Usage This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Requests Used</p>
                    <p className="text-2xl font-bold text-gray-900">
                      0
                    </p>
                    <p className="text-sm text-gray-600">
                      of 1,000 total
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Usage Percentage</p>
                    <p className="text-2xl font-bold text-gray-900">
                      0%
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: '0%' }}
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Remaining</p>
                    <p className="text-2xl font-bold text-gray-900">
                      1,000
                    </p>
                    <p className="text-sm text-gray-600">requests this month</p>
                  </div>
                </div>
              </CardContent>
            </Card>

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
                        Up to 2 API keys
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
                  {/* Professional Plan */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">Professional</h4>
                        <p className="text-2xl font-bold text-gray-900">$29</p>
                        <p className="text-sm text-gray-600">per month</p>
                      </div>
                      <Badge className="bg-purple-100 text-purple-800">Popular</Badge>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1 mb-4">
                      <li>• 10,000 API calls/month</li>
                      <li>• 100 requests/minute</li>
                      <li>• Priority support</li>
                      <li>• Advanced analytics</li>
                    </ul>
                    <Button
                      onClick={() => handleUpgradeToPlan(2)}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      Upgrade to Professional
                    </Button>
                  </div>

                  {/* Enterprise Plan */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">Enterprise</h4>
                        <p className="text-2xl font-bold text-gray-900">$99</p>
                        <p className="text-sm text-gray-600">per month</p>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800">Best Value</Badge>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1 mb-4">
                      <li>• 50,000 API calls/month</li>
                      <li>• 200 requests/minute</li>
                      <li>• 24/7 support</li>
                      <li>• Custom integrations</li>
                    </ul>
                    <Button
                      onClick={() => handleUpgradeToPlan(3)}
                      className="w-full bg-yellow-600 hover:bg-yellow-700"
                    >
                      Upgrade to Enterprise
                    </Button>
                  </div>
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
      </div>
    </div>
  )
}

export default function BillingPage() {
  return (
    <ErrorBoundary fallback={<PaymentErrorMessage />}>
      <Suspense fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading billing page...</p>
          </div>
        </div>
      }>
        <BillingPageContent />
      </Suspense>
    </ErrorBoundary>
  )
}
