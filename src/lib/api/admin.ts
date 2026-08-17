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

async function adminDelete<T>(path: string): Promise<T> {
  const res = await apiClient.delete<T>(`${BASE}${path}`)
  return res.data
}

export interface EmailLogEntry {
  id: number
  user_id: number | null
  to_email: string
  kind: string
  template_key?: string | null
  campaign_kind?: string | null
  email_number?: number | null
  variant?: string | null
  subject: string
  status: 'sent' | 'failed'
  provider?: string | null
  resend_message_id?: string | null
  body_preview?: string | null
  sent_at: string
  first_name?: string | null
  last_name?: string | null
  user_email?: string | null
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

/** GET /admin/users/{id} — adds lifetime usage totals to the base user row. */
export interface AdminUserDetail extends AdminUser {
  updated_at?: string
  is_superuser?: boolean
  stripe_customer_id?: string | null
  subscription_tier?: string | null
  username?: string | null
  uuid?: string | null
  api_quota?: number | null
  api_quota_used?: number | null
  plan_monthly_quota?: number | null
  plan_rate_limit_per_minute?: number | null
  api_keys_total?: number
  error_requests?: number
  requests_last_7d?: number
  distinct_endpoints?: number
  active_days?: number
  avg_response_time_ms?: number | null
  first_request_at?: string | null
  last_request_at?: string | null
}

/** Whole-table user counts, independent of the current list page. */
export interface AdminUserStats {
  total_users: number
  active_users: number
  inactive_users: number
  admin_users: number
  verified_users: number
  new_this_month: number
  new_last_month: number
  new_last_30d: number
  new_last_7d: number
  logged_in_7d: number
  logged_in_30d: number
  never_logged_in: number
  by_plan: Array<{ plan_name: string; users: number }>
}

export type UserSortKey =
  | 'created_at'
  | 'last_login'
  | 'email'
  | 'first_name'
  | 'last_name'
  | 'company_name'
  | 'plan_name'
  | 'plan_price'
  | 'is_active'
  | 'total_requests'
  | 'requests_this_month'
  | 'api_keys_count'

export type SortOrder = 'asc' | 'desc'

export interface AdminUserListParams {
  skip?: number
  limit?: number
  search?: string
  status?: 'active' | 'inactive' | 'admin' | 'unverified'
  plan_id?: number
  plan?: string
  sort_by?: UserSortKey
  sort_order?: SortOrder
}

export interface AdminUserListResponse {
  users: AdminUser[]
  total: number
  skip: number
  limit: number
  sort_by: UserSortKey
  sort_order: SortOrder
}

export type RequestSortKey =
  | 'created_at'
  | 'response_time_ms'
  | 'status_code'
  | 'endpoint'
  | 'method'
  | 'id'

export interface UserRequestsParams {
  skip?: number
  limit?: number
  endpoint?: string
  method?: string
  status_min?: number
  status_max?: number
  date_from?: string
  date_to?: string
  sort_by?: RequestSortKey
  sort_order?: SortOrder
}

export interface UserRequestsResponse {
  user_id: number
  requests: ApiRequestRow[]
  total: number
  skip: number
  limit: number
}

export interface UserRequestSummary {
  user_id: number
  by_endpoint: Array<{
    endpoint: string
    requests: number
    errors: number
    avg_response_time: number | null
    last_called_at: string | null
  }>
  status_mix: Array<{ status_code: number; count: number }>
  by_method: Array<{ method: string; count: number }>
}

export interface AdminApiKeyRow {
  id: number
  name?: string | null
  is_active: boolean
  created_at?: string | null
  last_used_at?: string | null
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
  /** Drives the "Most popular" badge on the public pricing grid. */
  is_recommended?: boolean
  plan_tier?: string
  max_api_keys?: number
  stripe_price_id?: string | null
  stripe_test_price_id?: string | null
  stripe_live_price_id?: string | null
  card_highlights?: string[]
  price_display_label?: string | null
  users_count?: number
}

export interface AdminPlanFeature {
  id?: number
  plan_id?: number
  feature_name: string
  feature_value?: boolean
  feature_limit?: number | null
  created_at?: string
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

export interface SecurityHoldRow {
  id: number
  email?: string
  plan_id?: number
  security_hold_until: string
  security_hold_reason?: string | null
  security_hold_count?: number
}

export interface SecurityIncident {
  id: number
  user_id?: number
  email?: string
  api_key_id?: number | null
  kind: 'volume_hourly' | 'volume_daily' | 'breadth_foods' | 'manual' | string
  detail: {
    reasons?: string[]
    hourly_count?: number
    distinct_foods_hour?: number
    rate_limit_per_minute?: number
    monthly_quota?: number | null
    path?: string
    reason?: string
    by_admin?: number
    [k: string]: unknown
  }
  requests_in_window?: number | null
  distinct_foods?: number | null
  ip_address?: string | null
  user_agent?: string | null
  action_taken: 'alert_only' | 'held' | string
  resolved: boolean
  resolved_by_user_id?: number | null
  resolved_at?: string | null
  created_at: string
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
  async getUsers(params?: AdminUserListParams): Promise<AdminUserListResponse> {
    return adminGet('/users', params as Record<string, unknown> | undefined)
  }

  /** Account-wide counts for the Users dashboard cards (not page-limited). */
  async getUserStats(): Promise<AdminUserStats> {
    return adminGet('/users/stats')
  }

  async getUser(userId: number): Promise<AdminUserDetail> {
    return adminGet(`/users/${userId}`)
  }

  async getAdminUser(userId: number): Promise<AdminUserDetail> {
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

  async getUserUsage(
    userId: number,
    timeRange: '7d' | '30d' | '90d' | '1y' | 'all' = '30d'
  ): Promise<UserUsagePayload> {
    return adminGet(`/users/${userId}/usage`, { time_range: timeRange })
  }

  /** Paginated request history — every call the account has made since signup. */
  async getUserRequests(
    userId: number,
    params: UserRequestsParams = {}
  ): Promise<UserRequestsResponse> {
    return adminGet(`/users/${userId}/requests`, {
      limit: 50,
      ...params,
    } as Record<string, unknown>)
  }

  /** Lifetime endpoint / status / method breakdown for one user. */
  async getUserRequestSummary(userId: number): Promise<UserRequestSummary> {
    return adminGet(`/users/${userId}/request-summary`)
  }

  async getUserApiKeys(userId: number): Promise<{ api_keys: AdminApiKeyRow[] }> {
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

  async getApiRequests(params?: Record<string, unknown>): Promise<{
    requests: ApiRequestRow[]
    total: number | null
    skip: number
    limit: number
    keyset: boolean
  }> {
    return adminGet('/requests', params)
  }

  async getPlans(): Promise<{ plans: AdminPlan[] }> {
    return adminGet('/plans')
  }

  async patchPlan(
    planId: number,
    data: {
      name?: string
      monthly_quota?: number
      rate_limit_per_minute?: number
      is_active?: boolean
      is_recommended?: boolean
      description?: string
      monthly_price?: number
      stripe_price_id?: string | null
      stripe_test_price_id?: string | null
      stripe_live_price_id?: string | null
      card_highlights?: string[]
      price_display_label?: string | null
    }
  ): Promise<{ message: string }> {
    return adminPatch(`/plans/${planId}`, data)
  }

  /**
   * Make one plan the "Most popular" card. The backend demotes the previous
   * holder in the same transaction, so only one plan is ever flagged.
   */
  async setRecommendedPlan(planId: number): Promise<{ message: string }> {
    return adminPatch(`/plans/${planId}`, { is_recommended: true })
  }

  async clearRecommendedPlan(planId: number): Promise<{ message: string }> {
    return adminPatch(`/plans/${planId}`, { is_recommended: false })
  }

  async getPlanFeatures(planId: number): Promise<{ features: AdminPlanFeature[] }> {
    const res = await adminGet<{ features: AdminPlanFeature[] }>(`/plans/${planId}/features`)
    return { features: res.features ?? [] }
  }

  async upsertPlanFeature(
    planId: number,
    data: { feature_name: string; feature_value?: boolean; feature_limit?: number | null }
  ): Promise<{ message: string }> {
    return adminPut(`/plans/${planId}/features`, data)
  }

  async bulkUpsertPlanFeatures(
    planId: number,
    features: Array<{ feature_name: string; feature_value?: boolean; feature_limit?: number | null }>
  ): Promise<{ message: string; count: number }> {
    return adminPut(`/plans/${planId}/features/bulk`, { features })
  }

  async deletePlanFeature(planId: number, featureName: string): Promise<{ message: string }> {
    return adminDelete(`/plans/${planId}/features/${encodeURIComponent(featureName)}`)
  }

  async getSubscriptions(
    params?: Record<string, unknown>
  ): Promise<{ subscriptions: Array<Record<string, unknown>>; total: number }> {
    return adminGet('/subscriptions', params)
  }

  async getRevenueSummary(): Promise<Record<string, unknown>> {
    return adminGet('/revenue/summary')
  }

  async getRevenueTimeseries(months = 12): Promise<{ timeseries: Array<Record<string, unknown>> }> {
    return adminGet('/revenue/timeseries', { months })
  }

  async getAuditLog(
    params?: Record<string, unknown>
  ): Promise<{ entries: AuditEntry[]; total: number }> {
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

  async getEmailLog(params?: {
    user_id?: number
    email?: string
    kind?: string
    skip?: number
    limit?: number
  }): Promise<{ entries: EmailLogEntry[]; total: number; skip: number; limit: number }> {
    return adminGet('/emails/log', params)
  }

  async getEmailTemplates(): Promise<{
    templates: Array<{
      id: string
      campaign_kind?: 'usage' | 'activation'
      email_number: number
      label: string
      when: string
      commercial_variant: boolean
    }>
  }> {
    return adminGet('/emails/templates')
  }

  async previewConversionEmail(data: {
    user_id?: number
    email?: string
    email_number: number
    commercial_variant?: boolean
    campaign_kind?: 'usage' | 'activation'
  }): Promise<{
    email_number: number
    campaign_kind?: string
    variant: string
    subject: string
    html: string | null
    text: string
    endpoint_hint?: string
  }> {
    return adminPost('/emails/preview-conversion', data)
  }

  async sendConversionEmail(data: {
    user_id?: number
    email?: string
    email_number: number
    commercial_variant?: boolean
    campaign_kind?: 'usage' | 'activation'
  }): Promise<{
    message: string
    user_id: number
    email: string
    email_number: number
    campaign_kind?: string
    variant: string
    subject: string
    provider?: string
  }> {
    return adminPost('/emails/send-conversion', data)
  }

  async sendCustomEmail(data: {
    user_id?: number
    email?: string
    subject: string
    body_html?: string
    body_text?: string
    wrap_branded?: boolean
    from_name?: string
  }): Promise<{
    message: string
    user_id: number
    email: string
    subject: string
    format: string
    wrap_branded: boolean
    provider?: string
  }> {
    return adminPost('/emails/send-custom', data)
  }

  async getFeedbackSubmissions(params?: {
    user_id?: number
    skip?: number
    limit?: number
  }): Promise<{ feedback: Array<Record<string, unknown>>; count: number }> {
    return adminGet('/feedback', params)
  }

  // --- Security holds & anomaly incidents ---

  async getSecurityHolds(): Promise<{ holds: SecurityHoldRow[]; count: number }> {
    return adminGet('/security/holds')
  }

  async getSecurityIncidents(params?: {
    resolved?: boolean
    limit?: number
  }): Promise<{ incidents: SecurityIncident[]; count: number }> {
    return adminGet('/security/incidents', params)
  }

  async placeSecurityHold(
    userId: number,
    data: { minutes: number; reason: string }
  ): Promise<{ message: string; user_id: number; hold_until: string | null }> {
    return adminPost(`/users/${userId}/security-hold`, data)
  }

  async releaseSecurityHold(
    userId: number
  ): Promise<{ message: string; user_id: number }> {
    return adminDelete(`/users/${userId}/security-hold`)
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
