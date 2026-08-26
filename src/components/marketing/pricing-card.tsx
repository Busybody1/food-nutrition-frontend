'use client'

import { Button } from '@/components/ui/button'
import {
  CheckCircle,
  Zap,
  Shield,
  Star,
  Crown,
  Building2,
} from 'lucide-react'
import type { PricingPlan } from '@/lib/pricing/plan-display'
import {
  formatPlanPrice,
  formatResultsPerQuery,
  allowsCommercialUse,
  isEnterprisePlan,
} from '@/lib/pricing/plan-display'
import { cn } from '@/lib/utils/cn'

function PlanIcon({ name }: { name: string }) {
  const iconClass = 'h-5 w-5 text-brand-strong'
  switch (name.toLowerCase()) {
    case 'free':
      return <Shield className={iconClass} />
    case 'basic':
      return <Zap className={iconClass} />
    case 'core':
      return <Star className={iconClass} />
    case 'plus':
      return <Crown className={iconClass} />
    case 'enterprise':
    case 'custom':
      return <Building2 className={iconClass} />
    default:
      return <Shield className={iconClass} />
  }
}

export function PricingCard({
  plan,
  isCurrent,
  isPopular,
  dense,
  onSelect,
}: {
  plan: PricingPlan
  isCurrent: boolean
  isPopular?: boolean
  /** Tightens intra-card layout when five tiers share one row at xl. */
  dense?: boolean
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
        : 'Subscribe'

  return (
    <article
      className={cn(
        'relative flex h-full w-full flex-col rounded-brand border bg-white transition-all duration-200',
        dense ? 'p-6 xl:p-5' : 'p-6',
        isPopular
          ? // Featured tier: brand hairline, warm tint, glow, and a resting lift at lg+.
            'border-brand/50 bg-gradient-to-b from-brand-muted/40 via-white to-white shadow-glow hover:shadow-glow-lg motion-safe:hover:-translate-y-0.5 lg:-translate-y-1.5 motion-safe:lg:hover:-translate-y-2 before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-[3px] before:rounded-t-brand before:bg-gradient-to-r before:from-brand/60 before:via-brand before:to-brand-soft before:content-[""]'
          : 'border-surface-border/80 shadow-glass hover:border-brand/30 hover:shadow-glass-lg motion-safe:hover:-translate-y-0.5'
      )}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="marketing-hero-badge shadow-sm whitespace-nowrap">Most popular</span>
        </div>
      )}

      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-brand bg-brand-muted">
          <PlanIcon name={plan.name} />
        </div>
        <h3 className="text-lg font-semibold text-ink">{plan.name}</h3>
      </div>

      {/* Reserved line on every card so prices baseline-align across the row. */}
      <div className="mb-3 flex min-h-6 items-center">
        {commercial && (
          <span className="inline-flex items-center rounded-full bg-brand-muted px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-brand-strong">
            Commercial
          </span>
        )}
      </div>

      <div className="mb-1 flex items-baseline gap-1">
        <span className="font-display text-4xl leading-none tracking-tight text-ink tabular-nums">
          {amount}
        </span>
        {suffix ? <span className="text-sm font-medium text-ink-muted">{suffix}</span> : null}
      </div>
      <p className="text-sm text-ink-muted mb-5 min-h-[3.75rem] leading-snug">{plan.description}</p>

      <ul className="space-y-2 mb-6 flex-1">
        {checklist.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm text-ink-muted">
            <CheckCircle className="h-4 w-4 text-brand shrink-0 mt-0.5" aria-hidden />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <Button
        variant={isPopular ? 'default' : 'outline'}
        className={cn(
          'w-full cursor-pointer',
          isPopular &&
            'h-11 font-semibold bg-brand text-white shadow-glow hover:bg-brand-strong hover:text-white hover:shadow-glow-lg'
        )}
        onClick={onSelect}
        disabled={isCurrent}
        aria-label={`${ctaLabel} — ${plan.name} plan`}
      >
        {ctaLabel}
      </Button>
    </article>
  )
}
