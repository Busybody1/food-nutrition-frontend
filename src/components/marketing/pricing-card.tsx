'use client'

import { Button } from '@/components/ui/button'
import {
  CheckCircle,
  Zap,
  Shield,
  Star,
  Crown,
  Building2,
  Gauge,
  Calendar,
} from 'lucide-react'
import type { PricingPlan } from '@/lib/pricing/plan-display'
import {
  formatPlanPrice,
  formatQuota,
  formatRateLimit,
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
  onSelect,
}: {
  plan: PricingPlan
  isCurrent: boolean
  isPopular?: boolean
  onSelect: () => void
}) {
  const { amount, suffix } = formatPlanPrice(plan)
  const commercial = allowsCommercialUse(plan.name)

  const ctaLabel = isCurrent
    ? 'Current plan'
    : plan.name === 'Free'
      ? 'Get started free'
      : isEnterprisePlan(plan.name)
        ? 'Contact Sales'
        : 'Subscribe'

  return (
    <article
      className={cn(
        'relative flex w-full flex-col rounded-brand border bg-white p-6 shadow-glass transition-shadow hover:shadow-glass-lg',
        isPopular ? 'border-brand/40 ring-1 ring-brand/10' : 'border-surface-border/80'
      )}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="marketing-hero-badge shadow-sm whitespace-nowrap">Most popular</span>
        </div>
      )}

      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-brand bg-brand-muted">
            <PlanIcon name={plan.name} />
          </div>
          <h3 className="text-lg font-semibold text-ink">{plan.name}</h3>
        </div>
        {commercial && (
          <span className="text-[10px] font-semibold uppercase tracking-wide text-brand-strong bg-brand-muted px-2 py-0.5 rounded-full">
            Commercial
          </span>
        )}
      </div>

      <div className="mb-1">
        <span className="text-3xl font-semibold tracking-tight text-ink tabular-nums">
          {amount}
        </span>
        {suffix ? <span className="text-sm text-ink-dim">{suffix}</span> : null}
      </div>
      <p className="text-sm text-ink-muted mb-4 min-h-[2.5rem] leading-snug">{plan.description}</p>

      <div className="grid grid-cols-2 gap-2 mb-5 rounded-brand bg-surface-elevated/80 border border-surface-border/60 p-3">
        <div className="flex gap-2">
          <Calendar className="h-4 w-4 text-brand shrink-0 mt-0.5" aria-hidden />
          <div>
            <p className="text-[10px] uppercase tracking-wide text-ink-dim font-medium">Monthly</p>
            <p className="text-sm font-semibold text-ink tabular-nums">
              {formatQuota(plan.monthly_quota)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Gauge className="h-4 w-4 text-brand shrink-0 mt-0.5" aria-hidden />
          <div>
            <p className="text-[10px] uppercase tracking-wide text-ink-dim font-medium">Rate limit</p>
            <p className="text-sm font-semibold text-ink tabular-nums">
              {formatRateLimit(plan.rate_limit_per_minute)}
            </p>
          </div>
        </div>
      </div>

      <ul className="space-y-2 mb-6 flex-1">
        {plan.highlights.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm text-ink-muted">
            <CheckCircle className="h-4 w-4 text-brand shrink-0 mt-0.5" aria-hidden />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <Button
        variant={plan.name === 'Free' ? 'outline' : 'default'}
        className="w-full"
        onClick={onSelect}
        disabled={isCurrent}
      >
        {ctaLabel}
      </Button>
    </article>
  )
}
