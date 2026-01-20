import { STRIPE_API_ENDPOINTS } from './config'

// API client for Stripe-related endpoints
class StripeAPI {
  private baseURL: string

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    // Add auth token if available
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token')
      if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`
      }
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error)
      throw error
    }
  }

  // Customer management
  async createCustomer(): Promise<{ customer_id: string }> {
    return this.request(STRIPE_API_ENDPOINTS.CUSTOMERS, {
      method: 'POST',
    })
  }

  async getCustomer(): Promise<Record<string, unknown>> {
    return this.request(`${STRIPE_API_ENDPOINTS.CUSTOMERS}/me`)
  }

  // Subscription management
  async createSubscription(data: {
    plan_id: number
    payment_method_id?: string
  }): Promise<Record<string, unknown>> {
    return this.request(STRIPE_API_ENDPOINTS.SUBSCRIPTIONS, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getSubscription(): Promise<Record<string, unknown>> {
    return this.request(STRIPE_API_ENDPOINTS.SUBSCRIPTIONS)
  }

  async updateSubscription(plan_id: number): Promise<Record<string, unknown>> {
    return this.request(STRIPE_API_ENDPOINTS.SUBSCRIPTIONS, {
      method: 'PUT',
      body: JSON.stringify({ plan_id }),
    })
  }

  async cancelSubscription(cancel_at_period_end: boolean = true): Promise<Record<string, unknown>> {
    return this.request(STRIPE_API_ENDPOINTS.SUBSCRIPTIONS, {
      method: 'DELETE',
      body: JSON.stringify({ cancel_at_period_end }),
    })
  }

  // Checkout sessions
  async createCheckoutSession(data: {
    plan_id: number
    success_url?: string
    cancel_url?: string
  }): Promise<{ id: string; url: string }> {
    return this.request(STRIPE_API_ENDPOINTS.CHECKOUT_SESSIONS, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Customer portal
  async createCustomerPortalSession(): Promise<{ url: string }> {
    return this.request(STRIPE_API_ENDPOINTS.CUSTOMER_PORTAL, {
      method: 'POST',
    })
  }

  // Payment methods
  async getPaymentMethods(): Promise<Record<string, unknown>[]> {
    return this.request(STRIPE_API_ENDPOINTS.PAYMENT_METHODS)
  }

  async detachPaymentMethod(payment_method_id: string): Promise<Record<string, unknown>> {
    return this.request(`${STRIPE_API_ENDPOINTS.PAYMENT_METHODS}/${payment_method_id}`, {
      method: 'DELETE',
    })
  }

  // Invoices
  async getInvoices(limit: number = 10): Promise<Record<string, unknown>[]> {
    return this.request(`${STRIPE_API_ENDPOINTS.INVOICES}?limit=${limit}`)
  }

  // Plans
  async getPlans(): Promise<Record<string, unknown>[]> {
    return this.request(STRIPE_API_ENDPOINTS.PLANS)
  }

  async getPlan(plan_id: number): Promise<Record<string, unknown>> {
    return this.request(`${STRIPE_API_ENDPOINTS.PLANS}/${plan_id}`)
  }

  // Usage
  async getUsage(): Promise<Record<string, unknown>> {
    return this.request(STRIPE_API_ENDPOINTS.USAGE)
  }

  // Payment intents
  async createPaymentIntent(data: {
    amount: number
    currency?: string
  }): Promise<{ client_secret: string; payment_intent_id: string }> {
    return this.request('/v1/billing/payment-intent', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }
}

// Export singleton instance
export const stripeAPI = new StripeAPI()

// Export individual methods for convenience
export const {
  createCustomer,
  getCustomer,
  createSubscription,
  getSubscription,
  updateSubscription,
  cancelSubscription,
  createCheckoutSession,
  createCustomerPortalSession,
  getPaymentMethods,
  detachPaymentMethod,
  getInvoices,
  getPlans,
  getPlan,
  getUsage,
  createPaymentIntent,
} = stripeAPI
