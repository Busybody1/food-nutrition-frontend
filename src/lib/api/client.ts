/**
 * API client for Food Database Service
 * Handles authentication, rate limiting, and error handling
 */

import { ApiResponse, PaginatedResponse, ApiError, ApiErrorDetails } from '@/types/api';

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

  // Get headers for API requests
  private getHeaders(): HeadersInit {
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

  // Generic request method with enhanced error handling
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        // Provide user-friendly error messages based on status code
        let userMessage = data.detail || 'API request failed';
        
        switch (response.status) {
          case 400:
            userMessage = 'Invalid request. Please check your input and try again.';
            break;
          case 401:
            userMessage = 'Please log in to continue.';
            break;
          case 403:
            userMessage = 'You don\'t have permission to perform this action.';
            break;
          case 404:
            userMessage = 'The requested resource was not found.';
            break;
          case 422:
            userMessage = 'Please check your input and try again.';
            break;
          case 429:
            userMessage = 'Too many requests. Please wait a moment and try again.';
            break;
          case 500:
            userMessage = 'Server error. Please try again later.';
            break;
          case 502:
          case 503:
          case 504:
            userMessage = 'Service temporarily unavailable. Please try again later.';
            break;
        }

        throw new ApiError(
          userMessage,
          response.status,
          { ...data, originalMessage: data.detail }
        );
      }

      return {
        data: data.data || data,
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

  // PUT request
  async put<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
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
    const response = await this.get<PaginatedResponse<T>>(endpoint, params);
    return response.data;
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
      apiClient.get(`/api/v1/users/usage/export?time_range=${timeRange}`, { responseType: 'blob' }), // Fixed: /users/ (plural)
  },

  // Admin
  admin: {
    getUsers: (params?: Record<string, unknown>) =>
      apiClient.getPaginated('/api/v1/admin/users', params),
    
    getUser: (id: number) =>
      apiClient.get(`/api/v1/admin/users/${id}`),
    
    updateUser: (id: number, data: UpdateProfileData) =>
      apiClient.put(`/api/v1/admin/users/${id}/status`, data), // Fixed: backend uses /status endpoint
    
    getUsage: (params?: Record<string, unknown>) =>
      apiClient.getPaginated('/api/v1/admin/usage', params),
    
    getAnalytics: (params?: Record<string, unknown>) =>
      apiClient.get('/api/v1/admin/analytics', params),
  },
};

export default apiClient;