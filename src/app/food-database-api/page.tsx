import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/metadata'
import { CapabilityPageView } from '@/components/marketing/capability-page'
import { getCapabilityPage, capabilityPath } from '@/lib/capability-pages-data'
import { fetchPublicPlans } from '@/lib/pricing/fetch-plans'
import { isMcpPlan, type PricingPlan } from '@/lib/pricing/plan-display'

const page = getCapabilityPage('food-database-api')!

export const metadata: Metadata = buildPageMetadata({
  title: page.metaTitle,
  description: page.description,
  keywords: page.keywords,
  path: capabilityPath(page.slug),
  hasDedicatedOgImage: true,
})

async function loadPublicRestPlans(): Promise<PricingPlan[]> {
  try {
    const plans = await fetchPublicPlans()
    return plans.filter((plan) => !isMcpPlan(plan))
  } catch {
    return []
  }
}

export default async function FoodDatabaseApiPage() {
  const plans = await loadPublicRestPlans()
  return <CapabilityPageView page={page} plans={plans} />
}
