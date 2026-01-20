'use client'

import React, { useState } from 'react'
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CreditCard, CheckCircle, XCircle } from 'lucide-react'
import { getErrorMessage } from '@/lib/stripe/config'
import { stripeAPI } from '@/lib/stripe/api'

interface DirectSubscriptionFormProps {
  planId: number
  planName: string
  amount: number
  onSuccess: () => void
  onError: (error: string) => void
  onCancel: () => void
}

export function DirectSubscriptionForm({
  planId,
  planName,
  amount,
  onSuccess,
  onError,
  onCancel,
}: DirectSubscriptionFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'card' | 'processing' | 'confirming' | 'success'>('card')

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsLoading(true)
    setError(null)
    setStep('processing')

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

      // Step 2: Create subscription with payment method
      setStep('confirming')
      const subscriptionResponse = await stripeAPI.createSubscription({
        plan_id: planId,
        payment_method_id: paymentMethod.id,
      }) as { client_secret?: string; subscription_id?: string; status?: string }

      // Step 3: Handle payment confirmation if required
      if (subscriptionResponse.client_secret) {
        const { error: confirmError } = await stripe.confirmCardPayment(
          subscriptionResponse.client_secret
        )

        if (confirmError) {
          throw new Error(getErrorMessage(confirmError))
        }
      }

      setStep('success')
      onSuccess()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      onError(errorMessage)
      setStep('card')
    } finally {
      setIsLoading(false)
    }
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

  if (step === 'success') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Subscription Active!
            </h3>
            <p className="text-gray-600 mb-4">
              Your {planName} subscription is now active. You can start using all the features immediately.
            </p>
            <Button onClick={onCancel} className="w-full">
              Go to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (step === 'confirming') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center">
            <Loader2 className="h-16 w-16 text-blue-500 mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Confirming Payment
            </h3>
            <p className="text-gray-600">
              Please wait while we confirm your payment and activate your subscription...
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="h-5 w-5 mr-2" />
          Subscribe to {planName}
        </CardTitle>
        <CardDescription>
          Complete your subscription - ${(amount / 100).toFixed(2)}/month
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="card-element">Card Information</Label>
              <div className="mt-2 p-3 border border-gray-300 rounded-md">
                <CardElement
                  id="card-element"
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

          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!stripe || isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {step === 'processing' ? 'Creating Subscription...' : 'Confirming Payment...'}
                </>
              ) : (
                'Subscribe Now'
              )}
            </Button>
          </div>
        </form>

        <div className="mt-6 text-xs text-gray-500 text-center">
          <p>
            Your payment information is encrypted and secure. We never store your card details.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
