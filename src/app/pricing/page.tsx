import { Suspense } from 'react'
import { MarketingPageLoading } from '@/components/marketing/marketing-shell'
import { PricingContent } from '@/components/marketing/pricing-content'
import { fetchPublicPlans } from '@/lib/pricing/fetch-plans'
import { fetchEnterprisePricing } from '@/lib/pricing/fetch-enterprise-tiers'
import type { PricingPlan } from '@/lib/pricing/plan-display'

export default async function PricingPage() {
  let initialPlans: PricingPlan[] = []
  let initialError: string | null = null
  const enterprisePricingPromise = fetchEnterprisePricing()
  try {
    initialPlans = await fetchPublicPlans()
  } catch (error) {
    initialError = null
    console.error('Server-side plan fetch failed:', error)
  }
  const enterprisePricing = await enterprisePricingPromise

  return (
    <Suspense fallback={<MarketingPageLoading message="Loading pricing..." />}>
      <PricingContent
        initialPlans={initialPlans}
        initialError={initialError}
        enterprisePricing={enterprisePricing}
      />
    </Suspense>
  )
}
