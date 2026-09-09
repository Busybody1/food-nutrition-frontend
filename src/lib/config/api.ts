export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  endpoints: {
    auth: {
      login: '/api/v1/auth/login',
      register: '/api/v1/auth/register',
      refresh: '/api/v1/auth/refresh',

    },
    foods: {
      list: '/api/v1/foods/',
      detail: '/api/v1/foods',
      search: '/api/v1/search/foods',
    },
    search: {
      foods: '/api/v1/search/foods',
      suggest: '/api/v1/search/suggest',
      barcode: '/api/v1/search/barcode',
      brands: '/api/v1/search/brands',
      categories: '/api/v1/search/categories',
      nutrients: '/api/v1/search/nutrients',
      advanced: '/api/v1/search/advanced',

    },
    billing: {
      plans: '/api/v1/billing/plans',
      subscription: '/api/v1/billing/subscription',
      subscribe: '/api/v1/billing/subscribe',
      upgrade: '/api/v1/billing/subscription',
    },
    user: {
      profile: '/api/v1/users/profile',
      apiKeys: '/api/v1/users/api-keys',
    },
  },
} as const
