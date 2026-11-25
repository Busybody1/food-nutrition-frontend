'use client'

import { CheckCircle } from 'lucide-react'
import { BuildingsIcon, CrownIcon, LightningIcon, ShieldIcon, StarIcon } from '@phosphor-icons/react/ssr'
import type { MarketingIcon } from '@/components/marketing/marketing-shell'
import type { PricingPlan } from '@/lib/pricing/plan-display'
import {
  formatPlanPrice,
  formatResultsPerQuery,
  allowsCommercialUse,
  isEnterprisePlan,
  isMcpPlan,
} from '@/lib/pricing/plan-display'
import { PricingMcpExclusionNote } from '@/components/marketing/pricing-mcp-note'
import { MarketingIconDisc, type DiscTone } from '@/components/marketing/marketing-shell'
import { cn } from '@/lib/utils/cn'

const PLAN_ICON: Record<string, { icon: MarketingIcon; tone: DiscTone }> = {
  free: { icon: ShieldIcon, tone: 'green' },
  basic: { icon: LightningIcon, tone: 'blue' },
  core: { icon: StarIcon, tone: 'violet' },
  plus: { icon: CrownIcon, tone: 'coral' },
  enterprise: { icon: BuildingsIcon, tone: 'blue' },
  custom: { icon: BuildingsIcon, tone: 'blue' },
}

function PlanIcon({ name }: { name: string }) {
  const entry = PLAN_ICON[name.toLowerCase()] ?? PLAN_ICON.free
  return <MarketingIconDisc icon={entry.icon} tone={entry.tone} />
}

export function PricingCard({
  plan,
  isCurrent,
  isPopular,
  emphasized,
  dense,
  subscribeLabel,
  subscribeDisabled,
  onSelect,
}: {
  plan: PricingPlan
  isCurrent: boolean
  isPopular?: boolean
  emphasized?: boolean

  dense?: boolean
  subscribeLabel?: string | null
  subscribeDisabled?: boolean
  onSelect: () => void
}) {
  const { amount, suffix } = formatPlanPrice(plan)
  const commercial = allowsCommercialUse(plan.name)
  const foodsLine = `${formatResultsPerQuery(plan.max_results_per_query)} per query`
  const checklist = [
    ...plan.highlights.filter((item) => !/per query/i.test(item)),
    foodsLine,
  ]

  const ctaLabel = isCurrent
    ? 'Current plan'
    : plan.name === 'Free'
      ? 'Get started free'
      : isEnterprisePlan(plan.name)
        ? 'Schedule a call'
        : subscribeLabel || 'Subscribe'

  const highlighted = emphasized ?? (isPopular === true || isCurrent)

  return (
    <article
      className={cn(
        'relative flex h-full w-full flex-col rounded-[22px] border border-mk-hair bg-white transition-[box-shadow,transform] duration-200',
        dense ? 'p-6 xl:p-5' : 'p-6',
        highlighted
          ? 'shadow-card-strong motion-safe:hover:-translate-y-0.5'
          : 'shadow-card hover:shadow-card-lift motion-safe:hover:-translate-y-0.5'
      )}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex h-6 items-center whitespace-nowrap rounded-full bg-brand px-2.5 text-xs font-medium text-mk-ink">
            Most popular
          </span>
        </div>
      )}

      <div className="mb-3 flex items-center gap-2.5">
        <PlanIcon name={plan.name} />
        <h3 className="text-lg font-semibold tracking-[-0.01em] text-mk-ink">{plan.name}</h3>
      </div>

      <div className="mb-3 flex min-h-6 items-center">
        {commercial && (
          <span className="inline-flex items-center rounded-full border border-mk-line bg-mk-stage px-2 py-0.5 text-xs font-medium text-mk-ink">
            Commercial
          </span>
        )}
      </div>

      <div className="mb-1 flex items-baseline gap-1">
        <span className="text-4xl font-semibold leading-none tracking-[-0.03em] text-mk-ink tabular-nums">
          {amount}
        </span>
        {suffix ? <span className="text-sm font-medium text-mk-muted">{suffix}</span> : null}
      </div>
      <p className="mb-5 min-h-[3.75rem] text-sm leading-snug text-mk-muted">{plan.description}</p>

      <ul className="mb-6 flex-1 space-y-2">
        {checklist.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm text-mk-muted">
            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-mk-green" aria-hidden />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      {!isMcpPlan(plan) && (
        <PricingMcpExclusionNote className="mb-4 border-t border-mk-hair pt-4" />
      )}

      <button
        type="button"
        className={cn(highlighted ? 'btn-brand' : 'btn-brand-outline', 'w-full')}
        onClick={onSelect}
        disabled={isCurrent || subscribeDisabled === true}
        aria-label={`${ctaLabel} — ${plan.name} plan`}
      >
        {ctaLabel}
      </button>
    </article>
  )
}
