export type ApiKeyProduct = 'rest' | 'mcp'

export function accountIsMcp(plan: { name?: string | null; plan_tier?: string | null } | null): boolean {
  if (!plan) return false
  const tier = (plan.plan_tier || '').trim().toLowerCase()
  const name = (plan.name || '').trim().toLowerCase()
  return tier === 'mcp' || name === 'mcp' || name.includes('mcp')
}

export function apiKeyProductFromSearch(search: string, mcpAccount: boolean): ApiKeyProduct {
  const query = search.startsWith('?') ? search.slice(1) : search
  const params = new URLSearchParams(query)
  const requested = params.get('product')
  if (requested === 'mcp' || requested === 'rest') return requested
  if (params.get('mcp') === 'connected') return 'mcp'
  return mcpAccount ? 'mcp' : 'rest'
}
