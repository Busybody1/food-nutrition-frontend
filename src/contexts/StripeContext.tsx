'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Stripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { getStripe, stripeOptions } from '@/lib/stripe/config'
import { stripeAPI } from '@/lib/stripe/api'

// Types
import { Plan } from '@/types/api'

interface Subscription {
  subscription_id: string
  status: string
  plan_id: number
  plan_name: string
  monthly_price: number
  monthly_quota: number
  rate_limit_per_minute: number
  created_at: string
  current_period_start?: string
  current_period_end?: string
}

interface PaymentMethod {
  id: string
  type: string
  card?: {
    brand: string
    last4: string
    exp_month: number
    exp_year: number
  }
}

interface Invoice {
  id: string
  number?: string
  status: string
  amount_paid: number
  amount_due: number
  currency: string
  created: number
  period_start?: number
  period_end?: number
  hosted_invoice_url?: string
  invoice_pdf?: string
}

interface Usage {
  requests_this_month: number
  monthly_quota: number
  rate_limit_per_minute: number
  plan_name: string
  remaining_requests: number
}

interface StripeContextType {
  // Stripe instance
  stripe: Stripe | null
  isStripeLoaded: boolean
  
  // Data
  plans: Plan[]
  subscription: Subscription | null
  paymentMethods: PaymentMethod[]
  invoices: Invoice[]
  usage: Usage | null
  
  // Loading states
  isLoading: boolean
  isPlansLoading: boolean
  isSubscriptionLoading: boolean
  isPaymentMethodsLoading: boolean
  isInvoicesLoading: boolean
  isUsageLoading: boolean
  
  // Error states
  error: string | null
  
  // Actions
  loadPlans: () => Promise<void>
  loadSubscription: () => Promise<void>
  loadPaymentMethods: () => Promise<void>
  loadInvoices: () => Promise<void>
  loadUsage: () => Promise<void>
  createSubscription: (planId: number, paymentMethodId?: string) => Promise<Record<string, unknown>>
  updateSubscription: (planId: number) => Promise<void>
  cancelSubscription: (cancelAtPeriodEnd?: boolean) => Promise<void>
  createCheckoutSession: (planId: number, successUrl?: string, cancelUrl?: string) => Promise<string>
  createCustomerPortalSession: () => Promise<string>
  detachPaymentMethod: (paymentMethodId: string) => Promise<void>
  clearError: () => void
}

// Create context
const StripeContext = createContext<StripeContextType | undefined>(undefined)

// Provider component
export function StripeProvider({ children }: { children: ReactNode }) {
  const [stripe, setStripe] = useState<Stripe | null>(null)
  const [isStripeLoaded, setIsStripeLoaded] = useState(false)
  
  // Data state
  const [plans, setPlans] = useState<Plan[]>([])
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [usage, setUsage] = useState<Usage | null>(null)
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false)
  const [isPlansLoading, setIsPlansLoading] = useState(false)
  const [isSubscriptionLoading, setIsSubscriptionLoading] = useState(false)
  const [isPaymentMethodsLoading, setIsPaymentMethodsLoading] = useState(false)
  const [isInvoicesLoading, setIsInvoicesLoading] = useState(false)
  const [isUsageLoading, setIsUsageLoading] = useState(false)
  
  // Error state
  const [error, setError] = useState<string | null>(null)

  // Initialize Stripe
  useEffect(() => {
    const initializeStripe = async () => {
      try {
        const stripeInstance = await getStripe()
        setStripe(stripeInstance)
        setIsStripeLoaded(true)
      } catch (err) {
        console.error('Failed to initialize Stripe:', err)
        setError('Failed to initialize payment system')
      }
    }

    initializeStripe()
  }, [])

  // Load plans
  const loadPlans = async () => {
    try {
      setIsPlansLoading(true)
      setError(null)
      const plansData = await stripeAPI.getPlans()
      setPlans(plansData as unknown as Plan[])
    } catch (err) {
      console.error('Failed to load plans:', err)
      setError('Failed to load subscription plans')
    } finally {
      setIsPlansLoading(false)
    }
  }

  // Load subscription
  const loadSubscription = async () => {
    try {
      setIsSubscriptionLoading(true)
      setError(null)
      const subscriptionData = await stripeAPI.getSubscription()
      setSubscription(subscriptionData as unknown as Subscription)
    } catch (err) {
      console.error('Failed to load subscription:', err)
      setError('Failed to load subscription information')
    } finally {
      setIsSubscriptionLoading(false)
    }
  }

  // Load payment methods
  const loadPaymentMethods = async () => {
    try {
      setIsPaymentMethodsLoading(true)
      setError(null)
      const paymentMethodsData = await stripeAPI.getPaymentMethods()
      setPaymentMethods(paymentMethodsData as unknown as PaymentMethod[])
    } catch (err) {
      console.error('Failed to load payment methods:', err)
      setError('Failed to load payment methods')
    } finally {
      setIsPaymentMethodsLoading(false)
    }
  }

  // Load invoices
  const loadInvoices = async () => {
    try {
      setIsInvoicesLoading(true)
      setError(null)
      const invoicesData = await stripeAPI.getInvoices()
      setInvoices(invoicesData as unknown as Invoice[])
    } catch (err) {
      console.error('Failed to load invoices:', err)
      setError('Failed to load billing history')
    } finally {
      setIsInvoicesLoading(false)
    }
  }

  // Load usage
  const loadUsage = async () => {
    try {
      setIsUsageLoading(true)
      setError(null)
      const usageData = await stripeAPI.getUsage()
      setUsage(usageData as unknown as Usage)
    } catch (err) {
      console.error('Failed to load usage:', err)
      setError('Failed to load usage information')
    } finally {
      setIsUsageLoading(false)
    }
  }

  // Create subscription with payment method
  const createSubscriptionAction = async (planId: number, paymentMethodId?: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const result = await stripeAPI.createSubscription({ plan_id: planId, payment_method_id: paymentMethodId })
      await loadSubscription()
      return result
    } catch (err) {
      console.error('Failed to create subscription:', err)
      setError('Failed to create subscription')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Update subscription
  const updateSubscriptionAction = async (planId: number) => {
    try {
      setIsLoading(true)
      setError(null)
      await stripeAPI.updateSubscription(planId)
      await loadSubscription()
    } catch (err) {
      console.error('Failed to update subscription:', err)
      setError('Failed to update subscription')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Cancel subscription
  const cancelSubscriptionAction = async (cancelAtPeriodEnd: boolean = true) => {
    try {
      setIsLoading(true)
      setError(null)
      await stripeAPI.cancelSubscription(cancelAtPeriodEnd)
      await loadSubscription()
    } catch (err) {
      console.error('Failed to cancel subscription:', err)
      setError('Failed to cancel subscription')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Create checkout session
  const createCheckoutSessionAction = async (
    planId: number,
    successUrl?: string,
    cancelUrl?: string
  ): Promise<string> => {
    try {
      setError(null)
      const response = await stripeAPI.createCheckoutSession({
        plan_id: planId,
        success_url: successUrl,
        cancel_url: cancelUrl,
      })
      return response.url
    } catch (err) {
      console.error('Failed to create checkout session:', err)
      setError('Failed to create checkout session')
      throw err
    }
  }

  // Create customer portal session
  const createCustomerPortalSessionAction = async (): Promise<string> => {
    try {
      setError(null)
      const { url } = await stripeAPI.createCustomerPortalSession()
      return url
    } catch (err) {
      console.error('Failed to create customer portal session:', err)
      setError('Failed to create customer portal session')
      throw err
    }
  }

  // Detach payment method
  const detachPaymentMethodAction = async (paymentMethodId: string) => {
    try {
      setIsLoading(true)
      setError(null)
      await stripeAPI.detachPaymentMethod(paymentMethodId)
      await loadPaymentMethods()
    } catch (err) {
      console.error('Failed to detach payment method:', err)
      setError('Failed to remove payment method')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Clear error
  const clearError = () => {
    setError(null)
  }

  const contextValue: StripeContextType = {
    // Stripe instance
    stripe,
    isStripeLoaded,
    
    // Data
    plans,
    subscription,
    paymentMethods,
    invoices,
    usage,
    
    // Loading states
    isLoading,
    isPlansLoading,
    isSubscriptionLoading,
    isPaymentMethodsLoading,
    isInvoicesLoading,
    isUsageLoading,
    
    // Error state
    error,
    
    // Actions
    loadPlans,
    loadSubscription,
    loadPaymentMethods,
    loadInvoices,
    loadUsage,
    createSubscription: createSubscriptionAction,
    updateSubscription: updateSubscriptionAction,
    cancelSubscription: cancelSubscriptionAction,
    createCheckoutSession: createCheckoutSessionAction,
    createCustomerPortalSession: createCustomerPortalSessionAction,
    detachPaymentMethod: detachPaymentMethodAction,
    clearError,
  }

  return (
    <StripeContext.Provider value={contextValue}>
      <Elements stripe={stripe} options={stripeOptions}>
        {children}
      </Elements>
    </StripeContext.Provider>
  )
}

// Hook to use Stripe context
export function useStripe() {
  const context = useContext(StripeContext)
  if (context === undefined) {
    throw new Error('useStripe must be used within a StripeProvider')
  }
  return context
}

// Hook for Stripe Elements
export function useStripeElements() {
  const { stripe, isStripeLoaded } = useStripe()
  return { stripe, isStripeLoaded }
}
