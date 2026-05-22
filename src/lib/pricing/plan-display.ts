export interface PricingPlan {
  id: number
  name: string
  monthly_price: number
  description: string
  highlights: string[]
  monthly_quota: number
  rate_limit_per_minute: number
  stripe_test_price_id?: string
  stripe_live_price_id?: string
}

export function isEnterprisePlan(name: string): boolean {
  return name.toLowerCase() === 'enterprise'
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

/** Display monthly quota exactly as stored in plans.monthly_quota. */
export function formatQuota(quota: number): string {
  if (quota <= 0) return '—'
  if (quota >= 1_000_000) {
    return `${(quota / 1_000_000).toFixed(quota % 1_000_000 === 0 ? 0 : 1)}M`
  }
  if (quota >= 1_000) return `${Math.round(quota / 1_000)}K`
  return quota.toLocaleString()
}

/** Display rate_limit_per_minute exactly as stored in plans.rate_limit_per_minute. */
export function formatRateLimit(rpm: number): string {
  if (rpm <= 0) return '—'
  return `${rpm.toLocaleString()}/min`
}

export function formatPlanPrice(plan: PricingPlan): { amount: string; suffix: string } {
  if (plan.monthly_price === 0) return { amount: '$0', suffix: '/mo' }
  if (isEnterprisePlan(plan.name)) return { amount: 'Custom', suffix: '' }
  return { amount: `$${plan.monthly_price}`, suffix: '/mo' }
}

export function allowsCommercialUse(planName: string): boolean {
  const tier = planName.toLowerCase()
  return tier === 'plus' || tier === 'enterprise'
}

export function getPlanCardHighlights(
  name: string,
  monthlyQuota: number,
  rateLimit: number
): string[] {
  const quota = `${formatQuota(monthlyQuota)} API calls / month`
  const rate = `${formatRateLimit(rateLimit)} rate limit (per account)`
  const items = [quota, rate, '5% unique foods / month (anti-scrape)']

  if (allowsCommercialUse(name)) {
    items.push('Commercial production use')
    items.push('Redis response caching (5 min)')
  } else {
    items.push('Non-commercial use only')
  }

  switch (name.toLowerCase()) {
    case 'free':
      items.push('1 API key · Community support')
      break
    case 'basic':
      items.push('3 API keys · Email support')
      break
    case 'core':
      items.push('10 API keys · Priority support')
      break
    case 'plus':
      items.push('25 API keys · Dedicated support')
      break
    case 'enterprise':
      items.push('100 API keys · Phone & custom SLA')
      break
    default:
      items.push('Standard support')
  }

  return items
}

export function getPlanDescription(name: string, fallback: string): string {
  if (fallback?.trim()) return fallback
  const descriptions: Record<string, string> = {
    free: 'Test integrations and prototypes',
    basic: 'Small apps and early-stage startups',
    core: 'Growing products with higher volume',
    plus: 'Commercial apps at production scale',
    enterprise: 'Custom volume, limits, and contracts',
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
  const order = ['free', 'basic', 'core', 'plus', 'enterprise']
  return order.indexOf(name.toLowerCase())
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
    feature: 'Distinct foods per month',
    section: 'limits',
    getValue: () => '5% of database',
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
    feature: 'API keys',
    section: 'features',
    getValue: (p) => {
      const map: Record<string, string> = {
        free: '1',
        basic: '3',
        core: '10',
        plus: '25',
        enterprise: '100',
      }
      return map[p.name.toLowerCase()] ?? '—'
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
      }
      return map[p.name.toLowerCase()] ?? '—'
    },
  },
  {
    feature: 'SLA',
    section: 'support',
    getValue: (p) => {
      const map: Record<string, CompareCell> = {
        free: '—',
        basic: '99%',
        core: '99.5%',
        plus: '99.9%',
        enterprise: '99.99%',
      }
      return map[p.name.toLowerCase()] ?? '—'
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

/** Map API/DB plan rows to UI — uses database values as-is (no client-side overrides). */
export function transformPlanData(backendPlans: Record<string, unknown>[]): PricingPlan[] {
  return backendPlans.map((plan) => {
    const name = String(plan.name ?? '')
    const monthlyQuota = parseIntField(plan.monthly_quota)
    const rateLimit = parseIntField(plan.rate_limit_per_minute)
    const description =
      typeof plan.description === 'string' ? plan.description : ''

    return {
      id: parseIntField(plan.id),
      name,
      monthly_price: parseFloatField(plan.monthly_price),
      description: getPlanDescription(name, description),
      monthly_quota: monthlyQuota,
      rate_limit_per_minute: rateLimit,
      highlights: getPlanCardHighlights(name, monthlyQuota, rateLimit),
      stripe_test_price_id: plan.stripe_test_price_id as string | undefined,
      stripe_live_price_id: plan.stripe_live_price_id as string | undefined,
    }
  })
}

/** Only used when the plans API is unreachable (offline / misconfigured). */
export const FALLBACK_PLANS: PricingPlan[] = []

export const PRICING_FOOTNOTES = [
  'Rate limits apply per account (user id), not per IP — suitable for multi-tenant and server-side apps.',
  'Each plan may access at most 5% of distinct foods in the database per calendar month to prevent catalog scraping.',
  'Commercial production use requires Plus or Enterprise. Send header X-API-Usage-Type: commercial when applicable.',
  'Plus and Enterprise include short-lived Redis caching on search and food GET endpoints to absorb traffic spikes.',
]
