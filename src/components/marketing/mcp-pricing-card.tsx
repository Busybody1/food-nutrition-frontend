'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { stripeAPI } from '@/lib/stripe/api'
import { useAuth } from '@/lib/hooks/use-auth'
import {
  MCP_ANNUAL_USD,
  MCP_MONTHLY_USD,
  MCP_TRIAL_LIMITS,
  annualSavingsUsd,
  safeNextPath,
} from '@/lib/mcp/catalog'
import type { PricingPlan } from '@/lib/pricing/plan-display'

type Interval = 'year' | 'month'

export function McpPricingCard({ plan }: { plan: PricingPlan | null }) {
  const router = useRouter()
  const { isAuthenticated, loading } = useAuth()
  const [interval, setInterval] = useState<Interval>('year')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  const monthly = plan && plan.monthly_price > 0 ? plan.monthly_price : MCP_MONTHLY_USD
  const annual = plan?.annual_price && plan.annual_price > 0 ? plan.annual_price : MCP_ANNUAL_USD
  const savings = annualSavingsUsd(monthly, annual)
  const checkoutOpen = plan != null && plan.id > 0
  const shown = interval === 'year' ? annual : monthly
  const suffix = interval === 'year' ? '/year' : '/month'
  const monthlyEquivalent = interval === 'year' ? Math.round((annual / 12) * 100) / 100 : monthly

  const start = async () => {
    setError('')
    if (!checkoutOpen || !plan) {
      setError('Checkout is not open yet. The plan is not on the public catalog.')
      return
    }
    if (!isAuthenticated) {
      const next = safeNextPath('/mcp/pricing') || '/mcp/pricing'
      router.push(`/auth/login?next=${encodeURIComponent(next)}`)
      return
    }
    setPending(true)
    try {
      const origin = window.location.origin
      const session = await stripeAPI.createCheckoutSession({
        plan_id: plan.id,
        billing_interval: interval,
        success_url: `${origin}/dashboard/api-keys?mcp=connected`,
        cancel_url: `${origin}/mcp/pricing?canceled=1`,
      })
      if (!session.url || !session.url.startsWith('https://')) {
        throw new Error('Checkout did not return a Stripe URL.')
      }
      window.location.assign(session.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start checkout.')
      setPending(false)
    }
  }

  return (
    <div className="marketing-card mx-auto max-w-xl p-6 md:p-10">
      <p className="marketing-section-label">One plan</p>
      <h2 className="mt-2 font-display text-3xl text-ink">{plan?.name || 'MCP plan'}</h2>
      <p className="mt-3 text-ink-muted leading-relaxed">
        Search, portions, barcodes, and photos in Claude Code or Cursor.
      </p>
      <div className="mt-6 inline-flex rounded-brand border border-surface-border p-1" role="group" aria-label="Billing interval">
        <button
          type="button"
          className={interval === 'year' ? 'btn-brand h-10 px-4' : 'h-10 px-4 text-ink-muted'}
          aria-pressed={interval === 'year'}
          onClick={() => setInterval('year')}
        >
          Annual
        </button>
        <button
          type="button"
          className={interval === 'month' ? 'btn-brand h-10 px-4' : 'h-10 px-4 text-ink-muted'}
          aria-pressed={interval === 'month'}
          onClick={() => setInterval('month')}
        >
          Monthly
        </button>
      </div>
      <p className="mt-6 font-display text-5xl text-ink tabular-nums">
        ${shown}
        <span className="text-lg text-ink-muted">{suffix}</span>
      </p>
      {interval === 'year' && (
        <p className="mt-2 text-sm text-ink">
          ${monthlyEquivalent}/month, billed annually.
          {savings > 0 ? ` Save $${savings} versus paying monthly.` : ''}
        </p>
      )}
      <button
        type="button"
        className="btn-brand mt-6 h-12 w-full text-base"
        onClick={() => void start()}
        disabled={pending || loading || !checkoutOpen}
      >
        {pending ? 'Opening checkout' : 'Start 7-day trial'}
      </button>
      <p className="mt-2 text-center text-sm text-ink-muted">Card required. Cancel anytime.</p>
      {!checkoutOpen && (
        <p className="mt-3 text-sm text-ink-muted" role="status">
          Checkout is closed on this environment until the MCP plan is active. Prices shown are the
          published plan: ${MCP_MONTHLY_USD}/month or ${MCP_ANNUAL_USD}/year.
        </p>
      )}
      {error && (
        <p className="mt-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
      <ul className="mt-8 space-y-2 text-sm text-ink">
        <li>Trial: {MCP_TRIAL_LIMITS.perMinute}/min, {MCP_TRIAL_LIMITS.totalCalls} calls total, {MCP_TRIAL_LIMITS.results} results, {MCP_TRIAL_LIMITS.visionTotal} photos.</li>
        <li>Paid: 20/min, 10,000 calls/month, 25 results, 150 photos/month.</li>
        <li>MCP tools only. REST search, foods, calc, and vision stay blocked.</li>
        <li>Personal use. Commercial apps use a REST plan.</li>
      </ul>
      <p className="mt-6 text-sm text-ink-muted">
        Need the REST API instead?{' '}
        <Link href="/pricing" className="text-brand-strong underline">
          See API pricing
        </Link>
        . Commercial products:{' '}
        <Link href="/commercial-license" className="text-brand-strong underline">
          commercial license
        </Link>
        .
      </p>
    </div>
  )
}
