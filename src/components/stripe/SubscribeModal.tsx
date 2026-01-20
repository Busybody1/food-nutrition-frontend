'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { 
  Loader2, 
  CreditCard, 
  XCircle, 
  Shield,
  Zap,
  Crown,
  Star,
  ExternalLink
} from 'lucide-react'
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

interface SubscribeModalProps {
  isOpen: boolean
  onClose: () => void
  plan: Plan | null
  onError: (error: string) => void
}

export function SubscribeModal({ 
  isOpen, 
  onClose, 
  plan, 
  onError 
}: SubscribeModalProps) {
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [step, setStep] = useState<'payment' | 'processing' | 'success'>('payment')
  const [error, setError] = useState<string | null>(null)

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep('payment')
      setError(null)
      setIsProcessing(false)
    }
  }, [isOpen])

  const handleCheckoutRedirect = async () => {
    if (!plan) {
      setError('No plan selected')
      return
    }

    setError(null)
    setStep('processing')
    setIsProcessing(true)

    try {
      // Create checkout session
      const checkoutResponse = await stripeAPI.createCheckoutSession({
        plan_id: plan.id,
        success_url: `${window.location.origin}/dashboard/billing?success=true`,
        cancel_url: `${window.location.origin}/pricing?canceled=true`
      })

      // Redirect to Stripe Checkout
      window.location.href = checkoutResponse.url

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      setStep('payment')
      onError(errorMessage)
      setIsProcessing(false)
    }
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
      case 'enterprise':
        return <Crown className="h-6 w-6 text-yellow-600" />
      default:
        return <Shield className="h-6 w-6 text-gray-600" />
    }
  }

  const getPlanColor = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'free':
        return 'bg-gray-100 text-gray-800'
      case 'basic':
        return 'bg-blue-100 text-blue-800'
      case 'core':
        return 'bg-purple-100 text-purple-800'
      case 'plus':
      case 'enterprise':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (!plan) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getPlanIcon(plan.name)}
            Subscribe to {plan.name}
          </DialogTitle>
          <DialogDescription>
            Complete your subscription to start using the {plan.name} plan
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Plan Summary */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{plan.name} Plan</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </div>
                <Badge className={getPlanColor(plan.name)}>
                  ${plan.monthly_price}/month
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly Quota:</span>
                  <span className="font-medium">{plan.monthly_quota.toLocaleString()} requests</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rate Limit:</span>
                  <span className="font-medium">{plan.rate_limit_per_minute} requests/min</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          {step === 'payment' && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <ExternalLink className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Secure Checkout</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      You&apos;ll be redirected to Stripe&apos;s secure checkout page to complete your payment.
                      Your payment information is never stored on our servers.
                    </p>
                  </div>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCheckoutRedirect}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Redirecting...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Continue to Checkout
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Processing State */}
          {step === 'processing' && (
            <div className="text-center py-8">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
              <h3 className="text-lg font-semibold mb-2">Redirecting to Checkout</h3>
              <p className="text-gray-600">
                Please wait while we redirect you to Stripe&apos;s secure checkout page...
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
