import { transformPlanData, type PricingPlan } from '@/lib/pricing/plan-display'

export function getApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  return raw.replace(/\/$/, '')
}

export async function fetchPublicPlans(tier?: string): Promise<PricingPlan[]> {
  const base = getApiBaseUrl()
  const query = tier ? `?tier=${encodeURIComponent(tier)}` : ''
  const url = `${base}/api/v1/billing/plans/public${query}`

  let res: Response
  try {
    res = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    })
  } catch (err) {
    const hint =
      err instanceof TypeError
        ? `Cannot reach ${base}, check NEXT_PUBLIC_API_URL (hostname/DNS or server down).`
        : 'Network error loading plans.'
    throw new Error(hint)
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(
      `Plans API returned HTTP ${res.status} from ${url}${body ? `: ${body.slice(0, 120)}` : ''}`
    )
  }

  const data = (await res.json()) as Record<string, unknown>[]
  return transformPlanData(data)
}
