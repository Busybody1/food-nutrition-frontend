'use client'

import React, { useState } from 'react'
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CreditCard, CheckCircle, XCircle } from 'lucide-react'
import { getErrorMessage } from '@/lib/stripe/config'

interface PaymentFormProps {
  planName: string
  amount: number
  onSuccess: (paymentMethodId: string) => void
  onError: (error: string) => void
  onCancel: () => void
}

export function PaymentForm({
  planName,
  amount,
  onSuccess,
  onError,
  onCancel,
}: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const cardElement = elements.getElement(CardElement)
      if (!cardElement) {
        throw new Error('Card element not found')
      }

      // Create payment method
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

      // Call success callback
      onSuccess(paymentMethod.id)
      setSuccess(true)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      onError(errorMessage)
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

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Payment Method Added Successfully
            </h3>
            <p className="text-gray-600 mb-4">
              Your payment method has been securely saved and you can now subscribe to the {planName} plan.
            </p>
            <Button onClick={onCancel} className="w-full">
              Continue
            </Button>
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
          Add Payment Method
        </CardTitle>
        <CardDescription>
          Secure payment for {planName} plan - ${(amount / 100).toFixed(2)}/month
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
                  Processing...
                </>
              ) : (
                'Add Payment Method'
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
