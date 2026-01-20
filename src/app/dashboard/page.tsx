'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/hooks/use-auth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Key, BarChart3, CreditCard, Activity, 
  TrendingUp, AlertCircle, CheckCircle, 
  ArrowRight, RefreshCw
} from 'lucide-react'

interface ApiKey {
  id: number
  is_active: boolean
}

interface UsageStats {
  requests_this_month: number
  monthly_quota: number
}

interface UserProfile {
  plan: {
    name: string
    monthly_price: number
  }
}

interface ActivityItem {
  id: string
  type: 'api_key_created' | 'api_key_used' | 'quota_warning' | 'payment_success'
  message: string
  timestamp: string
}

interface DashboardStats {
  totalApiKeys: number
  activeApiKeys: number
  requestsThisMonth: number
  monthlyQuota: number
  planName: string
  planPrice: number
  recentActivity: ActivityItem[]
}

export default function DashboardPage() {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isAuthenticated, loading, router])

  // Load dashboard data
  useEffect(() => {
    if (!loading && isAuthenticated) {
      loadDashboardData()
    }
  }, [isAuthenticated, loading])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      setError('')

      // Import API client
      const { api } = await import('@/lib/api/client')
      
      // Load API keys, usage stats, and user profile
      const [apiKeysResponse, usageResponse, profileResponse] = await Promise.all([
        api.apiKeys.list(),
        api.usage.getUsageStats(),
        api.user.getProfile()
      ])

      // Handle each response individually for better error reporting
      let apiKeys: ApiKey[] = []
      let usageStats: UsageStats = { requests_this_month: 0, monthly_quota: 1000 }
      let userProfile: UserProfile = { plan: { name: 'Free', monthly_price: 0 } }

      if (apiKeysResponse.success) {
        apiKeys = apiKeysResponse.data as ApiKey[]
      } else {
        throw new Error(`API Keys: ${apiKeysResponse.message || 'Failed to load API keys'}`)
      }

      if (usageResponse.success) {
        usageStats = usageResponse.data as UsageStats
      } else {
        throw new Error(`Usage Stats: ${usageResponse.message || 'Failed to load usage stats'}`)
      }

      if (profileResponse.success) {
        userProfile = profileResponse.data as UserProfile
      } else {
        throw new Error(`Profile: ${profileResponse.message || 'Failed to load profile'}`)
      }

      const dashboardStats: DashboardStats = {
        totalApiKeys: apiKeys.length,
        activeApiKeys: apiKeys.filter(key => key.is_active).length,
        requestsThisMonth: usageStats.requests_this_month,
        monthlyQuota: usageStats.monthly_quota,
        planName: userProfile.plan.name,
        planPrice: userProfile.plan.monthly_price,
        recentActivity: [] // Can be implemented later with activity API
      }

      setStats(dashboardStats)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'api_key_created':
        return <Key className="h-4 w-4 text-blue-600" />
      case 'api_key_used':
        return <Activity className="h-4 w-4 text-green-600" />
      case 'quota_warning':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      case 'payment_success':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'api_key_created':
        return 'bg-blue-100 text-blue-800'
      case 'api_key_used':
        return 'bg-green-100 text-green-800'
      case 'quota_warning':
        return 'bg-yellow-100 text-yellow-800'
      case 'payment_success':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.first_name}!
          </h1>
          <p className="text-gray-600">
            Here&apos;s what&apos;s happening with your Food Nutrition Database API account.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {stats && (
          <div className="space-y-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Key className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">API Keys</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.activeApiKeys}/{stats.totalApiKeys}
                      </p>
                      <p className="text-sm text-gray-500">Active</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <BarChart3 className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">This Month</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.requestsThisMonth.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">API calls</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <TrendingUp className="h-8 w-8 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Usage</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.monthlyQuota > 0 ? ((stats.requestsThisMonth / stats.monthlyQuota) * 100).toFixed(1) : '0.0'}%
                      </p>
                      <p className="text-sm text-gray-500">of quota used</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CreditCard className="h-8 w-8 text-orange-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Plan</p>
                      <p className="text-lg font-bold text-gray-900">
                        {stats.planName}
                      </p>
                      <p className="text-sm text-gray-500">
                        ${stats.planPrice}/month
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Link href="/dashboard/api-keys">
                    <Button variant="outline" className="w-full justify-start">
                      <Key className="h-4 w-4 mr-2" />
                      Manage API Keys
                      <ArrowRight className="h-4 w-4 ml-auto" />
                    </Button>
                  </Link>
                  <Link href="/dashboard/usage">
                    <Button variant="outline" className="w-full justify-start">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Usage Analytics
                      <ArrowRight className="h-4 w-4 ml-auto" />
                    </Button>
                  </Link>
                  <Link href="/pricing">
                    <Button variant="default" className="w-full justify-start">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Subscribe to a Plan
                      <ArrowRight className="h-4 w-4 ml-auto" />
                    </Button>
                  </Link>
                  <Link href="/dashboard/billing">
                    <Button variant="outline" className="w-full justify-start">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Manage Billing
                      <ArrowRight className="h-4 w-4 ml-auto" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Usage Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Monthly Usage</span>
                        <span className="text-gray-900">
                          {stats.requestsThisMonth.toLocaleString()} / {stats.monthlyQuota.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ 
                            width: `${stats.monthlyQuota > 0 ? Math.min((stats.requestsThisMonth / stats.monthlyQuota) * 100, 100) : 0}%` 
                          }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Remaining</p>
                        <p className="font-semibold text-gray-900">
                          {(stats.monthlyQuota - stats.requestsThisMonth).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Reset Date</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
                            .toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Recent Activity</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={loadDashboardData}
                    disabled={isLoading}
                    className="flex items-center"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recentActivity.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No recent activity</p>
                  ) : (
                    stats.recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900">{activity.message}</p>
                          <p className="text-xs text-gray-500">{formatDate(activity.timestamp)}</p>
                        </div>
                        <Badge className={getActivityColor(activity.type)}>
                          {activity.type.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}