'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Check } from 'lucide-react'
import { useTrialOffer } from '@/lib/billing/use-trial-offer'
import { stripeAPI } from '@/lib/stripe/api'
import { useAuth } from '@/lib/hooks/use-auth'
import {
  MCP_ANNUAL_USD,
  MCP_MONTHLY_USD,
  MCP_PAID_LIMITS,
  annualAsMonthlyUsd,
  annualSavingsUsd,
  mcpFaqsForTrial,
  mcpPricingLeadForTrial,
  mcpTrialChargeNote,
  mcpTrialClick,
  mcpTrialCtaLabel,
  safeNextPath,
} from '@/lib/mcp/catalog'
import type { FaqItem } from '@/lib/faq-data'
import { FaqList } from '@/components/marketing/faq-section'
import type { PricingPlan } from '@/lib/pricing/plan-display'

type Interval = 'year' | 'month'

export function McpPricingLead({ text }: { text: string }) {
  const { trialDays } = useTrialOffer()
  return <>{mcpPricingLeadForTrial(text, trialDays)}</>
}

export function McpBillingFaq({ items }: { items: readonly FaqItem[] }) {
  const { trialDays } = useTrialOffer()
  return <FaqList items={mcpFaqsForTrial(items, trialDays)} />
}

const INCLUDED = [
  `${MCP_PAID_LIMITS.perMinute} calls per minute after the trial`,
  `${MCP_PAID_LIMITS.perMonth.toLocaleString()} calls a month`,
  `${MCP_PAID_LIMITS.results} foods per search`,
  `${MCP_PAID_LIMITS.visionMonth} photos a month`,
  'Claude Code and Cursor',
  'Personal use. MCP tools only.',
]

export function McpPricingCard({ plan }: { plan: PricingPlan | null }) {
  const router = useRouter()
  const { isAuthenticated, loading } = useAuth()
  const { trialDays, offerPending, offerFailed } = useTrialOffer()
  const [error, setError] = useState('')
  const [pending, setPending] = useState<Interval | null>(null)

  const monthly = plan && plan.monthly_price > 0 ? plan.monthly_price : MCP_MONTHLY_USD
  const annual = plan?.annual_price && plan.annual_price > 0 ? plan.annual_price : MCP_ANNUAL_USD
  const savings = annualSavingsUsd(monthly, annual)
  const annualMonthly = annualAsMonthlyUsd(annual)
  const checkoutOpen = plan != null && plan.id > 0
  const chargeNote = mcpTrialChargeNote(offerPending ? null : trialDays)

  const start = async (chosen: Interval) => {
    setError('')
    const hasSession = window.localStorage.getItem('access_token') != null
    const action = mcpTrialClick({
      loading,
      isAuthenticated,
      hasSession,
      checkoutOpen,
    })
    if (action === 'wait') {
      setError('Still checking your session. Try again in a moment.')
      return
    }
    if (action === 'login') {
      const next = safeNextPath('/mcp/pricing') || '/mcp/pricing'
      router.push(`/auth/login?next=${encodeURIComponent(next)}`)
      return
    }
    if (action === 'closed' || !plan) {
      setError('Checkout is closed until the MCP plan is active.')
      return
    }
    setPending(chosen)
    try {
      const origin = window.location.origin
      const session = await stripeAPI.createCheckoutSession({
        plan_id: plan.id,
        billing_interval: chosen,
        success_url: `${origin}/dashboard/api-keys?mcp=connected`,
        cancel_url: `${origin}/mcp/pricing?canceled=1`,
      })
      if (!session.url || !session.url.startsWith('https://')) {
        throw new Error('Checkout did not return a Stripe URL.')
      }
      window.location.assign(session.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start checkout.')
      setPending(null)
    }
  }

  return (
    <div>
      {!checkoutOpen && (
        <p className="mx-auto mb-6 max-w-2xl text-center text-sm text-mk-muted" role="status">
          Checkout is closed on this environment until the MCP plan is active. Prices shown are the
          published plan: ${monthly}/month or ${annualMonthly}/month.
        </p>
      )}
      {chargeNote ? (
        <p className="mx-auto mb-2 max-w-xl text-center text-sm text-mk-ink" role="status">
          {chargeNote}
        </p>
      ) : null}
      <div className="mx-auto grid max-w-4xl items-stretch gap-5 pt-4 md:grid-cols-2">
        <article className="flex h-full flex-col rounded-[22px] border border-mk-hair bg-white p-6 shadow-card md:p-8">
          <h2 className="text-xl font-semibold tracking-[-0.01em] text-mk-ink">Monthly</h2>
          <p className="mt-4 text-5xl font-semibold tabular-nums tracking-[-0.035em] text-mk-ink">
            ${monthly}
            <span className="text-lg font-medium tracking-normal text-mk-muted">/month</span>
          </p>
          <button
            type="button"
            className="btn-brand-outline mt-6 w-full disabled:cursor-wait"
            onClick={() => void start('month')}
            disabled={pending !== null || offerPending}
          >
            {mcpTrialCtaLabel({
              opening: pending === 'month',
              trialDays,
              offerPending,
              offerFailed,
            })}
          </button>
        </article>

        <article
          className="relative flex h-full flex-col rounded-[22px] border border-mk-hair bg-white p-6 shadow-card-strong md:p-8"
        >
          <p className="absolute left-1/2 top-0 inline-flex h-6 -translate-x-1/2 -translate-y-1/2 items-center rounded-full bg-brand px-2.5 text-xs font-medium text-mk-ink">
            Recommended
          </p>
          <h2 className="text-xl font-semibold tracking-[-0.01em] text-mk-ink">Annual</h2>
          <div className="mt-4 flex flex-wrap items-end gap-x-3 gap-y-1">
            <p className="text-5xl font-semibold tabular-nums tracking-[-0.035em] text-mk-ink">
              ${annualMonthly}
              <span className="text-lg font-medium tracking-normal text-mk-muted">/month</span>
            </p>
            {savings > 0 ? (
              <p className="pb-1.5 text-sm font-semibold text-red-700">${savings} USD Off</p>
            ) : null}
          </div>
          <button
            type="button"
            className="btn-brand mt-6 w-full disabled:cursor-wait"
            onClick={() => void start('year')}
            disabled={pending !== null || offerPending}
          >
            {mcpTrialCtaLabel({
              opening: pending === 'year',
              trialDays,
              offerPending,
              offerFailed,
            })}
          </button>
        </article>
      </div>
      <ul className="mx-auto mt-8 grid max-w-4xl gap-3 sm:grid-cols-2">
        {INCLUDED.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-[15px] text-mk-ink">
            <Check className="mt-1 h-4 w-4 shrink-0 text-mk-green" aria-hidden />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      {error ? (
        <p className="mx-auto mt-4 max-w-xl text-center text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
      <p className="mx-auto mt-8 max-w-xl text-center text-sm text-mk-muted">
        Building an app?{' '}
        <Link
          href="/pricing"
          className="rounded-sm font-medium text-brand-strong underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
        >
          API pricing
        </Link>{' '}
        is a separate product. Commercial products need a{' '}
        <Link
          href="/commercial-license"
          className="rounded-sm font-medium text-brand-strong underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
        >
          commercial license
        </Link>
        .
      </p>
    </div>
  )
}
