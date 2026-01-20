'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  CreditCard, 
  Trash2, 
  Plus, 
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react'
import { useStripe } from '@/contexts/StripeContext'
import { PaymentForm } from './PaymentForm'

export function PaymentMethodManager() {
  const {
    paymentMethods,
    isPaymentMethodsLoading,
    detachPaymentMethod,
    loadPaymentMethods,
    error,
  } = useStripe()

  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<{ id: number; name: string; amount: number } | null>(null)

  const handleDelete = async (paymentMethodId: string) => {
    try {
      setIsDeleting(paymentMethodId)
      await detachPaymentMethod(paymentMethodId)
    } catch (error) {
      console.error('Failed to delete payment method:', error)
    } finally {
      setIsDeleting(null)
    }
  }

  const handleAddPaymentMethod = (planId: number, planName: string, amount: number) => {
    setSelectedPlan({ id: planId, name: planName, amount })
    setShowAddForm(true)
  }

  const handlePaymentSuccess = async () => {
    try {
      // Reload payment methods to show the new one
      await loadPaymentMethods()
      setShowAddForm(false)
      setSelectedPlan(null)
    } catch (error) {
      console.error('Failed to reload payment methods:', error)
    }
  }

  const handlePaymentError = (error: string) => {
    console.error('Payment method error:', error)
  }

  const handleCancel = () => {
    setShowAddForm(false)
    setSelectedPlan(null)
  }

  const getCardBrandIcon = (brand: string) => {
    switch (brand.toLowerCase()) {
      case 'visa':
        return '💳'
      case 'mastercard':
        return '💳'
      case 'amex':
        return '💳'
      case 'discover':
        return '💳'
      default:
        return '💳'
    }
  }

  const getCardBrandColor = (brand: string) => {
    switch (brand.toLowerCase()) {
      case 'visa':
        return 'text-blue-600'
      case 'mastercard':
        return 'text-red-600'
      case 'amex':
        return 'text-green-600'
      case 'discover':
        return 'text-orange-600'
      default:
        return 'text-gray-600'
    }
  }

  if (showAddForm && selectedPlan) {
    return (
      <PaymentForm
        planName={selectedPlan.name}
        amount={selectedPlan.amount}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
        onCancel={handleCancel}
      />
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Payment Methods
            </CardTitle>
            <CardDescription>
              Manage your saved payment methods
            </CardDescription>
          </div>
          <Button
            onClick={() => handleAddPaymentMethod(1, 'Basic Plan', 900)}
            size="sm"
            className="flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Method
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isPaymentMethodsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading payment methods...</span>
          </div>
        ) : paymentMethods.length === 0 ? (
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 mb-4">No payment methods saved</p>
            <Button
              onClick={() => handleAddPaymentMethod(1, 'Basic Plan', 900)}
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Payment Method
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">
                    {getCardBrandIcon(method.card?.brand || 'card')}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">
                        {method.card?.brand?.toUpperCase() || 'CARD'}
                      </span>
                      <span className={`text-sm ${getCardBrandColor(method.card?.brand || 'card')}`}>
                        •••• •••• •••• {method.card?.last4}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      Expires {method.card?.exp_month?.toString().padStart(2, '0')}/
                      {method.card?.exp_year}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(method.id)}
                    disabled={isDeleting === method.id}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    {isDeleting === method.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="mt-6 text-xs text-gray-500">
          <p>
            Your payment methods are encrypted and secure. We never store your full card details.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
