import { loadStripe, Stripe } from '@stripe/stripe-js'

// Stripe configuration
const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

if (!STRIPE_PUBLISHABLE_KEY) {
  console.warn('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set. Stripe features will be disabled.')
}

// Initialize Stripe
let stripePromise: Promise<Stripe | null>

export const getStripe = () => {
  if (!stripePromise) {
    if (!STRIPE_PUBLISHABLE_KEY) {
      stripePromise = Promise.resolve(null)
    } else {
      stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY)
    }
  }
  return stripePromise
}

// Stripe configuration options
export const stripeOptions = {
  appearance: {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#0ea5e9',
      colorBackground: '#ffffff',
      colorText: '#1f2937',
      colorDanger: '#ef4444',
      fontFamily: 'Inter, system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px',
    },
    rules: {
      '.Input': {
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        padding: '12px',
        fontSize: '16px',
        lineHeight: '1.5',
      },
      '.Input:focus': {
        borderColor: '#0ea5e9',
        boxShadow: '0 0 0 3px rgba(14, 165, 233, 0.1)',
      },
      '.Label': {
        fontSize: '14px',
        fontWeight: '500',
        color: '#374151',
        marginBottom: '6px',
      },
      '.Error': {
        color: '#ef4444',
        fontSize: '14px',
        marginTop: '4px',
      },
    },
  },
  locale: 'en' as const,
}

// API endpoints - aligned with backend
export const STRIPE_API_ENDPOINTS = {
  CUSTOMERS: '/api/v1/billing/customers',
  SUBSCRIPTIONS: '/api/v1/billing/subscription',
  CHECKOUT_SESSIONS: '/api/v1/billing/checkout-sessions',
  CUSTOMER_PORTAL: '/api/v1/billing/customer-portal',
  PAYMENT_METHODS: '/api/v1/billing/payment-methods',
  INVOICES: '/api/v1/billing/invoices',
  PLANS: '/api/v1/billing/plans',
  USAGE: '/api/v1/billing/usage',
} as const

// Error messages
export const STRIPE_ERROR_MESSAGES = {
  CARD_DECLINED: 'Your card was declined. Please try a different payment method.',
  INSUFFICIENT_FUNDS: 'Your card has insufficient funds. Please try a different payment method.',
  EXPIRED_CARD: 'Your card has expired. Please try a different payment method.',
  INCORRECT_CVC: 'Your card\'s security code is incorrect. Please try again.',
  PROCESSING_ERROR: 'An error occurred while processing your card. Please try again.',
  NETWORK_ERROR: 'A network error occurred. Please check your connection and try again.',
  GENERIC_ERROR: 'Something went wrong. Please try again.',
} as const

// Plan tiers
export const PLAN_TIERS = {
  FREE: 'free',
  BASIC: 'basic',
  PROFESSIONAL: 'professional',
  ENTERPRISE: 'enterprise',
} as const

// Subscription statuses
export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  CANCELED: 'canceled',
  INCOMPLETE: 'incomplete',
  INCOMPLETE_EXPIRED: 'incomplete_expired',
  PAST_DUE: 'past_due',
  TRIALING: 'trialing',
  UNPAID: 'unpaid',
} as const

// Payment method types
export const PAYMENT_METHOD_TYPES = {
  CARD: 'card',
  BANK_ACCOUNT: 'us_bank_account',
  SEPA_DEBIT: 'sepa_debit',
} as const

// Currency codes
export const CURRENCY_CODES = {
  USD: 'usd',
  EUR: 'eur',
  GBP: 'gbp',
  CAD: 'cad',
  AUD: 'aud',
} as const

// Webhook events
export const WEBHOOK_EVENTS = {
  CUSTOMER_SUBSCRIPTION_CREATED: 'customer.subscription.created',
  CUSTOMER_SUBSCRIPTION_UPDATED: 'customer.subscription.updated',
  CUSTOMER_SUBSCRIPTION_DELETED: 'customer.subscription.deleted',
  INVOICE_PAYMENT_SUCCEEDED: 'invoice.payment_succeeded',
  INVOICE_PAYMENT_FAILED: 'invoice.payment_failed',
  CUSTOMER_SUBSCRIPTION_TRIAL_WILL_END: 'customer.subscription.trial_will_end',
  PAYMENT_METHOD_ATTACHED: 'payment_method.attached',
  PAYMENT_METHOD_DETACHED: 'payment_method.detached',
} as const

// Helper functions
export const formatPrice = (amount: number, currency: string = 'usd'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100)
}

export const formatDate = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export const getErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'type' in error) {
    const stripeError = error as { type: string; code?: string; message?: string }
    
    if (stripeError.type === 'card_error') {
      switch (stripeError.code) {
        case 'card_declined':
          return STRIPE_ERROR_MESSAGES.CARD_DECLINED
        case 'insufficient_funds':
          return STRIPE_ERROR_MESSAGES.INSUFFICIENT_FUNDS
        case 'expired_card':
          return STRIPE_ERROR_MESSAGES.EXPIRED_CARD
        case 'incorrect_cvc':
          return STRIPE_ERROR_MESSAGES.INCORRECT_CVC
        default:
          return stripeError.message || STRIPE_ERROR_MESSAGES.GENERIC_ERROR
      }
    }
    
    if (stripeError.type === 'validation_error') {
      return stripeError.message || STRIPE_ERROR_MESSAGES.GENERIC_ERROR
    }
    
    if (stripeError.type === 'api_error') {
      return STRIPE_ERROR_MESSAGES.NETWORK_ERROR
    }
  }
  
  // Handle Error objects
  if (error instanceof Error) {
    return error.message || STRIPE_ERROR_MESSAGES.GENERIC_ERROR
  }
  
  return STRIPE_ERROR_MESSAGES.GENERIC_ERROR
}

// Validation helpers
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validateCardNumber = (cardNumber: string): boolean => {
  // Remove spaces and non-digits
  const cleaned = cardNumber.replace(/\D/g, '')
  // Basic length validation (13-19 digits)
  return cleaned.length >= 13 && cleaned.length <= 19
}

export const validateCVC = (cvc: string): boolean => {
  const cleaned = cvc.replace(/\D/g, '')
  return cleaned.length >= 3 && cleaned.length <= 4
}

export const validateExpiryDate = (month: string, year: string): boolean => {
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth() + 1
  
  const expMonth = parseInt(month, 10)
  const expYear = parseInt(year, 10)
  
  if (expMonth < 1 || expMonth > 12) return false
  if (expYear < currentYear) return false
  if (expYear === currentYear && expMonth < currentMonth) return false
  
  return true
}
