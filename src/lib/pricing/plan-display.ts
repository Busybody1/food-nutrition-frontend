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
  price_display_label?: string | null
}

export function isEnterprisePlan(name: string): boolean {
  const tier = name.toLowerCase()
  return tier === 'enterprise' || tier === 'custom'
}

export function isContactSalesPlan(name: string): boolean {
  return isEnterprisePlan(name)
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

/** Display monthly quota exactly as stored in plans.monthly_quota. */
export function formatQuota(quota: number): string {
  if (quota <= 0) return '-'
  if (quota >= 1_000_000) {
    return `${(quota / 1_000_000).toFixed(quota % 1_000_000 === 0 ? 0 : 1)}M`
  }
  if (quota >= 1_000) return `${Math.round(quota / 1_000)}K`
  return quota.toLocaleString()
}

/** Display rate_limit_per_minute exactly as stored in plans.rate_limit_per_minute. */
export function formatRateLimit(rpm: number): string {
  if (rpm <= 0) return '-'
  return `${rpm.toLocaleString()}/min`
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

export function getPlanCardHighlights(
  name: string,
  monthlyQuota: number,
  rateLimit: number
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
    case 'custom':
      items.push('Image-to-calorie API')
      items.push('Credits-based usage')
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

/** Map API/DB plan rows to UI; prefer admin-managed card_highlights when present. */
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

    return {
      id: parseIntField(plan.id),
      name,
      monthly_price: parseFloatField(plan.monthly_price),
      description: getPlanDescription(name, description),
      monthly_quota: monthlyQuota,
      rate_limit_per_minute: rateLimit,
      highlights:
        apiHighlights.length > 0
          ? apiHighlights
          : getPlanCardHighlights(name, monthlyQuota, rateLimit),
      stripe_test_price_id: plan.stripe_test_price_id as string | undefined,
      stripe_live_price_id: plan.stripe_live_price_id as string | undefined,
      price_display_label: priceLabel,
    }
  })
}

/** Only used when the plans API is unreachable (offline / misconfigured). */
export const FALLBACK_PLANS: PricingPlan[] = []

export const PRICING_FOOTNOTES = [
  'Rate limits apply per account (user id), not per IP, suitable for multi-tenant and server-side apps.',
  'Commercial production use requires Plus or Enterprise. Send header X-API-Usage-Type: commercial when applicable.',
  'Plus and Enterprise include short-lived Redis caching on search and food GET endpoints to absorb traffic spikes.',
  'Enterprise includes image-to-calorie API access and credits-based usage. Contact sales to enable.',
]
