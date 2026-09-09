import { Suspense } from 'react'
import { MarketingPageLoading } from '@/components/marketing/marketing-shell'
import { PricingContent } from '@/components/marketing/pricing-content'
import { fetchPublicPlans } from '@/lib/pricing/fetch-plans'
import type { PricingPlan } from '@/lib/pricing/plan-display'

export default async function PricingPage() {
  let initialPlans: PricingPlan[] = []
  let initialError: string | null = null
  try {
    initialPlans = await fetchPublicPlans()
  } catch (error) {
    initialError = null
    console.error('Server-side plan fetch failed:', error)
  }

  return (
    <Suspense fallback={<MarketingPageLoading message="Loading pricing..." />}>
      <PricingContent initialPlans={initialPlans} initialError={initialError} />
    </Suspense>
  )
}
