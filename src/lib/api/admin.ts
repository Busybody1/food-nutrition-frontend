import { apiClient } from '@/lib/api/client'

const BASE = '/api/v1/admin'

async function adminGet<T>(path: string, params?: Record<string, unknown>): Promise<T> {
  const res = await apiClient.get<T>(`${BASE}${path}`, params)
  return res.data
}

async function adminPost<T>(path: string, data?: unknown): Promise<T> {
  const res = await apiClient.post<T>(`${BASE}${path}`, data)
  return res.data
}

async function adminPut<T>(path: string, data?: unknown): Promise<T> {
  const res = await apiClient.put<T>(`${BASE}${path}`, data)
  return res.data
}

async function adminPatch<T>(path: string, data?: unknown): Promise<T> {
  const res = await apiClient.patch<T>(`${BASE}${path}`, data)
  return res.data
}

export interface AdminUser {
  id: number
  email: string
  first_name?: string
  last_name?: string
  company_name?: string
  is_active: boolean
  is_admin: boolean
  email_verified: boolean
  created_at: string
  plan_id?: number
  plan_name?: string
  last_login?: string
  plan_price?: number
  total_requests?: number
  requests_this_month?: number
  api_keys_count?: number
}

export interface AdminStats {
  totalUsers: number
  activeUsers: number
  totalRequests: number
  requestsToday: number
  requestsThisMonth: number
  revenue: number
  revenueGrowth: number
  averageResponseTime: number
  errorRate: number
  systemUptime: number
}

export interface AdminAnalytics {
  total_users: number
  active_users: number
  total_requests: number
  avg_response_time_ms: number
  error_rate_percent: number
  top_endpoints: Array<{
    endpoint: string
    request_count: number
    avg_response_time: number
    error_count: number
  }>
  top_users: Array<{
    email: string
    first_name?: string
    last_name?: string
    request_count: number
    avg_response_time: number
  }>
  daily_usage: Array<{
    date: string
    requests: number
    errors: number
    avg_response_time: number
    active_users: number
  }>
  hourly_pattern: Array<{ hour: number; requests: number; avg_response_time: number }>
  response_time_distribution: Array<{ response_time_range: string; count: number }>
  status_code_distribution: Array<{ status_code: number; count: number }>
  time_range: string
}

export interface SystemSettingRow {
  setting_key: string
  setting_value: string
  setting_type: string
  description?: string
  updated_at?: string
}

export interface ServiceStatus {
  name: string
  status: 'healthy' | 'warning' | 'critical'
  uptime: number
  responseTime: number
  lastCheck: string
  description?: string
}

export interface Alert {
  id: string
  type: 'error' | 'warning' | 'info'
  title: string
  description: string
  timestamp: string
  resolved: boolean
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export interface LogEntry {
  id: string
  timestamp: string
  level: 'info' | 'warning' | 'error' | 'debug'
  service: string
  message: string
  details?: Record<string, unknown>
}

export interface EnvironmentInfo {
  nodeVersion: string
  databaseVersion: string
  redisVersion: string
  uptime: string
  memoryUsage: string
  diskUsage: string
  lastBackup: string
  activeSubscriptions?: number
  requestsToday?: number
  errorRateToday?: number
  systemLoad?: number
}

export interface ApiRequestRow {
  id: number
  user_id?: number
  email?: string
  api_key_id?: number
  endpoint: string
  method: string
  status_code: number
  response_time_ms: number
  ip_address?: string
  created_at: string
}

export interface AdminPlan {
  id: number
  name: string
  description?: string
  monthly_price?: number
  monthly_quota?: number
  rate_limit_per_minute?: number
  is_active: boolean
  plan_tier?: string
  max_api_keys?: number
  stripe_price_id?: string | null
  stripe_test_price_id?: string | null
  stripe_live_price_id?: string | null
}

export interface AuditEntry {
  id: number
  admin_user_id: number
  admin_email?: string
  action: string
  target_type?: string
  target_id?: string
  metadata?: Record<string, unknown>
  ip_address?: string
  created_at: string
}

export interface UserUsagePayload {
  user_id: number
  time_range: string
  summary: Record<string, number>
  daily: Array<{ date: string; requests: number; errors: number }>
  by_endpoint: Array<{ endpoint: string; requests: number; avg_response_time: number }>
  status_mix: Array<{ status_code: number; count: number }>
}

export interface AdminBlogFaqItem {
  question: string
  answer: string
}

export interface AdminBlogPost {
  id: number
  slug: string
  title: string
  excerpt?: string | null
  content: string
  meta_title?: string | null
  meta_description?: string | null
  keywords?: string | null
  cover_image_url?: string | null
  faq: AdminBlogFaqItem[]
  status: 'draft' | 'published'
  author_user_id?: number | null
  published_at?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export interface BlogPostInput {
  slug: string
  title: string
  excerpt?: string
  content: string
  meta_title?: string
  meta_description?: string
  keywords?: string
  cover_image_url?: string
  faq: AdminBlogFaqItem[]
  status: 'draft' | 'published'
}

export interface AdminTestimonial {
  id: number
  quote: string
  author_name: string
  author_role?: string | null
  company?: string | null
  avatar_url?: string | null
  status: 'draft' | 'published'
  display_order: number
  created_by_user_id?: number | null
  created_at?: string | null
  updated_at?: string | null
}

export interface TestimonialInput {
  quote: string
  author_name: string
  author_role?: string
  company?: string
  avatar_url?: string
  status: 'draft' | 'published'
  display_order: number
}

class AdminAPI {
  async getUsers(params?: Record<string, unknown>): Promise<{ users: AdminUser[]; total: number }> {
    return adminGet('/users', params)
  }

  async getUser(userId: number): Promise<AdminUser> {
    return adminGet(`/users/${userId}`)
  }

  async getAdminUser(userId: number): Promise<AdminUser> {
    return this.getUser(userId)
  }

  async patchUser(
    userId: number,
    data: { is_active?: boolean; is_admin?: boolean; plan_id?: number }
  ): Promise<{ message: string }> {
    return adminPatch(`/users/${userId}`, data)
  }

  async activateUser(userId: number): Promise<void> {
    await adminPut(`/users/${userId}/status`, { is_active: true })
  }

  async deactivateUser(userId: number): Promise<void> {
    await adminPut(`/users/${userId}/status`, { is_active: false })
  }

  async getUserUsage(userId: number, timeRange = '30d'): Promise<UserUsagePayload> {
    return adminGet(`/users/${userId}/usage`, { time_range: timeRange })
  }

  async getUserRequests(userId: number, limit = 50): Promise<{ requests: ApiRequestRow[] }> {
    return adminGet(`/users/${userId}/requests`, { limit })
  }

  async getUserApiKeys(userId: number): Promise<{ api_keys: Array<Record<string, unknown>> }> {
    return adminGet(`/users/${userId}/api-keys`)
  }

  async revokeUserApiKey(userId: number, keyId: number): Promise<{ message: string }> {
    return adminPost(`/users/${userId}/api-keys/${keyId}/revoke`)
  }

  async getSystemMetrics(): Promise<AdminStats> {
    return adminGet('/metrics')
  }

  async getAnalytics(timeRange: '7d' | '30d' | '90d' | '1y' = '7d'): Promise<AdminAnalytics> {
    return adminGet('/analytics', { time_range: timeRange })
  }

  async getApiRequests(params?: Record<string, unknown>): Promise<{ requests: ApiRequestRow[] }> {
    return adminGet('/requests', params)
  }

  async getPlans(): Promise<{ plans: AdminPlan[] }> {
    return adminGet('/plans')
  }

  async patchPlan(
    planId: number,
    data: {
      monthly_quota?: number
      rate_limit_per_minute?: number
      is_active?: boolean
      description?: string
      monthly_price?: number
      stripe_price_id?: string | null
      stripe_test_price_id?: string | null
      stripe_live_price_id?: string | null
    }
  ): Promise<{ message: string }> {
    return adminPatch(`/plans/${planId}`, data)
  }

  async getPlanFeatures(planId: number): Promise<{ features: Array<Record<string, unknown>> }> {
    return adminGet(`/plans/${planId}/features`)
  }

  async upsertPlanFeature(
    planId: number,
    data: { feature_name: string; feature_value?: boolean; feature_limit?: number | null }
  ): Promise<{ message: string }> {
    return adminPut(`/plans/${planId}/features`, data)
  }

  async getSubscriptions(params?: Record<string, unknown>): Promise<{ subscriptions: Array<Record<string, unknown>> }> {
    return adminGet('/subscriptions', params)
  }

  async getRevenueSummary(): Promise<Record<string, unknown>> {
    return adminGet('/revenue/summary')
  }

  async getRevenueTimeseries(months = 12): Promise<{ timeseries: Array<Record<string, unknown>> }> {
    return adminGet('/revenue/timeseries', { months })
  }

  async getAuditLog(params?: Record<string, unknown>): Promise<{ entries: AuditEntry[] }> {
    return adminGet('/audit-log', params)
  }

  async getAnnouncementEmailStatus(): Promise<{
    resend_configured: boolean
    smtp_configured: boolean
    provider: 'resend' | 'smtp' | 'none'
    from_email?: string | null
  }> {
    return adminGet('/announcements/status')
  }

  async sendAnnouncement(data: {
    subject: string
    body_html: string
    recipient_mode: 'all' | 'active' | 'plan'
    plan_id?: number
    limit?: number
  }): Promise<{
    message: string
    sent: number
    failed?: number
    total_recipients: number
    provider?: string
  }> {
    return adminPost('/announcements/email', data)
  }

  async getAnnouncementHistory(limit = 20): Promise<{ announcements: Array<Record<string, unknown>> }> {
    return adminGet('/announcements/history', { limit })
  }

  async sendUserFeedbackEmail(userId: number): Promise<{
    message: string
    user_id: number
    request_id: number
    reused_existing_send: boolean
    provider?: string
  }> {
    return adminPost(`/users/${userId}/feedback-email`)
  }

  async getFeedbackSubmissions(params?: {
    user_id?: number
    skip?: number
    limit?: number
  }): Promise<{ feedback: Array<Record<string, unknown>>; count: number }> {
    return adminGet('/feedback', params)
  }

  async getSystemSettings(): Promise<SystemSettingRow[]> {
    return adminGet('/settings')
  }

  async updateSystemSetting(settingKey: string, settingValue: string): Promise<SystemSettingRow> {
    return adminPut(`/settings/${settingKey}`, { setting_value: settingValue })
  }

  async setMaintenanceMode(enabled: boolean): Promise<{ message: string }> {
    return adminPost('/maintenance', { maintenance_mode: enabled })
  }

  async getEnvironmentInfo(): Promise<EnvironmentInfo> {
    return adminGet('/environment')
  }

  async getSystemHealth(): Promise<{
    services: ServiceStatus[]
    alerts: Alert[]
    logs: LogEntry[]
  }> {
    return adminGet('/system/health')
  }

  async getPlatformUsage(): Promise<Record<string, unknown>> {
    return adminGet('/platform-usage')
  }

  async getBlogPosts(params?: {
    status?: 'draft' | 'published'
    skip?: number
    limit?: number
    q?: string
  }): Promise<{ posts: AdminBlogPost[]; count: number; limit?: number; skip?: number; q?: string | null }> {
    return adminGet('/blog', params)
  }

  async getBlogPost(postId: number): Promise<AdminBlogPost> {
    return adminGet(`/blog/${postId}`)
  }

  async createBlogPost(data: BlogPostInput): Promise<AdminBlogPost> {
    return adminPost('/blog', data)
  }

  async updateBlogPost(postId: number, data: Partial<BlogPostInput>): Promise<AdminBlogPost> {
    return adminPatch(`/blog/${postId}`, data)
  }

  async deleteBlogPost(postId: number): Promise<{ message: string; id: number }> {
    const res = await apiClient.delete<{ message: string; id: number }>(`${BASE}/blog/${postId}`)
    return res.data
  }

  async getTestimonials(params?: {
    status?: 'draft' | 'published'
    skip?: number
    limit?: number
  }): Promise<{ testimonials: AdminTestimonial[]; count: number; limit?: number; skip?: number }> {
    return adminGet('/testimonials', params)
  }

  async createTestimonial(data: TestimonialInput): Promise<AdminTestimonial> {
    return adminPost('/testimonials', data)
  }

  async updateTestimonial(
    testimonialId: number,
    data: Partial<TestimonialInput>
  ): Promise<AdminTestimonial> {
    return adminPatch(`/testimonials/${testimonialId}`, data)
  }

  async deleteTestimonial(testimonialId: number): Promise<{ message: string; id: number }> {
    const res = await apiClient.delete<{ message: string; id: number }>(
      `${BASE}/testimonials/${testimonialId}`
    )
    return res.data
  }

  async uploadTestimonialImage(file: File): Promise<{ url: string }> {
    const formData = new FormData()
    formData.append('file', file)
    const res = await apiClient.postFormData<{ url: string }>(
      `${BASE}/testimonials/upload-image`,
      formData
    )
    return res.data
  }
}

export const adminAPI = new AdminAPI()
