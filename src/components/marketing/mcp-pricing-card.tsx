'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Check } from 'lucide-react'
import { stripeAPI } from '@/lib/stripe/api'
import { useAuth } from '@/lib/hooks/use-auth'
import {
  MCP_ANNUAL_USD,
  MCP_MONTHLY_USD,
  MCP_PAID_LIMITS,
  annualAsMonthlyUsd,
  annualSavingsUsd,
  mcpTrialClick,
  safeNextPath,
} from '@/lib/mcp/catalog'
import type { PricingPlan } from '@/lib/pricing/plan-display'
import { cn } from '@/lib/utils/cn'

type Interval = 'year' | 'month'

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
  const [error, setError] = useState('')
  const [pending, setPending] = useState<Interval | null>(null)

  const monthly = plan && plan.monthly_price > 0 ? plan.monthly_price : MCP_MONTHLY_USD
  const annual = plan?.annual_price && plan.annual_price > 0 ? plan.annual_price : MCP_ANNUAL_USD
  const savings = annualSavingsUsd(monthly, annual)
  const annualMonthly = annualAsMonthlyUsd(annual)
  const checkoutOpen = plan != null && plan.id > 0

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
        <p className="mx-auto mb-6 max-w-2xl text-center text-sm text-ink-muted" role="status">
          Checkout is closed on this environment until the MCP plan is active. Prices shown are the
          published plan: ${monthly}/month or ${annualMonthly}/month.
        </p>
      )}
      <div className="mx-auto grid max-w-4xl items-stretch gap-5 md:grid-cols-2">
        <article
          className={cn(
            'relative flex flex-col rounded-brand border border-brand/40 bg-white p-6 shadow-glow md:p-8',
            'motion-safe:md:-translate-y-2',
            'before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-[3px]',
            'before:rounded-t-brand before:bg-brand before:content-[""]'
          )}
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-strong">Recommended</p>
          <h2 className="mt-2 font-display text-2xl text-ink">Annual</h2>
          <p className="mt-4 font-display text-5xl tabular-nums text-ink">
            ${annualMonthly}
            <span className="text-lg text-ink-muted">/month</span>
          </p>
          {savings > 0 ? (
            <p className="mt-2 text-sm font-semibold text-red-600">${savings} USD Off</p>
          ) : (
            <p className="mt-2 text-sm text-ink-muted">If you buy annual</p>
          )}
          <button
            type="button"
            className="btn-brand mt-6 h-12 w-full cursor-pointer text-base disabled:cursor-wait disabled:opacity-70"
            onClick={() => void start('year')}
            disabled={pending !== null}
          >
            {pending === 'year' ? 'Opening checkout' : 'Start 7-day trial'}
          </button>
          <p className="mt-2 text-center text-xs text-ink-muted">Card required. Cancel anytime.</p>
        </article>

        <article className="flex flex-col rounded-brand border border-surface-border/80 bg-white p-6 shadow-glass md:p-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Pay as you go</p>
          <h2 className="mt-2 font-display text-2xl text-ink">Monthly</h2>
          <p className="mt-4 font-display text-5xl tabular-nums text-ink">
            ${monthly}
            <span className="text-lg text-ink-muted">/month</span>
          </p>
          <p className="mt-2 text-sm text-ink-muted">Same tools. No discount.</p>
          <button
            type="button"
            className="btn-brand-outline mt-6 h-12 w-full cursor-pointer text-base disabled:cursor-wait disabled:opacity-70"
            onClick={() => void start('month')}
            disabled={pending !== null}
          >
            {pending === 'month' ? 'Opening checkout' : 'Start 7-day trial'}
          </button>
          <p className="mt-2 text-center text-xs text-ink-muted">Card required. Cancel anytime.</p>
        </article>
      </div>
      <ul className="mx-auto mt-8 grid max-w-4xl gap-3 sm:grid-cols-2">
        {INCLUDED.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-sm text-ink">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-strong" aria-hidden />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      {error ? (
        <p className="mx-auto mt-4 max-w-xl text-center text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
      <p className="mx-auto mt-8 max-w-xl text-center text-sm text-ink-muted">
        Building an app?{' '}
        <Link href="/pricing" className="font-medium text-brand-strong underline underline-offset-2">
          API pricing
        </Link>{' '}
        is a separate product. Commercial products need a{' '}
        <Link href="/commercial-license" className="font-medium text-brand-strong underline underline-offset-2">
          commercial license
        </Link>
        .
      </p>
    </div>
  )
}
