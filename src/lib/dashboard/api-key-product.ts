export type ApiKeyProduct = 'rest' | 'mcp'

export function accountIsMcp(
  plan: { name?: string | null; plan_name?: string | null; plan_tier?: string | null } | null
): boolean {
  if (!plan) return false
  const tier = (plan.plan_tier || '').trim().toLowerCase()
  const name = (plan.name || plan.plan_name || '').trim().toLowerCase()
  return tier === 'mcp' || name === 'mcp' || name.includes('mcp')
}

export function keyProduct(
  key: { product?: string | null },
  fallback: ApiKeyProduct
): ApiKeyProduct {
  const raw = (key.product || '').trim().toLowerCase()
  if (raw === 'mcp' || raw === 'rest') return raw
  return fallback
}

export function keysForProduct<T extends { product?: string | null }>(
  keys: T[],
  product: ApiKeyProduct,
  fallback: ApiKeyProduct
): T[] {
  return keys.filter((key) => keyProduct(key, fallback) === product)
}

export function apiKeyProductFromSearch(search: string, mcpAccount: boolean): ApiKeyProduct {
  const query = search.startsWith('?') ? search.slice(1) : search
  const params = new URLSearchParams(query)
  const requested = params.get('product')
  if (requested === 'mcp' || requested === 'rest') return requested
  if (params.get('mcp') === 'connected') return 'mcp'
  return mcpAccount ? 'mcp' : 'rest'
}
