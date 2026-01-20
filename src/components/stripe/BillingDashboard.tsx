'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  CreditCard, 
  FileText, 
  Settings, 
  ExternalLink,
  Calendar,
  DollarSign,
  Activity,
  AlertCircle
} from 'lucide-react'
import { useStripe } from '@/contexts/StripeContext'
import { formatPrice, formatDate } from '@/lib/stripe/config'
import { SubscriptionCard } from './SubscriptionCard'
import { PaymentMethodManager } from './PaymentMethodManager'
import { InvoiceHistory } from './InvoiceHistory'


export function BillingDashboard() {
  const {
    subscription,
    usage,
    plans,
    isLoading,
    error,
    loadSubscription,
    loadPaymentMethods,
    loadInvoices,
    loadUsage,
    loadPlans,
    createCustomerPortalSession,
    clearError,
  } = useStripe()

  const [isPortalLoading, setIsPortalLoading] = useState(false)
  const [isPaymentMethodsLoading, setIsPaymentMethodsLoading] = useState(false)
  const [isInvoicesLoading, setIsInvoicesLoading] = useState(false)

  useEffect(() => {
    loadSubscription()
    loadPaymentMethods()
    loadInvoices()
    loadUsage()
    loadPlans()
  }, [loadSubscription, loadPaymentMethods, loadInvoices, loadUsage, loadPlans])

  const handleCustomerPortal = async () => {
    try {
      setIsPortalLoading(true)
      const portalUrl = await createCustomerPortalSession()
      window.open(portalUrl, '_blank')
    } catch (error) {
      console.error('Failed to open customer portal:', error)
    } finally {
      setIsPortalLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'past_due':
        return 'bg-red-100 text-red-800'
      case 'canceled':
        return 'bg-gray-100 text-gray-800'
      case 'trialing':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active'
      case 'past_due':
        return 'Past Due'
      case 'canceled':
        return 'Canceled'
      case 'trialing':
        return 'Trial'
      default:
        return status
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Billing & Subscription</h1>
          <p className="text-gray-600">Manage your subscription, payment methods, and billing history.</p>
        </div>

        {error && (
          <div className="mb-6">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                  <div className="mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearError}
                      className="text-red-800 border-red-300 hover:bg-red-100"
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Current Subscription Overview */}
        {subscription && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{subscription.plan_name}</div>
                <p className="text-xs text-muted-foreground">
                  {formatPrice(subscription.monthly_price)}/month
                </p>
                <Badge className={`mt-2 ${getStatusColor(subscription.status)}`}>
                  {getStatusText(subscription.status)}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">API Usage</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {usage ? usage.requests_this_month.toLocaleString() : '0'}
                </div>
                <p className="text-xs text-muted-foreground">
                  of {usage ? usage.monthly_quota.toLocaleString() : '0'} requests
                </p>
                {usage && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min((usage.requests_this_month / usage.monthly_quota) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Next Billing</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {subscription.current_period_end
                    ? formatDate(new Date(subscription.current_period_end).getTime() / 1000)
                    : 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {subscription.current_period_end
                    ? 'Next billing date'
                    : 'No active subscription'}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="plans">Plans</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="usage">Usage</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Current Subscription Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Subscription Details</CardTitle>
                  <CardDescription>
                    Your current subscription information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {subscription ? (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Plan</span>
                        <span className="text-sm">{subscription.plan_name}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Status</span>
                        <Badge className={getStatusColor(subscription.status)}>
                          {getStatusText(subscription.status)}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Price</span>
                        <span className="text-sm">{formatPrice(subscription.monthly_price)}/month</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">API Quota</span>
                        <span className="text-sm">{subscription.monthly_quota.toLocaleString()}/month</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Rate Limit</span>
                        <span className="text-sm">{subscription.rate_limit_per_minute}/minute</span>
                      </div>
                      {subscription.current_period_end && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Next Billing</span>
                          <span className="text-sm">
                            {formatDate(new Date(subscription.current_period_end).getTime() / 1000)}
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No active subscription</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Manage your subscription and billing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={handleCustomerPortal}
                    disabled={isPortalLoading}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    {isPortalLoading ? 'Opening...' : 'Manage Subscription'}
                    <ExternalLink className="h-4 w-4 ml-auto" />
                  </Button>
                  
                  <Button
                    onClick={() => {
                      setIsPaymentMethodsLoading(true)
                      loadPaymentMethods().finally(() => setIsPaymentMethodsLoading(false))
                    }}
                    disabled={isPaymentMethodsLoading}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    {isPaymentMethodsLoading ? 'Loading...' : 'Manage Payment Methods'}
                  </Button>
                  
                  <Button
                    onClick={() => {
                      setIsInvoicesLoading(true)
                      loadInvoices().finally(() => setIsInvoicesLoading(false))
                    }}
                    disabled={isInvoicesLoading}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    {isInvoicesLoading ? 'Loading...' : 'View Billing History'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Plans Tab */}
          <TabsContent value="plans" className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Plans</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map((plan, index) => (
                  <SubscriptionCard
                    key={plan.id}
                    plan={plan}
                    currentPlan={subscription ? plans.find(p => p.id === subscription.plan_id) : null}
                    onSelect={() => {
                      // Handle plan selection
                      // Plan selection handled by the component
                    }}
                    isLoading={isLoading}
                    isPopular={index === 1} // Mark middle plan as popular
                  />
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PaymentMethodManager />
              <InvoiceHistory />
            </div>
          </TabsContent>

          {/* Usage Tab */}
          <TabsContent value="usage" className="space-y-6">
            <div className="text-center py-8">
              <p className="text-gray-500">Usage analytics coming soon</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
