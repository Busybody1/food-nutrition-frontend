'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Zap, Crown, Star, ArrowRight } from 'lucide-react'
import { formatPrice } from '@/lib/stripe/config'
import { DirectSubscriptionForm } from './DirectSubscriptionForm'

import { Plan } from '@/types/api'

interface SubscriptionCardProps {
  plan: Plan
  currentPlan?: Plan | null
  onSelect: (plan: Plan) => void
  isLoading?: boolean
  isPopular?: boolean
}

export function SubscriptionCard({
  plan,
  currentPlan,
  onSelect,
  isLoading = false,
  isPopular = false,
}: SubscriptionCardProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [showDirectForm, setShowDirectForm] = useState(false)

  const isCurrentPlan = currentPlan?.id === plan.id
  const isUpgrade = currentPlan && plan.monthly_price > currentPlan.monthly_price
  const isDowngrade = currentPlan && plan.monthly_price < currentPlan.monthly_price

  const handleSelect = async () => {
    if (isCurrentPlan) return

    try {
      setIsProcessing(true)
      
      if (isUpgrade || isDowngrade) {
        // Handle plan change
        onSelect(plan)
      } else {
        // Redirect to checkout page for new subscriptions
        window.location.href = `/checkout?plan_id=${plan.id}`
      }
    } catch (error) {
      console.error('Failed to select plan:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDirectSubscriptionSuccess = () => {
    setShowDirectForm(false)
    // Reload subscription data
    window.location.reload()
  }

  const handleDirectSubscriptionError = (error: string) => {
    console.error('Direct subscription error:', error)
    setShowDirectForm(false)
  }

  const handleDirectSubscriptionCancel = () => {
    setShowDirectForm(false)
  }

  const getPlanIcon = (planName: string) => {
    const name = planName.toLowerCase()
    if (name.includes('free') || name.includes('basic')) return <Zap className="h-6 w-6" />
    if (name.includes('professional') || name.includes('pro')) return <Crown className="h-6 w-6" />
    if (name.includes('enterprise') || name.includes('unlimited')) return <Star className="h-6 w-6" />
    return <Zap className="h-6 w-6" />
  }

  const getPlanColor = (planName: string) => {
    const name = planName.toLowerCase()
    if (name.includes('free') || name.includes('basic')) return 'text-blue-600'
    if (name.includes('professional') || name.includes('pro')) return 'text-purple-600'
    if (name.includes('enterprise') || name.includes('unlimited')) return 'text-gold-600'
    return 'text-gray-600'
  }

  const formatQuota = (quota: number) => {
    if (quota >= 1000000) return `${(quota / 1000000).toFixed(1)}M`
    if (quota >= 1000) return `${(quota / 1000).toFixed(0)}K`
    return quota.toString()
  }

  const getFeatures = (plan: Plan) => {
    const baseFeatures = [
      `${formatQuota(plan.monthly_quota)} API calls/month`,
      `${plan.rate_limit_per_minute} requests/minute`,
      'Food & Nutrition data',
      'REST API access',
      'JSON responses',
    ]

    if (plan.monthly_price > 0) {
      baseFeatures.push('Priority support')
    }

    if (plan.monthly_price >= 99) {
      baseFeatures.push('UPC lookup')
      baseFeatures.push('Advanced search')
    }

    if (plan.monthly_price >= 299) {
      baseFeatures.push('Autocomplete API')
      baseFeatures.push('Advanced analytics')
      baseFeatures.push('Custom integrations')
    }

    return baseFeatures
  }

  const features = getFeatures(plan)

  if (showDirectForm) {
    return (
      <DirectSubscriptionForm
        planId={plan.id}
        planName={plan.name}
        amount={plan.monthly_price}
        onSuccess={handleDirectSubscriptionSuccess}
        onError={handleDirectSubscriptionError}
        onCancel={handleDirectSubscriptionCancel}
      />
    )
  }

  return (
    <Card className={`relative transition-all duration-200 hover:shadow-lg ${
      isCurrentPlan ? 'ring-2 ring-blue-500 bg-blue-50' : ''
    } ${isPopular ? 'ring-2 ring-purple-500 shadow-lg' : ''}`}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-purple-600 text-white px-3 py-1">
            Most Popular
          </Badge>
        </div>
      )}

      <CardHeader className="text-center pb-4">
        <div className={`mx-auto mb-4 ${getPlanColor(plan.name)}`}>
          {getPlanIcon(plan.name)}
        </div>
        <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
        <CardDescription className="text-sm text-gray-600">
          {plan.description}
        </CardDescription>
        <div className="mt-4">
          <span className="text-4xl font-bold text-gray-900">
            {formatPrice(plan.monthly_price)}
          </span>
          <span className="text-gray-600 ml-2">/month</span>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-4">
          <div className="space-y-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span className="text-sm text-gray-700">{feature}</span>
              </div>
            ))}
          </div>

          <div className="pt-4">
            <Button
              onClick={handleSelect}
              disabled={isCurrentPlan || isLoading || isProcessing}
              className={`w-full ${
                isCurrentPlan
                  ? 'bg-green-600 hover:bg-green-700'
                  : isPopular
                  ? 'bg-purple-600 hover:bg-purple-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Processing...
                </>
              ) : isCurrentPlan ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Current Plan
                </>
              ) : isUpgrade ? (
                <>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Upgrade Plan
                </>
              ) : isDowngrade ? (
                <>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Downgrade Plan
                </>
              ) : (
                <>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Get Started
                </>
              )}
            </Button>
          </div>

          {isCurrentPlan && (
            <div className="text-center">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Check className="h-3 w-3 mr-1" />
                Active
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
