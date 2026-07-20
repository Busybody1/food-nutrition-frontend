'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/lib/hooks/use-auth'
import { SubscribeModal } from '@/components/stripe/SubscribeModal'
import { MarketingImageHero } from '@/components/marketing/marketing-image-hero'
import { MarketingTrustPills } from '@/components/marketing/marketing-shell'
import { PricingCard } from '@/components/marketing/pricing-card'
import { PricingEnterpriseBand } from '@/components/marketing/pricing-enterprise-band'
import { PricingComparison } from '@/components/marketing/pricing-comparison'
import { RevealGroup } from '@/components/marketing/reveal'
import { StatsBand } from '@/components/marketing/stats-band'
import { TrackedCtaLink } from '@/components/analytics/tracked-cta-link'
import { fetchPublicPlans } from '@/lib/pricing/fetch-plans'
import { isContactSalesPlan, isEnterprisePlan, type PricingPlan } from '@/lib/pricing/plan-display'
import { cn } from '@/lib/utils/cn'

type PricingContentProps = {
  /** Server-fetched plans so the grid is in the SSR HTML (crawlable prices). */
  initialPlans: PricingPlan[]
  initialError: string | null
}

function selfServeGridClass(count: number): string {
  const map: Record<number, string> = {
    1: 'grid-cols-1 max-w-sm mx-auto',
    2: 'sm:grid-cols-2 max-w-3xl mx-auto',
    3: 'sm:grid-cols-2 lg:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-4',
  }
  return cn('grid w-full gap-4 md:gap-5', map[count] ?? 'sm:grid-cols-2 lg:grid-cols-3')
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

  const { selfServePlans, enterprisePlans } = useMemo(() => {
    const selfServe: PricingPlan[] = []
    const enterprise: PricingPlan[] = []
    for (const plan of plans) {
      if (isEnterprisePlan(plan.name)) enterprise.push(plan)
      else selfServe.push(plan)
    }
    return { selfServePlans: selfServe, enterprisePlans: enterprise }
  }, [plans])

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

  return (
    <div className="marketing-page">
      <MarketingImageHero compact centered waveTone="elevated">
        <h1 className="font-display text-4xl md:text-5xl text-ink mb-4">
          Simple, transparent pricing
        </h1>
        <p className="text-lg text-ink-muted mb-8 max-w-2xl mx-auto">
          Per-account rate limits and monthly quotas for every tier. Commercial production use
          starts on Plus. Enterprise adds image-to-calorie API and credits-based usage.
        </p>
        <div className="mb-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <TrackedCtaLink
            href="/auth/register"
            eventLabel="Get started free"
            className="btn-brand h-12 w-full px-8 text-base sm:w-auto"
          >
            Get started free
          </TrackedCtaLink>
          <TrackedCtaLink
            href="/contact?inquiry=enterprise"
            eventLabel="Contact Sales"
            className="btn-brand-outline h-12 w-full px-8 text-base sm:w-auto"
          >
            Contact Sales
          </TrackedCtaLink>
        </div>
        <MarketingTrustPills
          items={['Live limits from your plan', 'Cancel anytime', 'Enterprise image + credits']}
        />
      </MarketingImageHero>

      <section className="relative overflow-hidden bg-surface-elevated pt-10 md:pt-12 pb-20 md:pb-28">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-full max-w-[900px] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(10,197,215,0.12),transparent_65%)]"
        />
        <div className="container-narrow relative space-y-8">
          {isLoading ? (
            <>
              <div
                role="status"
                aria-label="Loading pricing..."
                className={selfServeGridClass(4)}
              >
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-[420px] rounded-brand border border-surface-border bg-white animate-pulse"
                  />
                ))}
              </div>
              <div className="h-48 rounded-brand border border-surface-border bg-white animate-pulse" />
            </>
          ) : loadError ? (
            <div
              role="alert"
              className="mx-auto max-w-md rounded-brand border border-error-500/30 bg-white px-5 py-4 text-center shadow-glass"
            >
              <p className="text-sm text-error-600">{loadError}</p>
            </div>
          ) : plans.length === 0 ? (
            <p className="text-sm text-ink-muted text-center">No plans available.</p>
          ) : (
            <>
              {selfServePlans.length > 0 && (
                <RevealGroup
                  className={selfServeGridClass(selfServePlans.length)}
                  itemClassName="h-full min-w-0"
                >
                  {selfServePlans.map((plan) => (
                    <PricingCard
                      key={plan.id}
                      plan={plan}
                      isPopular={plan.name === 'Plus'}
                      isCurrent={currentSubscription?.plan_id === plan.id}
                      onSelect={() => handlePlanSelect(plan)}
                    />
                  ))}
                </RevealGroup>
              )}

              {enterprisePlans.map((plan) => (
                <PricingEnterpriseBand
                  key={plan.id}
                  plan={plan}
                  isCurrent={currentSubscription?.plan_id === plan.id}
                  onSelect={() => handlePlanSelect(plan)}
                />
              ))}
            </>
          )}
        </div>
      </section>

      <StatsBand />

      {!isLoading && <PricingComparison plans={plans} />}

      <SubscribeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        plan={selectedPlan}
        onError={(error) => console.error('Subscription error:', error)}
      />
    </div>
  )
}
