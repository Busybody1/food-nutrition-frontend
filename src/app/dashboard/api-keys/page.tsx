'use client'

import { useState, useEffect } from 'react'
import { ApiKeyList } from '@/components/dashboard/ApiKeyList'
import {
  DashboardPage,
  DashboardLoading,
  DashboardAlert,
} from '@/components/dashboard/dashboard-shell'
import { useAuth } from '@/lib/hooks/use-auth'
import { useRouter } from 'next/navigation'
import {
  normalizeApiKeyList,
  stashCreatedApiKeyPlaintext,
  resolveApiKeyPlaintext,
  removeStashedApiKeyPlaintext,
  type ApiKeyRecord,
  type CreatedApiKeyResult,
} from '@/lib/api/api-keys'

interface UserPlan {
  max_api_keys: number
  plan_name: string
}

export default function ApiKeysPage() {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const [apiKeys, setApiKeys] = useState<ApiKeyRecord[]>([])
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
        const keys = normalizeApiKeyList(apiKeysResponse.data).map((key) => {
          const plaintext = resolveApiKeyPlaintext(key.id, key.key)
          return plaintext ? { ...key, key: plaintext } : key
        })
        setApiKeys(keys)
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

  const handleCreate = async (name: string): Promise<CreatedApiKeyResult | void> => {
    const { api } = await import('@/lib/api/client')
    const response = await api.apiKeys.create(name)

    if (!response.success) {
      throw new Error('Failed to create API key')
    }

    const created = normalizeApiKeyList([response.data])[0]
    const plaintext = created ? resolveApiKeyPlaintext(created.id, created.key) : null
    if (!created || !plaintext) {
      throw new Error('Invalid API key response from server')
    }

    stashCreatedApiKeyPlaintext(created.id, plaintext)
    await loadData()

    return { id: created.id, name: created.name, key: plaintext }
  }

  const handleDelete = async (id: number): Promise<void> => {
    try {
      // Import API client
      const { api } = await import('@/lib/api/client')
      
      // Delete API key
      const response = await api.apiKeys.revoke(id)
      
      if (response.success) {
        removeStashedApiKeyPlaintext(id)
        setApiKeys(prev => prev.filter(key => key.id !== id))
      } else {
        throw new Error('Failed to delete API key')
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete API key'
      throw new Error(message)
    }
  }

  if (loading || isLoading) {
    return <DashboardLoading message="Loading API keys..." />
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <DashboardPage>
        {error && <DashboardAlert variant="error">{error}</DashboardAlert>}
        <ApiKeyList
          apiKeys={apiKeys}
          onRefresh={loadData}
          onCreate={handleCreate}
          onDelete={handleDelete}
          isLoading={isLoading}
          maxKeys={userPlan?.max_api_keys || 5}
          currentKeys={apiKeys.length}
        />
    </DashboardPage>
  )
}
