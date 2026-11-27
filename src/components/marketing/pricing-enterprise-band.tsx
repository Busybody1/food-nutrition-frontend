'use client'

import { CheckCircle } from 'lucide-react'
import { BuildingsIcon } from '@phosphor-icons/react/ssr'
import type { PricingPlan } from '@/lib/pricing/plan-display'
import { isMcpPlan } from '@/lib/pricing/plan-display'
import {
  DEFAULT_ENTERPRISE_PRICING,
  enterpriseHighlights,
  fromPriceLabel,
  overageLines,
  tierTableRows,
  type EnterprisePricing,
} from '@/lib/enterprise/model'
import { PricingMcpExclusionNote } from '@/components/marketing/pricing-mcp-note'
import { MarketingIconDisc } from '@/components/marketing/marketing-shell'
import { cn } from '@/lib/utils/cn'

export function PricingEnterpriseBand({
  plan,
  isCurrent,
  onSelect,
  pricing = DEFAULT_ENTERPRISE_PRICING,
}: {
  plan: PricingPlan
  isCurrent: boolean
  onSelect: () => void
  pricing?: EnterprisePricing
}) {
  const amount = fromPriceLabel(pricing)
  const suffix = '/mo'
  const highlights = enterpriseHighlights(pricing)
  const rows = tierTableRows(pricing)
  const overages = overageLines(pricing)
  const ctaLabel = isCurrent ? 'Current plan' : 'Schedule a call'

  return (
    <article
      className={cn(
        'relative rounded-[22px] border border-mk-hair bg-white p-6 md:p-8',
        isCurrent ? 'shadow-card-strong' : 'shadow-card'
      )}
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_16rem] lg:items-center">
        <div>
          <div className="mb-3 flex items-center gap-2.5">
            <MarketingIconDisc icon={BuildingsIcon} tone="blue" />
            <div>
              <p className="text-xs font-medium text-mk-muted">Enterprise</p>
              <h3 className="text-xl font-semibold tracking-[-0.01em] text-mk-ink">{plan.name}</h3>
            </div>
          </div>
          <div className="mb-2 flex items-baseline gap-1">
            <span className="text-4xl font-semibold leading-none tracking-[-0.03em] text-mk-ink tabular-nums">
              {amount}
            </span>
            {suffix ? <span className="text-sm font-medium text-mk-muted">{suffix}</span> : null}
          </div>
          <p className="max-w-md text-sm leading-snug text-mk-muted">{plan.description}</p>
        </div>

        <ul className="grid gap-2 sm:grid-cols-2">
          {highlights.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-mk-muted">
              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-mk-green" aria-hidden />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-2">
          {!isMcpPlan(plan) && <PricingMcpExclusionNote className="mb-2" />}
          <button
            type="button"
            className={cn(isCurrent ? 'btn-brand' : 'btn-brand-outline', 'w-full')}
            onClick={onSelect}
            disabled={isCurrent}
            aria-label={`${ctaLabel} — ${plan.name} plan`}
          >
            {ctaLabel}
          </button>
          <p className="text-center text-xs text-mk-muted lg:text-left">
            Photo-to-calorie API included. Billed monthly on what you use.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 border-t border-mk-hair pt-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="min-w-0 overflow-x-auto">
          <table className="w-full min-w-[460px] text-left text-sm">
            <caption className="sr-only">Enterprise tiers</caption>
            <thead>
              <tr className="text-xs font-medium text-mk-muted">
                <th scope="col" className="pb-2 pr-4 font-medium">Monthly users</th>
                <th scope="col" className="pb-2 pr-4 font-medium">Price</th>
                <th scope="col" className="pb-2 pr-4 font-medium">Calls included</th>
                <th scope="col" className="pb-2 font-medium">Photos</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.users} className="border-t border-mk-hair">
                  <th scope="row" className="py-2.5 pr-4 font-medium text-mk-ink">{row.users}</th>
                  <td className="whitespace-nowrap py-2.5 pr-4 tabular-nums text-mk-ink">{row.price}</td>
                  <td className="whitespace-nowrap py-2.5 pr-4 tabular-nums text-mk-muted">{row.calls}</td>
                  <td className="whitespace-nowrap py-2.5 tabular-nums text-mk-muted">{row.photos}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className="space-y-2 text-sm text-mk-muted">
          {overages.map((line) => (
            <li key={line} className="flex items-start gap-2">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brand" aria-hidden />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  )
}
