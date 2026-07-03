'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/hooks/use-auth'
import { SubscribeModal } from '@/components/stripe/SubscribeModal'
import { MarketingImageHero } from '@/components/marketing/marketing-image-hero'
import { MarketingTrustPills } from '@/components/marketing/marketing-shell'
import { PricingCard } from '@/components/marketing/pricing-card'
import { PricingComparison } from '@/components/marketing/pricing-comparison'
import { fetchPublicPlans } from '@/lib/pricing/fetch-plans'
import { isContactSalesPlan, type PricingPlan } from '@/lib/pricing/plan-display'

type PricingContentProps = {
  /** Server-fetched plans so the grid is in the SSR HTML (crawlable prices). */
  initialPlans: PricingPlan[]
  initialError: string | null
}

export function PricingContent({ initialPlans, initialError }: PricingContentProps) {
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null)
  const [plans, setPlans] = useState<PricingPlan[]>(initialPlans)
  const [isLoading, setIsLoading] = useState(initialPlans.length === 0 && !initialError)
  const [loadError, setLoadError] = useState<string | null>(initialError)
  const [currentSubscription, setCurrentSubscription] = useState<{
    plan_id: number
    plan_name: string
  } | null>(null)

  // Client-side fallback when server-side plan loading failed or returned nothing.
  useEffect(() => {
    if (initialPlans.length > 0) return
    const loadPlans = async () => {
      setLoadError(null)
      try {
        setPlans(await fetchPublicPlans())
      } catch (error) {
        console.error('Failed to load plans:', error)
        setLoadError(
          error instanceof Error ? error.message : 'Could not load plans from the API.'
        )
        setPlans([])
      } finally {
        setIsLoading(false)
      }
    }
    loadPlans()
  }, [initialPlans.length])

  useEffect(() => {
    if (!isAuthenticated || !user) return
    const loadSubscription = async () => {
      try {
        const { api } = await import('@/lib/api/client')
        const subscriptionResponse = await api.billing.getSubscription()
        if (subscriptionResponse.success) {
          setCurrentSubscription(
            subscriptionResponse.data as { plan_id: number; plan_name: string }
          )
        }
      } catch {
        // no subscription
      }
    }
    loadSubscription()
  }, [isAuthenticated, user])

  useEffect(() => {
    const planId = searchParams.get('plan_id')
    if (planId && plans.length > 0 && isAuthenticated) {
      const plan = plans.find((p) => p.id === parseInt(planId, 10))
      if (plan) {
        setSelectedPlan(plan)
        setIsModalOpen(true)
      }
    }
  }, [searchParams, plans, isAuthenticated])

  const handlePlanSelect = async (plan: PricingPlan) => {
    if (!isAuthenticated) {
      router.push('/auth/register')
      return
    }
    if (currentSubscription?.plan_id === plan.id) return

    if (currentSubscription && currentSubscription.plan_id !== plan.id) {
      try {
        const { api } = await import('@/lib/api/client')
        const response = await api.billing.updateSubscription(plan.id)
        if (response.success) router.push('/dashboard/billing')
      } catch (error) {
        console.error('Error updating subscription:', error)
      }
      return
    }

    if (plan.name === 'Free') {
      try {
        const { api } = await import('@/lib/api/client')
        await api.billing.createSubscription(plan.id)
      } catch (error) {
        console.error('Error updating to Free plan:', error)
      }
      router.push('/dashboard/billing')
      return
    }

    if (isContactSalesPlan(plan.name)) {
      router.push('/contact?inquiry=enterprise')
      return
    }

    setSelectedPlan(plan)
    setIsModalOpen(true)
  }

  const displayPlans = plans

  return (
    <div className="marketing-page">
      <MarketingImageHero compact centered waveTone="elevated">
        <h1 className="font-display text-4xl md:text-5xl text-ink mb-4">
          Simple, transparent pricing
        </h1>
        <p className="text-lg text-ink-muted mb-8 max-w-2xl mx-auto">
          Per-account rate limits, monthly quotas, and anti-scrape protections built in.
          Commercial production use starts on Plus.
        </p>
        <MarketingTrustPills
          items={[
            'Live limits from your plan',
            '5% food coverage cap',
            'Cancel anytime',
          ]}
        />
      </MarketingImageHero>

      <section className="pt-10 md:pt-12 pb-12 md:pb-20 bg-surface-elevated -mt-1">
        <div className="container-narrow flex flex-col items-center">
          {isLoading ? (
            <div className="flex w-full max-w-5xl flex-wrap justify-center gap-5 pt-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[280px] w-full max-w-[340px] rounded-brand border border-surface-border bg-white p-6 animate-pulse sm:max-w-[340px] lg:flex-[0_1_calc(33.333%-0.875rem)] lg:max-w-[320px]"
                />
              ))}
            </div>
          ) : loadError ? (
            <p className="text-sm text-red-600 pt-6 text-center max-w-md">{loadError}</p>
          ) : displayPlans.length === 0 ? (
            <p className="text-sm text-ink-muted pt-6">No plans available.</p>
          ) : (
            <div className="flex w-full max-w-5xl flex-wrap justify-center gap-5 pt-6">
              {displayPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="w-full max-w-[340px] sm:max-w-[340px] lg:max-w-[320px] lg:flex-[0_1_calc(33.333%-0.875rem)]"
                >
                  <PricingCard
                    plan={plan}
                    isPopular={plan.name === 'Plus'}
                    isCurrent={currentSubscription?.plan_id === plan.id}
                    onSelect={() => handlePlanSelect(plan)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {!isLoading && <PricingComparison plans={displayPlans} />}

      <SubscribeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        plan={selectedPlan}
        onError={(error) => console.error('Subscription error:', error)}
      />
    </div>
  )
}
