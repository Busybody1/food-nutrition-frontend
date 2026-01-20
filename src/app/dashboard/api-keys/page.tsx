'use client'

import { useState, useEffect } from 'react'
import { ApiKeyList } from '@/components/dashboard/ApiKeyList'
import { useAuth } from '@/lib/hooks/use-auth'
import { useRouter } from 'next/navigation'

interface ApiKey {
  id: number
  name: string
  key: string
  is_active: boolean
  last_used_at: string | null
  created_at: string | null
  usage_count?: number
}

interface UserPlan {
  max_api_keys: number
  plan_name: string
}

export default function ApiKeysPage() {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isAuthenticated, loading, router])

  // Load API keys and user plan
  useEffect(() => {
    if (!loading && isAuthenticated) {
      loadData()
    }
  }, [isAuthenticated, loading])

  const loadData = async () => {
    try {
      setIsLoading(true)
      setError('')

      // Import API client
      const { api } = await import('@/lib/api/client')
      
      // Load API keys and user profile
      const [apiKeysResponse, profileResponse] = await Promise.all([
        api.apiKeys.list(),
        api.user.getProfile()
      ])

      if (apiKeysResponse.success) {
        const apiKeys = apiKeysResponse.data as ApiKey[]
        // Ensure all API keys have valid data
        const validApiKeys = apiKeys.filter(key => key && key.id && key.name)
        setApiKeys(validApiKeys)
      }

      if (profileResponse.success) {
        const userProfile = profileResponse.data as { plan?: { name?: string; max_api_keys?: number } }
        const userPlan: UserPlan = {
          max_api_keys: userProfile.plan?.max_api_keys || 5,
          plan_name: userProfile.plan?.name || 'Free'
        }
        setUserPlan(userPlan)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load API keys')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async (name: string): Promise<void> => {
    try {
      // Import API client
      const { api } = await import('@/lib/api/client')
      
      // Create API key
      const response = await api.apiKeys.create(name)
      
      if (response.success) {
        const newApiKey = response.data as ApiKey
        setApiKeys(prev => [newApiKey, ...prev])
      } else {
        throw new Error('Failed to create API key')
      }
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create API key')
    }
  }

  const handleDelete = async (id: number): Promise<void> => {
    try {
      // Import API client
      const { api } = await import('@/lib/api/client')
      
      // Delete API key
      const response = await api.apiKeys.revoke(id)
      
      if (response.success) {
        setApiKeys(prev => prev.filter(key => key.id !== id))
      } else {
        throw new Error('Failed to delete API key')
      }
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete API key')
    }
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
          <p className="text-gray-600">Loading API keys...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">{error}</p>
          </div>
        )}
        
        <ApiKeyList
          apiKeys={apiKeys}
          onRefresh={loadData}
          onCreate={handleCreate}
          onDelete={handleDelete}
          isLoading={isLoading}
          maxKeys={userPlan?.max_api_keys || 5}
          currentKeys={apiKeys.length}
        />
      </div>
    </div>
  )
}
