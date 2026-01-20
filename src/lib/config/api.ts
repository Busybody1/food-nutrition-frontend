export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  endpoints: {
    auth: {
      login: '/api/v1/auth/login',
      register: '/api/v1/auth/register',
      refresh: '/api/v1/auth/refresh',
      // logout: Removed - backend doesn't have logout endpoint (client-side only)
    },
    foods: {
      list: '/api/v1/foods/',
      detail: '/api/v1/foods',
      search: '/api/v1/search/foods', // Fixed: use specific search endpoint
    },
    search: {
      foods: '/api/v1/search/foods',
      brands: '/api/v1/search/brands',
      categories: '/api/v1/search/categories',
      nutrients: '/api/v1/search/nutrients',
      advanced: '/api/v1/search/advanced',
      // Removed: fulltext and hybrid - not implemented in backend
    },
    billing: {
      plans: '/api/v1/billing/plans', // Fixed: correct billing endpoint
      subscription: '/api/v1/billing/subscription',
      subscribe: '/api/v1/billing/subscribe',
      upgrade: '/api/v1/billing/subscription', // Fixed: use subscription endpoint for upgrades
    },
    user: {
      profile: '/api/v1/users/profile', // Fixed: /users/ (plural)
      apiKeys: '/api/v1/users/api-keys', // Fixed: /users/ (plural)
    },
  },
} as const
