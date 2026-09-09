import { STRIPE_API_ENDPOINTS } from './config'

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

  async createCustomer(): Promise<{ customer_id: string }> {
    return this.request(STRIPE_API_ENDPOINTS.CUSTOMERS, {
      method: 'POST',
    })
  }

  async getCustomer(): Promise<Record<string, unknown>> {
    return this.request(`${STRIPE_API_ENDPOINTS.CUSTOMERS}/me`)
  }

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

  async createCustomerPortalSession(): Promise<{ url: string }> {
    return this.request(STRIPE_API_ENDPOINTS.CUSTOMER_PORTAL, {
      method: 'POST',
    })
  }

  async getPaymentMethods(): Promise<Record<string, unknown>[]> {
    return this.request(STRIPE_API_ENDPOINTS.PAYMENT_METHODS)
  }

  async detachPaymentMethod(payment_method_id: string): Promise<Record<string, unknown>> {
    return this.request(`${STRIPE_API_ENDPOINTS.PAYMENT_METHODS}/${payment_method_id}`, {
      method: 'DELETE',
    })
  }

  async getInvoices(limit: number = 10): Promise<Record<string, unknown>[]> {
    return this.request(`${STRIPE_API_ENDPOINTS.INVOICES}?limit=${limit}`)
  }

  async getPlans(): Promise<Record<string, unknown>[]> {
    return this.request(STRIPE_API_ENDPOINTS.PLANS)
  }

  async getPlan(plan_id: number): Promise<Record<string, unknown>> {
    return this.request(`${STRIPE_API_ENDPOINTS.PLANS}/${plan_id}`)
  }

  async getUsage(): Promise<Record<string, unknown>> {
    return this.request(STRIPE_API_ENDPOINTS.USAGE)
  }

  async createPaymentIntent(data: {
    amount: number
    currency?: string
  }): Promise<{ client_secret: string; payment_intent_id: string }> {
    return this.request('/api/v1/billing/payment-intent', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }
}

export const stripeAPI = new StripeAPI()

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
