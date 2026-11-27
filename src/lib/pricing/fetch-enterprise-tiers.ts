import { getApiBaseUrl } from '@/lib/pricing/fetch-plans'
import {
  DEFAULT_ENTERPRISE_PRICING,
  normalizeEnterprisePricing,
  type EnterprisePricing,
} from '@/lib/enterprise/model'

export async function fetchEnterprisePricing(): Promise<EnterprisePricing> {
  const url = `${getApiBaseUrl()}/api/v1/billing/enterprise-tiers/public`
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      next: { revalidate: 300 },
    })
    if (!res.ok) return DEFAULT_ENTERPRISE_PRICING
    return normalizeEnterprisePricing(await res.json())
  } catch {
    return DEFAULT_ENTERPRISE_PRICING
  }
}
