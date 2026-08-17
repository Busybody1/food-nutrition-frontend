/**
 * API client for Food Database Service
 * Handles authentication, rate limiting, and error handling
 */

import { ApiResponse, PaginatedResponse, ApiError, ApiErrorDetails } from '@/types/api';
import { getUserFacingApiMessage } from '@/lib/api/errors';
import { normalizePaginatedResponse, unwrapSuccessPayload } from '@/lib/api/paginated';

// Types
interface RegisterData {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  company_name?: string;
}

interface UpdateProfileData {
  first_name?: string;
  last_name?: string;
  email?: string;
}

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiClient {
  private baseURL: string;
  private apiKey: string | null = null;
  private accessToken: string | null = null;

  constructor() {
    this.baseURL = API_BASE_URL;
    
    // Load stored credentials
    if (typeof window !== 'undefined') {
      this.apiKey = localStorage.getItem('api_key');
      this.accessToken = localStorage.getItem('access_token');
    }
  }

  // Authentication methods
  setApiKey(apiKey: string | null) {
    this.apiKey = apiKey;
    if (typeof window !== 'undefined') {
      if (apiKey) {
        localStorage.setItem('api_key', apiKey);
      } else {
        localStorage.removeItem('api_key');
      }
    }
  }

  setAccessToken(token: string | null) {
    this.accessToken = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('access_token', token);
      } else {
        localStorage.removeItem('access_token');
      }
    }
  }

  // Reload credentials from storage (Next.js module init may run before localStorage exists)
  private syncCredentialsFromStorage(): void {
    if (typeof window === 'undefined') return;
    this.apiKey = localStorage.getItem('api_key');
    this.accessToken = localStorage.getItem('access_token');
  }

  // Get headers for API requests
  private getHeaders(): HeadersInit {
    this.syncCredentialsFromStorage();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    }

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    return headers;
  }

  private async tryRefreshToken(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    const refresh = localStorage.getItem('refresh_token');
    if (!refresh) return false;
    try {
      const res = await fetch(`${this.baseURL}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token_value: refresh }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      if (data.access_token) {
        this.setAccessToken(data.access_token);
        if (data.refresh_token) {
          localStorage.setItem('refresh_token', data.refresh_token);
        }
        return true;
      }
    } catch {
      return false;
    }
    return false;
  }

  // Generic request method with enhanced error handling
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retried = false
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    const headers: Record<string, string> = {
      ...(this.getHeaders() as Record<string, string>),
      ...(options.headers as Record<string, string> | undefined),
    };
    // Multipart bodies need the browser-generated boundary Content-Type.
    if (options.body instanceof FormData) {
      delete headers['Content-Type'];
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 401 && !retried) {
        const refreshed = await this.tryRefreshToken();
        if (refreshed) {
          return this.request<T>(endpoint, options, true);
        }
      }

      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('text/csv') || contentType.includes('application/octet-stream')) {
        if (!response.ok) {
          throw new ApiError('Export failed', response.status);
        }
        const blob = await response.blob();
        return { data: blob as T, success: true, status: response.status };
      }

      const data = await response.json();

      if (!response.ok) {
        const userMessage = getUserFacingApiMessage(response.status, data);

        throw new ApiError(
          userMessage,
          response.status,
          { ...data, originalMessage: data.detail }
        );
      }

      return {
        data: unwrapSuccessPayload(data) as T,
        success: true,
        status: response.status,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new ApiError(
          'Unable to connect to the server. Please check your internet connection.',
          0,
          error as unknown as ApiErrorDetails
        );
      }

      throw new ApiError(
        error instanceof Error ? error.message : 'Network error',
        0,
        error as ApiErrorDetails
      );
    }
  }

  // GET request
  async get<T>(endpoint: string, params?: Record<string, unknown>): Promise<ApiResponse<T>> {
    const url = new URL(`${this.baseURL}${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return this.request<T>(url.pathname + url.search);
  }

  // POST request
  async post<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // Multipart POST (file uploads)
  async postFormData<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: formData,
    });
  }

  // PUT request
  async put<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PATCH request
  async patch<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  // Paginated GET request
  async getPaginated<T>(
    endpoint: string,
    params?: Record<string, unknown>
  ): Promise<PaginatedResponse<T>> {
    const response = await this.get<PaginatedResponse<T> | T[]>(endpoint, params);
    return normalizePaginatedResponse<T>(response.data);
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Export individual API methods for convenience
export const api = {
  // Authentication
  auth: {
    login: (email: string, password: string) =>
      apiClient.post('/api/v1/auth/login', { email, password }),
    
    register: (userData: RegisterData) =>
      apiClient.post('/api/v1/auth/register', userData), // Removed plan_id - backend assigns default
    
    refreshToken: (refreshToken: string) =>
      apiClient.post('/api/v1/auth/refresh', { refresh_token_value: refreshToken }), // Fixed: refresh_token_value

    getProfile: () =>
      apiClient.get('/api/v1/auth/me'),

    // Email verification (6-digit OTP)
    verifyEmailCode: (data: { email: string; code: string }) =>
      apiClient.post('/api/v1/auth/verify-email-code', data),

    resendCode: (data: { email: string }) =>
      apiClient.post('/api/v1/auth/resend-verification-code', data),
  },

  // API Keys
  apiKeys: {
    list: () =>
      apiClient.get('/api/v1/users/api-keys'), // Fixed: /users/ (plural)
    
    create: (name: string) =>
      apiClient.post('/api/v1/users/api-keys', { name }), // Fixed: /users/ (plural)
    
    // Note: Backend doesn't support updating API keys - removed update method
    revoke: (keyId: number) =>
      apiClient.delete(`/api/v1/users/api-keys/${keyId}`), // Fixed: /users/ (plural)
  },

  // Food Search
  search: {
    foods: (query: string, params?: Record<string, unknown>) =>
      apiClient.getPaginated('/api/v1/search/foods', { q: query, ...params }),
    
    brands: (query: string, params?: Record<string, unknown>) =>
      apiClient.getPaginated('/api/v1/search/brands', { q: query, ...params }),
    
    categories: (query: string, params?: Record<string, unknown>) =>
      apiClient.getPaginated('/api/v1/search/categories', { q: query, ...params }),
    
    nutrients: (query: string, params?: Record<string, unknown>) =>
      apiClient.getPaginated('/api/v1/search/nutrients', { q: query, ...params }),

    suggest: (query: string, limit = 15) =>
      apiClient.get<Array<{ id: number; name: string; brand_name?: string }>>(
        '/api/v1/search/suggest',
        { q: query, limit }
      ),
  },

  // Lightweight catalog (meta-only foods; authenticated; limit max 100)
  catalog: {
    foods: (params?: Record<string, unknown>) =>
      apiClient.getPaginated('/api/v1/catalog/foods', params),
    getFood: (id: number) =>
      apiClient.get(`/api/v1/catalog/foods/${id}`),
    brands: (params?: Record<string, unknown>) =>
      apiClient.getPaginated('/api/v1/catalog/brands', params),
    categories: (params?: Record<string, unknown>) =>
      apiClient.getPaginated('/api/v1/catalog/categories', params),
    nutrients: (params?: Record<string, unknown>) =>
      apiClient.getPaginated('/api/v1/catalog/nutrients', params),
  },

  // Public demo (no API key; IP rate limited; same filters, lower limits)
  public: {
    searchFoods: (query: string, params?: Record<string, unknown>) =>
      apiClient.getPaginated('/api/v1/public/search/foods', { q: query, ...params }),
    catalogFoods: (params?: Record<string, unknown>) =>
      apiClient.getPaginated('/api/v1/public/catalog/foods', params),
    catalogFood: (id: number) =>
      apiClient.get(`/api/v1/public/catalog/foods/${id}`),
    brands: (params?: Record<string, unknown>) =>
      apiClient.getPaginated('/api/v1/public/catalog/brands', params),
    categories: (params?: Record<string, unknown>) =>
      apiClient.getPaginated('/api/v1/public/catalog/categories', params),
    nutrients: (params?: Record<string, unknown>) =>
      apiClient.getPaginated('/api/v1/public/catalog/nutrients', params),
  },

  // Food Data
  foods: {
    list: (params?: Record<string, unknown>) =>
      apiClient.getPaginated('/api/v1/foods/', params), // Fixed: added trailing slash
    
    get: (id: number) =>
      apiClient.get(`/api/v1/foods/${id}`),
    
    brands: (params?: Record<string, unknown>) =>
      apiClient.getPaginated('/api/v1/foods/brands/', params), // Fixed: added trailing slash
    
    categories: (params?: Record<string, unknown>) =>
      apiClient.getPaginated('/api/v1/foods/categories/', params), // Fixed: added trailing slash
    
    nutrients: (params?: Record<string, unknown>) =>
      apiClient.getPaginated('/api/v1/foods/nutrients/', params), // Fixed: added trailing slash
  },

  // Billing
  billing: {
    getSubscription: () =>
      apiClient.get('/api/v1/billing/subscription'),
    
    getPlans: () =>
      apiClient.get('/api/v1/billing/plans'),
    
    createSubscription: (planId: number, paymentMethodId?: string) =>
      apiClient.post('/api/v1/billing/subscribe', {
        plan_id: planId,
        payment_method_id: paymentMethodId,
      }),

    createCheckoutSession: (data: { plan_id: number; success_url?: string; cancel_url?: string }) =>
      apiClient.post('/api/v1/billing/checkout-sessions', data),
    
    updateSubscription: (planId: number) =>
      apiClient.put('/api/v1/billing/subscription', { plan_id: planId }),
    
    cancelSubscription: () =>
      apiClient.delete('/api/v1/billing/subscription'),
    
    getInvoices: () =>
      apiClient.get('/api/v1/billing/invoices'),
    
    createCustomerPortalSession: () =>
      apiClient.post('/api/v1/billing/customer-portal'),
    
    createPaymentIntent: (amount: number, currency: string = 'usd') =>
      apiClient.post('/api/v1/billing/payment-intent', {
        amount,
        currency,
      }),
  },

  // User
  user: {
    getProfile: () =>
      apiClient.get('/api/v1/users/profile'), // Fixed: /users/ (plural)
    
    updateProfile: (data: UpdateProfileData) =>
      apiClient.put('/api/v1/users/profile', data), // Fixed: /users/ (plural)
    
    changePassword: (currentPassword: string, newPassword: string) =>
      apiClient.post('/api/v1/users/change-password', { // Fixed: /users/ (plural)
        current_password: currentPassword,
        new_password: newPassword,
      }),
    
    getUsage: () =>
      apiClient.get('/api/v1/users/usage'), // Fixed: /users/ (plural)

    submitFeedback: (data: {
      category: 'feedback' | 'error'
      message: string
      page?: string
    }) => apiClient.post('/api/v1/users/feedback', data),
  },

  // Usage Analytics
  usage: {
    getUsageData: (timeRange: string) =>
      apiClient.get(`/api/v1/users/usage/data?time_range=${timeRange}`), // Fixed: /users/ (plural)
    
    getEndpointUsage: (timeRange: string) =>
      apiClient.get(`/api/v1/users/usage/endpoints?time_range=${timeRange}`), // Fixed: /users/ (plural)
    
    getUsageStats: () =>
      apiClient.get('/api/v1/users/usage/stats'), // Fixed: /users/ (plural)
    
    exportUsageData: (timeRange: string) =>
      apiClient.get<Blob>(`/api/v1/users/usage/export?time_range=${timeRange}`),
  },

  // Admin
  admin: {
    getUsers: (params?: Record<string, unknown>) =>
      apiClient.getPaginated('/api/v1/admin/users', params),
    
    getUser: (id: number) =>
      apiClient.get(`/api/v1/admin/users/${id}`),
    
    updateUser: (id: number, data: UpdateProfileData) =>
      apiClient.put(`/api/v1/admin/users/${id}/status`, data), // Fixed: backend uses /status endpoint
    
    getPlatformUsage: () =>
      apiClient.get('/api/v1/admin/platform-usage'),
    
    getAnalytics: (params?: Record<string, unknown>) =>
      apiClient.get('/api/v1/admin/analytics', params),
  },
};

export default apiClient;