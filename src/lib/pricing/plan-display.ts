export interface PricingPlan {
  id: number
  name: string
  monthly_price: number
  annual_price?: number
  plan_tier?: string
  description: string
  highlights: string[]
  monthly_quota: number
  rate_limit_per_minute: number

  max_api_keys?: number

  max_results_per_query: number
  stripe_test_price_id?: string
  stripe_live_price_id?: string
  price_display_label?: string | null

  is_recommended?: boolean
}

export function isEnterprisePlan(name: string): boolean {
  const tier = name.toLowerCase()
  return tier === 'enterprise' || tier === 'custom'
}

export function isContactSalesPlan(name: string): boolean {
  return isEnterprisePlan(name)
}

export function isMcpPlan(plan: Pick<PricingPlan, 'name' | 'plan_tier'>): boolean {
  return plan.plan_tier?.toLowerCase() === 'mcp' || plan.name.toLowerCase() === 'mcp'
}

function parseIntField(value: unknown): number {
  if (typeof value === 'number' && !Number.isNaN(value)) return Math.trunc(value)
  if (typeof value === 'string' && value.trim() !== '') {
    const n = parseInt(value, 10)
    return Number.isNaN(n) ? 0 : n
  }
  return 0
}

function parseFloatField(value: unknown): number {
  if (typeof value === 'number' && !Number.isNaN(value)) return value
  if (typeof value === 'string' && value.trim() !== '') {
    const n = parseFloat(value)
    return Number.isNaN(n) ? 0 : n
  }
  return 0
}

function parseHighlights(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean)
}

export function formatQuota(quota: number): string {
  if (quota <= 0) return '-'
  if (quota >= 1_000_000) {
    return `${(quota / 1_000_000).toFixed(quota % 1_000_000 === 0 ? 0 : 1)}M`
  }
  if (quota >= 1_000) return `${Math.round(quota / 1_000)}K`
  return quota.toLocaleString()
}

export function formatRateLimit(rpm: number): string {
  if (rpm <= 0) return '-'
  return `${rpm.toLocaleString()}/min`
}

export function defaultResultsPerQuery(name: string): number {
  return name.toLowerCase() === 'free' ? 20 : 100
}

export function resolveResultsPerQuery(name: string, value?: number): number {
  if (value != null && value > 0) return value
  return defaultResultsPerQuery(name)
}

export function formatResultsPerQuery(limit: number): string {
  if (limit <= 0) return '-'
  return `${limit.toLocaleString()} food${limit === 1 ? '' : 's'}`
}

export function formatPlanPrice(plan: PricingPlan): { amount: string; suffix: string } {
  if (plan.price_display_label?.trim()) {
    return { amount: plan.price_display_label.trim(), suffix: '' }
  }
  if (plan.monthly_price === 0) return { amount: '$0', suffix: '/mo' }
  if (isEnterprisePlan(plan.name)) return { amount: 'Enterprise', suffix: '' }
  return { amount: `$${plan.monthly_price}`, suffix: '/mo' }
}

export function allowsCommercialUse(planName: string): boolean {
  const tier = planName.toLowerCase()
  return tier === 'plus' || tier === 'enterprise' || tier === 'custom'
}

function apiKeyLabel(count: number): string {
  return `${count} API key${count === 1 ? '' : 's'}`
}

export function getPlanCardHighlights(
  name: string,
  monthlyQuota: number,
  rateLimit: number,
  maxApiKeys?: number,
  maxResultsPerQuery?: number
): string[] {
  const quota = `${formatQuota(monthlyQuota)} API calls / month`
  const rate = `${formatRateLimit(rateLimit)} rate limit (per account)`
  const items = [quota, rate]

  if (allowsCommercialUse(name)) {
    items.push('Commercial production use')
    items.push('Redis response caching (5 min)')
  } else {
    items.push('Non-commercial use only')
  }

  const keys = (fallback: number) =>
    apiKeyLabel(maxApiKeys != null && maxApiKeys > 0 ? maxApiKeys : fallback)

  switch (name.toLowerCase()) {
    case 'free':
      items.push(`${keys(1)} · Community support`)
      break
    case 'basic':
      items.push(`${keys(3)} · Email support`)
      break
    case 'core':
      items.push(`${keys(10)} · Priority support`)
      break
    case 'plus':
      items.push(`${keys(25)} · Dedicated support`)
      break
    case 'enterprise':
    case 'custom':
      items.push('Image-to-calorie API')
      items.push('Credits-based usage')
      items.push(`${keys(100)} · Phone & custom SLA`)
      break
    default:
      items.push('Standard support')
  }

  items.push(
    `${formatResultsPerQuery(resolveResultsPerQuery(name, maxResultsPerQuery))} per query`
  )
  return items
}

export function getPlanDescription(name: string, fallback: string): string {
  if (fallback?.trim()) return fallback
  const descriptions: Record<string, string> = {
    free: 'Test integrations and prototypes',
    basic: 'Small apps and early-stage startups',
    core: 'Growing products with higher volume',
    plus: 'Commercial apps at production scale',
    enterprise: 'Custom volume, image-to-calorie API, and credits-based usage',
    custom: 'Custom volume, image-to-calorie API, and credits-based usage',
  }
  return descriptions[name.toLowerCase()] ?? ''
}

type CompareCell = boolean | string

export type CompareRow = {
  feature: string
  getValue: (plan: PricingPlan) => CompareCell
  section?: 'limits' | 'features' | 'support'
}

function planTier(name: string): number {
  const order = ['free', 'basic', 'core', 'plus', 'enterprise', 'custom']
  const idx = order.indexOf(name.toLowerCase())
  if (name.toLowerCase() === 'custom') return order.indexOf('enterprise')
  return idx
}

function atLeast(plan: PricingPlan, tierName: string): boolean {
  return planTier(plan.name) >= planTier(tierName)
}

export const COMPARE_ROWS: CompareRow[] = [
  {
    feature: 'Monthly API calls',
    section: 'limits',
    getValue: (p) => formatQuota(p.monthly_quota),
  },
  {
    feature: 'Rate limit (per account, not IP)',
    section: 'limits',
    getValue: (p) => formatRateLimit(p.rate_limit_per_minute),
  },
  {
    feature: 'Foods per query',
    section: 'limits',
    getValue: (p) => formatResultsPerQuery(resolveResultsPerQuery(p.name, p.max_results_per_query)),
  },
  {
    feature: 'Commercial production use',
    section: 'limits',
    getValue: (p) => allowsCommercialUse(p.name),
  },
  {
    feature: 'Response caching (GET search & foods)',
    section: 'limits',
    getValue: (p) => atLeast(p, 'plus'),
  },
  {
    feature: 'Image-to-calorie API',
    section: 'features',
    getValue: (p) => isEnterprisePlan(p.name),
  },
  {
    feature: 'Credits-based usage',
    section: 'features',
    getValue: (p) => isEnterprisePlan(p.name),
  },
  {
    feature: 'API keys',
    section: 'features',
    getValue: (p) => {

      if (p.max_api_keys != null && p.max_api_keys > 0) return String(p.max_api_keys)
      const map: Record<string, string> = {
        free: '1',
        basic: '3',
        core: '10',
        plus: '25',
        enterprise: '100',
        custom: '100',
      }
      return map[p.name.toLowerCase()] ?? '-'
    },
  },
  {
    feature: 'Advanced search',
    section: 'features',
    getValue: (p) => atLeast(p, 'basic'),
  },
  {
    feature: 'Usage analytics',
    section: 'features',
    getValue: (p) => atLeast(p, 'basic'),
  },
  {
    feature: 'Webhook support',
    section: 'features',
    getValue: (p) => atLeast(p, 'core'),
  },
  {
    feature: 'White-label options',
    section: 'features',
    getValue: (p) => atLeast(p, 'plus'),
  },
  {
    feature: 'Support',
    section: 'support',
    getValue: (p) => {
      const map: Record<string, string> = {
        free: 'Community',
        basic: 'Email',
        core: 'Priority',
        plus: 'Dedicated',
        enterprise: 'Dedicated + phone',
        custom: 'Dedicated + phone',
      }
      return map[p.name.toLowerCase()] ?? '-'
    },
  },
  {
    feature: 'SLA',
    section: 'support',
    getValue: (p) => {
      const map: Record<string, CompareCell> = {
        free: '-',
        basic: '99%',
        core: '99.5%',
        plus: '99.9%',
        enterprise: '99.99%',
        custom: '99.99%',
      }
      return map[p.name.toLowerCase()] ?? '-'
    },
  },
  {
    feature: 'Custom integrations',
    section: 'support',
    getValue: (p) => isEnterprisePlan(p.name),
  },
  {
    feature: 'On-premise deployment',
    section: 'support',
    getValue: (p) => isEnterprisePlan(p.name),
  },
]

export function transformPlanData(backendPlans: Record<string, unknown>[]): PricingPlan[] {
  return backendPlans.map((plan) => {
    const name = String(plan.name ?? '')
    const monthlyQuota = parseIntField(plan.monthly_quota)
    const rateLimit = parseIntField(plan.rate_limit_per_minute)
    const description =
      typeof plan.description === 'string' ? plan.description : ''
    const apiHighlights = parseHighlights(plan.card_highlights)
    const priceLabel =
      typeof plan.price_display_label === 'string' ? plan.price_display_label : null
    const maxApiKeys =
      plan.max_api_keys != null ? parseIntField(plan.max_api_keys) : undefined
    const maxResultsRaw =
      plan.max_results_per_query != null ? parseIntField(plan.max_results_per_query) : undefined
    const maxResultsPerQuery = resolveResultsPerQuery(name, maxResultsRaw)

    return {
      id: parseIntField(plan.id),
      name,
      monthly_price: parseFloatField(plan.monthly_price),
      annual_price: plan.annual_price != null ? parseFloatField(plan.annual_price) : undefined,
      plan_tier: typeof plan.plan_tier === 'string' ? plan.plan_tier : undefined,
      description: getPlanDescription(name, description),
      monthly_quota: monthlyQuota,
      rate_limit_per_minute: rateLimit,
      max_api_keys: maxApiKeys != null && maxApiKeys > 0 ? maxApiKeys : undefined,
      max_results_per_query: maxResultsPerQuery,
      highlights:
        apiHighlights.length > 0
          ? apiHighlights
          : getPlanCardHighlights(name, monthlyQuota, rateLimit, maxApiKeys, maxResultsPerQuery),
      stripe_test_price_id: plan.stripe_test_price_id as string | undefined,
      stripe_live_price_id: plan.stripe_live_price_id as string | undefined,
      price_display_label: priceLabel,
      is_recommended: plan.is_recommended === true,
    }
  })
}

export const FALLBACK_PLANS: PricingPlan[] = []

export const PRICING_FOOTNOTES = [
  'Rate limits apply per account (user id), not per IP, suitable for multi-tenant and server-side apps.',
  'Foods per query is the maximum number of foods returned on each search or catalog request. Requested limits above the cap are truncated.',
  'Commercial production use requires Plus or Enterprise. Send header X-API-Usage-Type: commercial when applicable.',
  'Plus and Enterprise include short-lived Redis caching on search and food GET endpoints to absorb traffic spikes.',
  'Enterprise includes image-to-calorie API access and credits-based usage. Contact sales to enable.',
]
