'use client'

import { Suspense, useState, useEffect } from 'react'
import { ApiKeyList } from '@/components/dashboard/ApiKeyList'
import { ConnectToClaude } from '@/components/dashboard/ConnectToClaude'
import {
  DashboardPage,
  DashboardLoading,
  DashboardAlert,
} from '@/components/dashboard/dashboard-shell'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/lib/hooks/use-auth'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  normalizeApiKeyList,
  stashCreatedApiKeyPlaintext,
  resolveApiKeyPlaintext,
  removeStashedApiKeyPlaintext,
  type ApiKeyRecord,
  type CreatedApiKeyResult,
} from '@/lib/api/api-keys'
import {
  accountIsMcp,
  apiKeyProductFromSearch,
  type ApiKeyProduct,
} from '@/lib/dashboard/api-key-product'

interface UserPlan {
  max_api_keys: number
  name: string
  plan_tier: string
}

export default function ApiKeysPage() {
  return (
    <Suspense fallback={null}>
      <ApiKeysScreen />
    </Suspense>
  )
}

function ApiKeysScreen() {
  const { isAuthenticated, loading, user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [apiKeys, setApiKeys] = useState<ApiKeyRecord[]>([])
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null)
  const [product, setProduct] = useState<ApiKeyProduct>('rest')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const mcpAccount = accountIsMcp(userPlan)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isAuthenticated, loading, router])

  useEffect(() => {
    if (!loading && isAuthenticated) {
      loadData()
    }
  }, [isAuthenticated, loading])

  useEffect(() => {
    if (!userPlan) return
    const next = apiKeyProductFromSearch(searchParams.toString(), accountIsMcp(userPlan))
    setProduct(next)
    if (searchParams.get('product') === next) return
    const params = new URLSearchParams(searchParams.toString())
    params.delete('mcp')
    params.set('product', next)
    router.replace(`/dashboard/api-keys?${params.toString()}`)
  }, [userPlan, searchParams, router])

  const loadData = async () => {
    try {
      setIsLoading(true)
      setError('')

      const { api } = await import('@/lib/api/client')

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
        const userProfile = profileResponse.data as {
          plan?: { name?: string; max_api_keys?: number; plan_tier?: string }
        }
        const userPlan: UserPlan = {
          max_api_keys: userProfile.plan?.max_api_keys ?? 1,
          name: userProfile.plan?.name || 'Free',
          plan_tier: userProfile.plan?.plan_tier || '',
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

      const { api } = await import('@/lib/api/client')

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

  const selectProduct = (next: ApiKeyProduct) => {
    setProduct(next)
    const params = new URLSearchParams(searchParams.toString())
    params.delete('mcp')
    params.set('product', next)
    router.replace(`/dashboard/api-keys?${params.toString()}`)
  }

  const keyList = (kind: ApiKeyProduct) => (
    <ApiKeyList
      apiKeys={apiKeys}
      onRefresh={loadData}
      onCreate={handleCreate}
      onDelete={handleDelete}
      isLoading={isLoading}
      maxKeys={userPlan?.max_api_keys ?? 1}
      currentKeys={apiKeys.length}
      emailVerified={!!user?.email_verified}
      title={kind === 'mcp' ? 'MCP keys' : 'REST API keys'}
      description={
        kind === 'mcp'
          ? 'Keys for the MCP server. Send them as X-API-Key. They do not call the REST API.'
          : 'Keys for the REST API. They do not open the MCP server.'
      }
      emptyDescription={
        kind === 'mcp'
          ? 'Create a key, then paste it into Claude Code or Cursor.'
          : 'Create a key to call search, foods, calc, and vision.'
      }
      namePlaceholder={kind === 'mcp' ? 'e.g., Claude Code, Cursor' : 'e.g., Production app'}
      upgradeHref={kind === 'mcp' ? '/mcp/pricing' : '/pricing'}
    />
  )

  return (
    <DashboardPage>
        {error && <DashboardAlert variant="error">{error}</DashboardAlert>}
        {user && !user.email_verified && (
          <DashboardAlert variant="warning">
            Verify your email to create API keys.{' '}
            <Link href="/auth/verify-email" className="font-medium underline">
              Verify now
            </Link>
          </DashboardAlert>
        )}
        <Tabs value={product} onValueChange={(value) => selectProduct(value as ApiKeyProduct)}>
          <TabsList aria-label="API product">
            <TabsTrigger value="rest">REST API</TabsTrigger>
            <TabsTrigger value="mcp">MCP</TabsTrigger>
          </TabsList>
          <TabsContent value="rest">
            {mcpAccount ? (
              <ProductGate
                title="REST API is a separate subscription"
                body="This account is on the MCP plan. REST search, foods, calc, and vision return 403. Keys on the MCP tab do not call the REST API."
                href="/pricing"
                label="View REST plans"
              />
            ) : (
              keyList('rest')
            )}
          </TabsContent>
          <TabsContent value="mcp">
            {mcpAccount ? (
              <div className="space-y-6">
                <ConnectToClaude apiKeys={apiKeys} />
                {keyList('mcp')}
              </div>
            ) : (
              <ProductGate
                title="MCP is a separate subscription"
                body="This account is on a REST plan. A REST key is refused by the MCP server. MCP keys are created on the MCP plan."
                href="/mcp/pricing"
                label="View MCP plans"
              />
            )}
          </TabsContent>
        </Tabs>
    </DashboardPage>
  )
}

function ProductGate({
  title,
  body,
  href,
  label,
}: {
  title: string
  body: string
  href: string
  label: string
}) {
  return (
    <section className="dashboard-panel p-6">
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">{body}</p>
      <Link href={href} className="btn-brand mt-4 inline-flex h-10 items-center px-4 text-sm">
        {label}
      </Link>
    </section>
  )
}
