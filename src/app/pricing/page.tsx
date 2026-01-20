'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Zap, Shield, Star, Crown, Building2 } from 'lucide-react'
import { useAuth } from '@/lib/hooks/use-auth'
import { SubscribeModal } from '@/components/stripe/SubscribeModal'
import { stripeAPI } from '@/lib/stripe/api'

interface Plan {
  id: number
  name: string
  monthly_price: number
  description: string
  features: string[]
  monthly_quota: number
  rate_limit_per_minute: number
  stripe_test_price_id?: string
  stripe_live_price_id?: string
}

function PricingContent() {
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [plans, setPlans] = useState<Plan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentSubscription, setCurrentSubscription] = useState<{ plan_id: number; plan_name: string } | null>(null)

  // Transform backend plan data to include features as string array
  const transformPlanData = (backendPlans: Record<string, unknown>[]): Plan[] => {
    return backendPlans.map(plan => {
      // Parse features from JSON if available
      let features: string[] = []
      if (plan.features && typeof plan.features === 'object') {
        // Convert features object to display strings
        const featureMap: Record<string, string> = {
          'basic_endpoints': 'Basic endpoints',
          'advanced_search': 'Advanced search',
          'webhooks': 'Webhook support',
          'analytics': 'Usage analytics',
          'bulk_export': 'Bulk export',
          'white_label': 'White-label options',
          'on_premise': 'On-premise deployment',
          'phone_support': 'Phone support',
          'priority_support': 'Priority support',
          'dedicated_support': 'Dedicated support',
          'custom_integrations': 'Custom integrations',
          'custom_features': 'Custom features'
        }
        
        features = Object.entries(plan.features)
          .filter(([, value]) => value === true)
          .map(([key]) => featureMap[key] || key)
          .filter(Boolean)
      }
      
      // Add request limits as features
      const monthlyQuota = typeof plan.monthly_quota === 'number' ? plan.monthly_quota : 0
      const rateLimit = typeof plan.rate_limit_per_minute === 'number' ? plan.rate_limit_per_minute : 0
      
      features.unshift(`${monthlyQuota.toLocaleString()} requests/month`)
      features.unshift(`${rateLimit} requests/minute`)
      
      return {
        id: plan.id as number,
        name: plan.name as string,
        monthly_price: plan.monthly_price as number,
        description: plan.description as string,
        monthly_quota: monthlyQuota,
        rate_limit_per_minute: rateLimit,
        stripe_test_price_id: plan.stripe_test_price_id as string | undefined,
        stripe_live_price_id: plan.stripe_live_price_id as string | undefined,
        features
      }
    })
  }

  // Load plans and current subscription from API
  useEffect(() => {
    const loadData = async () => {
      try {
        const plansData = await stripeAPI.getPlans()
        const transformedPlans = transformPlanData(plansData)
        setPlans(transformedPlans)
        
        // Load current subscription if user is authenticated
        if (isAuthenticated && user) {
          try {
            const { api } = await import('@/lib/api/client')
            const subscriptionResponse = await api.billing.getSubscription()
            if (subscriptionResponse.success) {
              setCurrentSubscription(subscriptionResponse.data as { plan_id: number; plan_name: string })
            }
          } catch {
            console.log('No current subscription found')
          }
        }
      } catch (error) {
        console.error('Failed to load plans:', error)
        // Fallback to hardcoded plans matching backend exactly
        setPlans([
          {
            id: 1,
            name: 'Free',
            monthly_price: 0.00,
            description: 'Perfect for testing and small projects',
            features: [
              '1,000 requests/month',
              '10 requests/minute',
              'Basic search functionality',
              'Community support',
              '1 API key',
              'Basic endpoints',
              'JSON responses',
            ],
            monthly_quota: 1000,
            rate_limit_per_minute: 10,
          },
          {
            id: 2,
            name: 'Basic',
            monthly_price: 29.00,
            description: 'Ideal for small applications and startups',
            features: [
              '100,000 requests/month',
              '50 requests/minute',
              'Advanced search filters',
              'Email support',
              '3 API keys',
              'Usage analytics',
              '99% SLA',
              'Priority support',
            ],
            monthly_quota: 100000,
            rate_limit_per_minute: 50,
          },
          {
            id: 3,
            name: 'Core',
            monthly_price: 99.00,
            description: 'Perfect for growing businesses and teams',
            features: [
              '750,000 requests/month',
              '100 requests/minute',
              'All Basic features',
              'Priority support',
              '10 API keys',
              'Webhook support',
              'Bulk export',
              '99.5% SLA',
            ],
            monthly_quota: 750000,
            rate_limit_per_minute: 100,
          },
          {
            id: 4,
            name: 'Plus',
            monthly_price: 299.00,
            description: 'For high-volume applications and enterprises',
            features: [
              '3,000,000 requests/month',
              '300 requests/minute',
              'All Core features',
              'Dedicated support',
              '25 API keys',
              'White-label options',
              'Advanced analytics',
              '99.9% SLA',
            ],
            monthly_quota: 3000000,
            rate_limit_per_minute: 300,
          },
          {
            id: 5,
            name: 'Enterprise',
            monthly_price: 999.00,
            description: 'Tailored solutions for large organizations',
            features: [
              'Unlimited requests',
              'Unlimited requests/minute',
              'All Plus features',
              'Dedicated support',
              '100 API keys',
              'Phone support',
              'Custom integrations',
              'On-premise deployment',
              '99.99% SLA',
              'Custom features',
            ],
            monthly_quota: 999999999,
            rate_limit_per_minute: 1000,
          },
        ])
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [isAuthenticated, user])

  // Handle pre-selected plan from URL and canceled redirects
  useEffect(() => {
    const planId = searchParams.get('plan_id')
    const canceled = searchParams.get('canceled')
    
    if (canceled === 'true') {
      // Show error message for canceled checkout
      console.log('Checkout was canceled')
      // You could add a toast notification here
    }
    
    if (planId && plans.length > 0) {
      const plan = plans.find(p => p.id === parseInt(planId))
      if (plan && isAuthenticated) {
        setSelectedPlan(plan)
        setIsModalOpen(true)
      }
    }
  }, [searchParams, plans, isAuthenticated])

  const handlePlanSelect = async (plan: Plan) => {
    console.log('Plan selected:', plan.name, 'isAuthenticated:', isAuthenticated)
    
    if (!isAuthenticated) {
      // Redirect non-logged-in users to register page
      router.push('/auth/register')
      return
    }

    // Check if user already has this plan
    if (currentSubscription && currentSubscription.plan_id === plan.id) {
      console.log('User already has this plan')
      return
    }

    // If user has a subscription, update it instead of creating new one
    if (currentSubscription && currentSubscription.plan_id !== plan.id) {
      try {
        const { api } = await import('@/lib/api/client')
        const response = await api.billing.updateSubscription(plan.id)
        
        if (response.success) {
          router.push('/dashboard/billing')
        } else {
          console.error('Failed to update subscription:', response)
        }
      } catch (error) {
        console.error('Error updating subscription:', error)
      }
      return
    }

    // For Free plan, handle differently
    if (plan.name === 'Free') {
      try {
        const { api } = await import('@/lib/api/client')
        const response = await api.billing.createSubscription(plan.id)
        
        if (response.success) {
          router.push('/dashboard/billing')
        } else {
          console.error('Failed to update to Free plan:', response)
          router.push('/dashboard/billing')
        }
      } catch (error) {
        console.error('Error updating to Free plan:', error)
        router.push('/dashboard/billing')
      }
      return
    }

    // For Enterprise plan, redirect to contact page
    if (plan.name === 'Enterprise') {
      router.push('/contact')
      return
    }

    // For new paid plans, open subscribe modal
    setSelectedPlan(plan)
    setIsModalOpen(true)
  }


  const handleModalError = (error: string) => {
    console.error('Subscription error:', error)
  }

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'free':
        return <Shield className="h-6 w-6 text-gray-600" />
      case 'basic':
        return <Zap className="h-6 w-6 text-blue-600" />
      case 'core':
        return <Star className="h-6 w-6 text-purple-600" />
      case 'plus':
        return <Crown className="h-6 w-6 text-yellow-600" />
      case 'enterprise':
        return <Building2 className="h-6 w-6 text-red-600" />
      default:
        return <Shield className="h-6 w-6 text-gray-600" />
    }
  }

  const getPlanColor = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'free':
        return 'border-gray-200'
      case 'basic':
        return 'border-blue-200'
      case 'core':
        return 'border-purple-200'
      case 'plus':
        return 'border-yellow-200'
      case 'enterprise':
        return 'border-red-200'
      default:
        return 'border-gray-200'
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Simple, transparent pricing
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Choose the plan that fits your needs. All plans include our core API features 
              with no hidden fees or surprise charges.
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span>7-day free trial</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span>No setup fees</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {isLoading ? (
              // Loading state
              Array.from({ length: 5 }).map((_, index) => (
                <Card key={index} className="border border-gray-200 animate-pulse">
                  <CardHeader className="text-center pb-4">
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3 mb-6">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-4 bg-gray-200 rounded"></div>
                      ))}
                    </div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))
            ) : (
              // Plans from API or fallback
              (plans.length > 0 ? plans : []).map((plan) => (
              <Card 
                key={plan.name} 
                  className={`relative ${getPlanColor(plan.name)} ${
                    plan.name === 'Core' 
                      ? 'border-2 border-purple-500 shadow-lg scale-105' 
                      : 'border'
                  }`}
                >
                  {plan.name === 'Core' && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-purple-600 text-white">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                    <div className="flex justify-center mb-2">
                      {getPlanIcon(plan.name)}
                    </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">
                        ${plan.monthly_price}
                    </span>
                      <span className="text-gray-600">/month</span>
                  </div>
                  <CardDescription className="mt-2">
                    {plan.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0">
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                    <Button 
                      variant={plan.name === 'Free' ? 'outline' : 'default'}
                      className="w-full"
                      onClick={() => handlePlanSelect(plan)}
                      disabled={!!(currentSubscription && currentSubscription.plan_id === plan.id)}
                    >
                      {currentSubscription && currentSubscription.plan_id === plan.id 
                        ? 'Current Plan' 
                        : plan.name === 'Free' 
                          ? 'Get Started Free' 
                          : plan.name === 'Enterprise'
                            ? 'Contact Sales'
                            : 'Subscribe Now'
                      }
                    </Button>
                </CardContent>
              </Card>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Subscribe Modal */}
      <SubscribeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        plan={selectedPlan}
        onError={handleModalError}
      />
    </div>
  )
}

export default function PricingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading pricing...</p>
        </div>
      </div>
    }>
      <PricingContent />
    </Suspense>
  )
}