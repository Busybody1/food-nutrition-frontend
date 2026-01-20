/**
 * API types for Food Database Service
 */

export interface ApiResponse<T = unknown> {
  data: T;
  success: boolean;
  status: number;
  message?: string;
}

export interface PaginatedResponse<T = unknown> {
  data: T[];
  total: number;
  skip: number;
  limit: number;
}

export interface ApiErrorDetails {
  [key: string]: unknown;
}

export class ApiError extends Error {
  status: number;
  details?: ApiErrorDetails;

  constructor(message: string, status: number, details?: ApiErrorDetails) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

// Food-related types
export interface Food {
  id: number;
  name: string;
  description?: string;
  brand_id?: number;
  category_id?: number;
  serving_size?: number;
  serving_unit?: string;
  serving?: string;
  ingredients?: string;
  allergens?: string;
  nutrition_facts?: Record<string, unknown>;
  source?: string;
  is_verified: boolean;
  created_at: string;
  brand_name?: string;
  category_name?: string;
  nutrients?: Nutrient[];
  barcodes?: Barcode[];
}

export interface Nutrient {
  name: string;
  unit: string;
  description?: string;
  daily_value?: number;
  amount?: number;
  per_100g?: number;
  source?: string;
}

export interface Barcode {
  barcode_value: string;
  barcode_type: string;
  country?: string;
}

export interface Brand {
  id: number;
  name: string;
  description?: string;
  website?: string;
  country?: string;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  parent_id?: number;
  created_at: string;
}

// Search types
export interface SearchParams {
  q: string;
  limit?: number;
  skip?: number;
  brand_id?: number;
  category_id?: number;
  filters?: Record<string, unknown>;
}

export interface SearchResult<T = unknown> {
  results: T[];
  total: number;
  query: string;
  took_ms: number;
}

// User types - Import from auth.ts to avoid duplication
export type { User } from './auth';

export interface Plan {
  id: number;
  name: string;
  description?: string;
  monthly_price: number;
  monthly_quota: number;
  rate_limit_per_minute: number;
  stripe_test_price_id?: string;
  stripe_live_price_id?: string;
  stripe_price_id?: string;
  features?: string[];
  is_active: boolean;
  created_at?: string;
}

export interface ApiKey {
  id: number;
  name: string;
  key?: string; // Only returned when creating
  is_active: boolean;
  created_at: string;
  last_used_at?: string;
}

// Billing types
export interface Subscription {
  id: number;
  user_id: number;
  plan_id: number;
  stripe_subscription_id: string;
  status: 'active' | 'canceled' | 'past_due' | 'incomplete';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
  plan?: Plan;
}

export interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created: number;
  description?: string;
  invoice_pdf?: string;
}

export interface PaymentIntent {
  client_secret: string;
  payment_intent_id: string;
}

// Usage types
export interface UsageStats {
  requests_this_month: number;
  monthly_quota: number;
  rate_limit_per_minute: number;
  plan_name: string;
  remaining_requests: number;
  usage_by_type: UsageByType[];
}

export interface UsageByType {
  endpoint_type: string;
  count: number;
}

// Admin types
export interface AdminUser {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  company_name?: string;
  is_active: boolean;
  is_admin: boolean;
  email_verified: boolean;
  created_at: string;
  plan_name?: string;
  last_login?: string;
  total_requests: number;
  subscription_status: string;
}

export interface AdminAnalytics {
  total_users: number;
  active_subscriptions: number;
  total_requests_today: number;
  total_requests_this_month: number;
  revenue_this_month: number;
  top_endpoints: Array<{
    endpoint: string;
    count: number;
  }>;
  user_growth: Array<{
    date: string;
    count: number;
  }>;
}