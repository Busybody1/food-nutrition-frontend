'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/lib/hooks/use-auth'
import { SubscribeModal } from '@/components/stripe/SubscribeModal'
import { MarketingTrustPills } from '@/components/marketing/marketing-shell'
import { MarketingSheetHero } from '@/components/marketing/marketing-sheet'
import { PricingCard } from '@/components/marketing/pricing-card'
import { PricingEnterpriseBand } from '@/components/marketing/pricing-enterprise-band'
import { PricingComparison } from '@/components/marketing/pricing-comparison'
import { RevealGroup } from '@/components/marketing/reveal'
import { ScheduleCallDialog } from '@/components/marketing/schedule-call-dialog'
import { StatsBand } from '@/components/marketing/stats-band'
import { TrackedCtaLink } from '@/components/analytics/tracked-cta-link'
import { getPublicPageSeo } from '@/lib/public-page-seo'
import { fetchPublicPlans } from '@/lib/pricing/fetch-plans'
import { isContactSalesPlan, isEnterprisePlan, type PricingPlan } from '@/lib/pricing/plan-display'
import { isRestPaidPlan, restSubscribeLabel, restTrialChargeNote } from '@/lib/billing/trial-offer'
import { useTrialOffer } from '@/lib/billing/use-trial-offer'
import { cn } from '@/lib/utils/cn'

const PRICING_SEO = getPublicPageSeo('/pricing')

type PricingContentProps = {

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
  const { trialDays, offerPending } = useTrialOffer('rest')
  const chargeNote = restTrialChargeNote(offerPending ? null : trialDays)
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isScheduleOpen, setIsScheduleOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null)
  const [plans, setPlans] = useState<PricingPlan[]>(initialPlans)
  const [isLoading, setIsLoading] = useState(initialPlans.length === 0 && !initialError)
  const [loadError, setLoadError] = useState<string | null>(initialError)
  const [currentSubscription, setCurrentSubscription] = useState<{
    plan_id: number
    plan_name: string
  } | null>(null)

  const hasCurrentPlan =
    currentSubscription != null && plans.some((plan) => plan.id === currentSubscription.plan_id)

  const { selfServePlans, enterprisePlans } = useMemo(() => {
    const selfServe: PricingPlan[] = []
    const enterprise: PricingPlan[] = []
    for (const plan of plans) {
      if (isEnterprisePlan(plan.name)) enterprise.push(plan)
      else selfServe.push(plan)
    }
    return { selfServePlans: selfServe, enterprisePlans: enterprise }
  }, [plans])

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

      }
    }
    loadSubscription()
  }, [isAuthenticated, user])

  useEffect(() => {
    const planId = searchParams.get('plan_id')
    if (planId && plans.length > 0 && isAuthenticated) {
      const plan = plans.find((p) => p.id === parseInt(planId, 10))
      if (plan) {
        /* eslint-disable-next-line react-hooks/set-state-in-effect */
        setSelectedPlan(plan)
        setIsModalOpen(true)
      }
    }
  }, [searchParams, plans, isAuthenticated])

  const handlePlanSelect = async (plan: PricingPlan) => {
    if (isContactSalesPlan(plan.name)) {
      setIsScheduleOpen(true)
      return
    }

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

    setSelectedPlan(plan)
    setIsModalOpen(true)
  }

  return (
    <div className="marketing-page">
      <MarketingSheetHero
        title={PRICING_SEO.title}
        lead={PRICING_SEO.description}
        leadClassName="aeo-answer"
        actions={
          <>
            <TrackedCtaLink href="/auth/register" eventLabel="Get started free" className="btn-brand">
              Get started free
            </TrackedCtaLink>
            <button
              type="button"
              className="btn-brand-outline"
              onClick={() => setIsScheduleOpen(true)}
              aria-haspopup="dialog"
            >
              Schedule a call
            </button>
          </>
        }
      >
        <p className="mt-6 text-sm text-mk-muted">
          Using Claude Code or Cursor?{' '}
          <Link
            href="/mcp/pricing"
            className="rounded-sm font-medium text-brand-strong underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          >
            See the MCP plan
          </Link>
          .
        </p>
        <div className="mt-5">
          <MarketingTrustPills
            items={['Live limits from your plan', 'Cancel anytime', 'Enterprise image + credits']}
          />
        </div>
      </MarketingSheetHero>

      <section className="pb-14 pt-10 md:pb-20 md:pt-14">
        <div className="container-narrow space-y-8">
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
                    className="h-[420px] rounded-[22px] border border-mk-hair bg-white animate-pulse"
                  />
                ))}
              </div>
              <div className="h-48 rounded-[22px] border border-mk-hair bg-white animate-pulse" />
            </>
          ) : loadError ? (
            <div
              role="alert"
              className="mx-auto max-w-md rounded-[20px] border border-error-500/30 bg-white px-5 py-4 text-center shadow-card"
            >
              <p className="text-sm text-error-600">{loadError}</p>
            </div>
          ) : plans.length === 0 ? (
            <p className="text-sm text-mk-muted text-center">No plans available.</p>
          ) : (
            <>
              {selfServePlans.length > 0 && (
                <div className="space-y-4">
                  {chargeNote ? (
                    <p className="text-center text-sm text-mk-ink" role="status">
                      {chargeNote}
                    </p>
                  ) : null}
                  <RevealGroup
                    className={selfServeGridClass(selfServePlans.length)}
                    itemClassName="h-full min-w-0"
                  >
                    {selfServePlans.map((plan) => {
                      const paid = isRestPaidPlan(plan)
                      return (
                        <PricingCard
                          key={plan.id}
                          plan={plan}
                          isPopular={plan.is_recommended === true}
                          isCurrent={currentSubscription?.plan_id === plan.id}
                          emphasized={
                            hasCurrentPlan
                              ? currentSubscription?.plan_id === plan.id
                              : plan.is_recommended === true
                          }
                          subscribeLabel={restSubscribeLabel({
                            paid,
                            trialDays,
                            offerPending,
                          })}
                          subscribeDisabled={paid && offerPending}
                          onSelect={() => handlePlanSelect(plan)}
                        />
                      )
                    })}
                  </RevealGroup>
                </div>
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
        trialDays={chargeNote ? trialDays : null}
        onError={(error) => console.error('Subscription error:', error)}
      />
      <ScheduleCallDialog isOpen={isScheduleOpen} onClose={() => setIsScheduleOpen(false)} />
    </div>
  )
}
