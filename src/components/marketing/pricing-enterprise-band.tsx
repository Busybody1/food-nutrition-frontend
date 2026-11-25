'use client'

import { Building2, CheckCircle } from 'lucide-react'
import type { PricingPlan } from '@/lib/pricing/plan-display'
import { formatPlanPrice, isMcpPlan } from '@/lib/pricing/plan-display'
import { PricingMcpExclusionNote } from '@/components/marketing/pricing-mcp-note'
import { MarketingIconDisc } from '@/components/marketing/marketing-shell'
import { cn } from '@/lib/utils/cn'

export function PricingEnterpriseBand({
  plan,
  isCurrent,
  onSelect,
}: {
  plan: PricingPlan
  isCurrent: boolean
  onSelect: () => void
}) {
  const { amount, suffix } = formatPlanPrice(plan)
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
            <MarketingIconDisc icon={Building2} tone="blue" />
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
          {plan.highlights.map((item) => (
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
            Image-to-calorie API and credits-based usage included.
          </p>
        </div>
      </div>
    </article>
  )
}
