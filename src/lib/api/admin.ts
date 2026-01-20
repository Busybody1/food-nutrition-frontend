import { API_CONFIG } from '@/lib/config/api'

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

export interface UsageAnalytics {
  totalRequests: number
  requestsToday: number
  requestsThisWeek: number
  requestsThisMonth: number
  requestsThisYear: number
  averageResponseTime: number
  errorRate: number
  uniqueUsers: number
  topEndpoints: Array<{
    endpoint: string
    requests: number
    percentage: number
  }>
  topUsers: Array<{
    user: string
    requests: number
    plan: string
  }>
  hourlyData: Array<{
    hour: number
    requests: number
  }>
  dailyData: Array<{
    date: string
    requests: number
    users: number
  }>
  monthlyData: Array<{
    month: string
    requests: number
    revenue: number
  }>
  yearlyData: Array<{
    year: number
    requests: number
    revenue: number
  }>
}

export interface SystemStatus {
  overall: 'healthy' | 'warning' | 'critical'
  uptime: number
  responseTime: number
  errorRate: number
  throughput: number
}

export interface ServiceStatus {
  name: string
  status: 'healthy' | 'warning' | 'critical'
  uptime: number
  responseTime: number
  lastCheck: string
  description: string
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

export interface SystemSettings {
  maintenanceMode: boolean
  apiRateLimit: number
  maxUsers: number
  defaultPlan: string
  emailNotifications: boolean
  slackWebhook: string
  backupFrequency: string
  logRetention: number
  securityLevel: 'low' | 'medium' | 'high'
  allowedOrigins: string[]
}

export interface EnvironmentInfo {
  nodeVersion: string
  databaseVersion: string
  redisVersion: string
  uptime: string
  memoryUsage: string
  diskUsage: string
  lastBackup: string
}

class AdminAPI {
  private baseUrl = '/api/v1/admin' // Fixed: added /api prefix

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_CONFIG.baseURL}${endpoint}`
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    // Handle existing headers from options
    if (options.headers) {
      if (Array.isArray(options.headers)) {
        options.headers.forEach(([key, value]) => {
          headers[key] = value
        })
      } else if (options.headers instanceof Headers) {
        options.headers.forEach((value, key) => {
          headers[key] = value
        })
      } else {
        Object.entries(options.headers).forEach(([key, value]) => {
          if (typeof value === 'string') {
            headers[key] = value
          }
        })
      }
    }

    // Add authentication headers if available
    const token = localStorage.getItem('access_token')
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.detail || 
        errorData.message || 
        `API Error: ${response.status} ${response.statusText}`
      )
    }

    return response.json()
  }

  // User Management
  async getUsers(params?: {
    search?: string
    status?: 'all' | 'active' | 'inactive'
    plan?: 'all' | 'free' | 'basic' | 'core' | 'plus' | 'custom'
    sortBy?: 'created_at' | 'last_login' | 'total_requests' | 'email'
    sortOrder?: 'asc' | 'desc'
    limit?: number
    skip?: number
  }): Promise<{ users: AdminUser[]; total: number }> {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString())
        }
      })
    }
    const url = `${this.baseUrl}/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return this.makeRequest<{ users: AdminUser[]; total: number }>(url)
  }

  async getUser(userId: number): Promise<AdminUser> {
    return this.makeRequest<AdminUser>(`${this.baseUrl}/users/${userId}`)
  }

  async updateUser(userId: number, data: Partial<AdminUser>): Promise<AdminUser> {
    return this.makeRequest<AdminUser>(`${this.baseUrl}/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async deleteUser(userId: number): Promise<void> {
    await this.makeRequest<void>(`${this.baseUrl}/users/${userId}`, {
      method: 'DELETE'
    })
  }

  async activateUser(userId: number): Promise<void> {
    await this.makeRequest<void>(`${this.baseUrl}/users/${userId}/activate`, {
      method: 'POST'
    })
  }

  async deactivateUser(userId: number): Promise<void> {
    await this.makeRequest<void>(`${this.baseUrl}/users/${userId}/deactivate`, {
      method: 'POST'
    })
  }

  async bulkAction(action: string, userIds: number[]): Promise<void> {
    await this.makeRequest<void>(`${this.baseUrl}/users/bulk-action`, {
      method: 'POST',
      body: JSON.stringify({
        action,
        user_ids: userIds
      })
    })
  }

  // Dashboard Stats
  async getDashboardStats(): Promise<AdminStats> {
    return this.makeRequest<AdminStats>(`${this.baseUrl}/platform-usage`)
  }

  async getRecentActivity(limit: number = 10): Promise<Record<string, unknown>[]> {
    const url = `${this.baseUrl}/analytics?limit=${limit}`
    return this.makeRequest<Record<string, unknown>[]>(url)
  }

  // Analytics
  async getUsageAnalytics(timeRange: 'daily' | 'monthly' | 'yearly'): Promise<UsageAnalytics> {
    const url = `${this.baseUrl}/analytics?time_range=${timeRange}`
    return this.makeRequest<UsageAnalytics>(url)
  }

  async getTopEndpoints(limit: number = 10): Promise<Record<string, unknown>[]> {
    const url = `${this.baseUrl}/analytics?limit=${limit}`
    return this.makeRequest<Record<string, unknown>[]>(url)
  }

  async getTopUsers(limit: number = 10): Promise<Record<string, unknown>[]> {
    const url = `${this.baseUrl}/analytics?limit=${limit}`
    return this.makeRequest<Record<string, unknown>[]>(url)
  }

  // Monitoring
  async getSystemStatus(): Promise<SystemStatus> {
    return this.makeRequest<SystemStatus>(`${this.baseUrl}/system-info`)
  }

  async getServicesStatus(): Promise<ServiceStatus[]> {
    return this.makeRequest<ServiceStatus[]>(`${this.baseUrl}/system-info`)
  }

  async getAlerts(resolved?: boolean): Promise<Alert[]> {
    const url = `${this.baseUrl}/system-info${resolved !== undefined ? `?resolved=${resolved}` : ''}`
    return this.makeRequest<Alert[]>(url)
  }

  async getLogs(params?: {
    level?: string
    service?: string
    limit?: number
    offset?: number
  }): Promise<{ logs: LogEntry[]; total: number }> {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString())
        }
      })
    }
    const url = `${this.baseUrl}/system-info${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return this.makeRequest<{ logs: LogEntry[]; total: number }>(url)
  }

  async resolveAlert(alertId: string): Promise<void> {
    await this.makeRequest<void>(`${this.baseUrl}/monitoring/alerts/${alertId}/resolve`, {
      method: 'POST'
    })
  }

  // Analytics
  async getAnalytics(params?: {
    timeRange?: '7d' | '30d' | '90d' | '1y'
    startDate?: string
    endDate?: string
  }): Promise<UsageAnalytics> {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString())
        }
      })
    }
    const url = `${this.baseUrl}/analytics${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return this.makeRequest<UsageAnalytics>(url)
  }

  async getSystemMetrics(): Promise<AdminStats> {
    return this.makeRequest<AdminStats>(`${this.baseUrl}/metrics`)
  }

  // Settings
  async getSystemSettings(): Promise<SystemSettings> {
    return this.makeRequest<SystemSettings>(`${this.baseUrl}/settings`)
  }

  async updateSystemSettings(settings: Partial<SystemSettings>): Promise<SystemSettings> {
    return this.makeRequest<SystemSettings>(`${this.baseUrl}/settings`, {
      method: 'PUT',
      body: JSON.stringify(settings)
    })
  }

  async getEnvironmentInfo(): Promise<EnvironmentInfo> {
    return this.makeRequest<EnvironmentInfo>(`${this.baseUrl}/environment`)
  }

  // System Actions
  async restartService(serviceName: string): Promise<void> {
    await this.makeRequest<void>(`${this.baseUrl}/system/restart`, {
      method: 'POST',
      body: JSON.stringify({ service: serviceName })
    })
  }

  async clearCache(): Promise<void> {
    await this.makeRequest<void>(`${this.baseUrl}/system/clear-cache`, {
      method: 'POST'
    })
  }

  async createBackup(): Promise<{ backupId: string; message: string }> {
    return this.makeRequest<{ backupId: string; message: string }>(`${this.baseUrl}/system/backup`, {
      method: 'POST'
    })
  }

  async exportData(format: 'csv' | 'json' | 'xlsx'): Promise<Blob> {
    const url = `${this.baseUrl}/export?format=${format}`
    return this.makeRequest<Blob>(url)
  }

  // Health Checks
  async healthCheck(): Promise<{ status: string; timestamp: string; services: Record<string, unknown>[] }> {
    return this.makeRequest<{ status: string; timestamp: string; services: Record<string, unknown>[] }>(`${this.baseUrl}/health`)
  }

  async databaseHealth(): Promise<{ status: string; latency: number; connections: number }> {
    return this.makeRequest<{ status: string; latency: number; connections: number }>(`${this.baseUrl}/health/database`)
  }

  async redisHealth(): Promise<{ status: string; latency: number; memory: string }> {
    return this.makeRequest<{ status: string; latency: number; memory: string }>(`${this.baseUrl}/health/redis`)
  }

  // Admin user access
  async getAdminUser(userId: number): Promise<AdminUser> {
    return this.makeRequest<AdminUser>(`${this.baseUrl}/admin/users/${userId}`)
  }

  // System health
  async getSystemHealth(): Promise<{
    services: ServiceStatus[];
    alerts: Alert[];
    logs: LogEntry[];
  }> {
    return this.makeRequest<{
      services: ServiceStatus[];
      alerts: Alert[];
      logs: LogEntry[];
    }>(`${this.baseUrl}/system/health`)
  }

}

export const adminAPI = new AdminAPI()