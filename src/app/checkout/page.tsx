'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  ArrowLeft,
  Shield,
  Zap,
  Crown,
  Star,
  AlertCircle
} from 'lucide-react'
import { getErrorMessage, formatPrice } from '@/lib/stripe/config'
import { stripeAPI } from '@/lib/stripe/api'
import { useAuth } from '@/lib/hooks/use-auth'

interface PlanDetails {
  id: number
  name: string
  description: string
  monthly_price: number
  monthly_quota: number
  rate_limit_per_minute: number
  features: string[]
}

function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const stripe = useStripe()
  const elements = useElements()
  const { user, isAuthenticated } = useAuth()
  
  const [planDetails, setPlanDetails] = useState<PlanDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [step, setStep] = useState<'details' | 'payment' | 'processing' | 'success'>('details')

  // Get plan ID from URL parameters
  const planId = searchParams.get('plan_id')

  useEffect(() => {
    const loadPlanDetails = async () => {
      try {
        setIsLoading(true)
        const response = await stripeAPI.getPlan(parseInt(planId!))
        setPlanDetails(response as unknown as PlanDetails)
      } catch (err) {
        console.error('Failed to load plan details:', err)
        setError('Failed to load plan details')
      } finally {
        setIsLoading(false)
      }
    }

    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }

    if (!planId) {
      router.push('/pricing')
      return
    }

    loadPlanDetails()
  }, [isAuthenticated, planId, router])

  const handlePaymentSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements || !planDetails) {
      return
    }

    setIsProcessing(true)
    setError(null)
    setStep('payment')

    try {
      const cardElement = elements.getElement(CardElement)
      if (!cardElement) {
        throw new Error('Card element not found')
      }

      // Step 1: Create payment method
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      })

      if (stripeError) {
        throw new Error(getErrorMessage(stripeError))
      }

      if (!paymentMethod) {
        throw new Error('Failed to create payment method')
      }

      // Step 2: Create subscription
      setStep('processing')
      const subscriptionResponse = await stripeAPI.createSubscription({
        plan_id: planDetails.id,
        payment_method_id: paymentMethod.id,
      }) as { client_secret?: string; subscription_id?: string; status?: string }

      // Step 3: Handle payment confirmation if required
      if (subscriptionResponse.client_secret) {
        const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
          subscriptionResponse.client_secret,
          {
            payment_method: {
              card: cardElement,
              billing_details: {
                name: `${user?.first_name || ''} ${user?.last_name || ''}`.trim(),
                email: user?.email,
              },
            },
          }
        )

        if (confirmError) {
          throw new Error(getErrorMessage(confirmError))
        }

        // Handle 3D Secure authentication if required
        if (paymentIntent?.status === 'requires_action') {
          const { error: actionError } = await stripe.confirmCardPayment(
            subscriptionResponse.client_secret
          )
          
          if (actionError) {
            throw new Error(getErrorMessage(actionError))
          }
        }
      }

      setStep('success')
      setSuccess(true)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      setStep('payment')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBackToPricing = () => {
    router.push('/pricing')
  }

  const handleGoToDashboard = () => {
    router.push('/dashboard/billing')
  }

  const getPlanIcon = (planName: string) => {
    const name = planName.toLowerCase()
    if (name.includes('free') || name.includes('basic')) return <Zap className="h-8 w-8" />
    if (name.includes('professional') || name.includes('pro') || name.includes('core')) return <Crown className="h-8 w-8" />
    if (name.includes('enterprise') || name.includes('unlimited') || name.includes('plus')) return <Star className="h-8 w-8" />
    return <Zap className="h-8 w-8" />
  }

  const getPlanColor = (planName: string) => {
    const name = planName.toLowerCase()
    if (name.includes('free') || name.includes('basic')) return 'text-blue-600'
    if (name.includes('professional') || name.includes('pro') || name.includes('core')) return 'text-purple-600'
    if (name.includes('enterprise') || name.includes('unlimited') || name.includes('plus')) return 'text-gold-600'
    return 'text-gray-600'
  }

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#1f2937',
        fontFamily: 'Inter, system-ui, sans-serif',
        '::placeholder': {
          color: '#9ca3af',
        },
      },
      invalid: {
        color: '#ef4444',
      },
    },
    hidePostalCode: true,
  }

  if (!isAuthenticated) {
    return null // Will redirect
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading plan details...</p>
        </div>
      </div>
    )
  }

  if (!planDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-600" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Plan Not Found</h2>
          <p className="text-gray-600 mb-4">The selected plan could not be found.</p>
          <Button onClick={handleBackToPricing}>Back to Pricing</Button>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
              <p className="text-gray-600 mb-6">
                Your {planDetails.name} subscription is now active. You can start using all the features immediately.
              </p>
              <Button onClick={handleGoToDashboard} className="w-full">
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={handleBackToPricing}
            className="mb-4 flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Pricing
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Complete Your Subscription</h1>
          <p className="text-gray-600">Review your plan and complete the payment</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Plan Details */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <div className={`mr-3 ${getPlanColor(planDetails.name)}`}>
                      {getPlanIcon(planDetails.name)}
                    </div>
                    Plan Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">{planDetails.name}</span>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      Selected Plan
                    </Badge>
                  </div>
                  
                  <div className="text-3xl font-bold text-gray-900">
                    {formatPrice(planDetails.monthly_price)}
                    <span className="text-lg font-normal text-gray-600">/month</span>
                  </div>

                  <p className="text-gray-600">{planDetails.description}</p>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">What&apos;s included:</h4>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm">{planDetails.monthly_quota.toLocaleString()} API calls/month</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm">{planDetails.rate_limit_per_minute} requests/minute</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm">Food & Nutrition data access</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm">REST API access</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm">JSON responses</span>
                      </div>
                      {planDetails.monthly_price > 0 && (
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span className="text-sm">Priority support</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Security Notice */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-3">
                    <Shield className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Secure Payment</h4>
                      <p className="text-sm text-gray-600">
                        Your payment information is encrypted and secure. We never store your card details.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payment Form */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Payment Information
                  </CardTitle>
                  <CardDescription>
                    Enter your payment details to complete the subscription
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePaymentSubmit} className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Card Information
                        </label>
                        <div className="p-3 border border-gray-300 rounded-md">
                          <CardElement
                            options={cardElementOptions}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>

                    {error && (
                      <Alert variant="destructive">
                        <XCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-4">
                      <Separator />
                      
                      {/* Order Summary */}
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">{planDetails.name} Plan</span>
                          <span className="text-sm font-medium">{formatPrice(planDetails.monthly_price)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Billing cycle</span>
                          <span className="text-sm font-medium">Monthly</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between">
                          <span className="text-lg font-semibold">Total</span>
                          <span className="text-lg font-semibold">{formatPrice(planDetails.monthly_price)}</span>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={!stripe || isProcessing}
                        className="w-full"
                        size="lg"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            {step === 'payment' ? 'Processing Payment...' : 'Confirming Payment...'}
                          </>
                        ) : (
                          <>
                            <CreditCard className="h-4 w-4 mr-2" />
                            Complete Subscription - {formatPrice(planDetails.monthly_price)}
                          </>
                        )}
                      </Button>
                    </div>
                  </form>

                  <div className="mt-6 text-xs text-gray-500 text-center">
                    <p>
                      By completing this payment, you agree to our Terms of Service and Privacy Policy.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading checkout page...</p>
        </div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  )
}
