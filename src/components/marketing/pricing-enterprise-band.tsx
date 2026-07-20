'use client'

import { Building2, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { PricingPlan } from '@/lib/pricing/plan-display'
import { formatPlanPrice } from '@/lib/pricing/plan-display'
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
  const ctaLabel = isCurrent ? 'Current plan' : 'Contact Sales'

  return (
    <article
      className={cn(
        'relative overflow-hidden rounded-brand border border-brand/40 bg-gradient-to-br from-brand-muted/50 via-white to-white p-6 shadow-glow md:p-8',
        'motion-safe:hover:-translate-y-0.5 transition-all duration-200'
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand/10 blur-2xl"
      />
      <div className="relative grid gap-8 lg:grid-cols-[1.1fr_1.4fr_auto] lg:items-center">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-brand bg-brand-muted">
              <Building2 className="h-5 w-5 text-brand-strong" aria-hidden />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-strong">
                Enterprise
              </p>
              <h3 className="text-xl font-semibold text-ink">{plan.name}</h3>
            </div>
          </div>
          <div className="mb-2 flex items-baseline gap-1">
            <span className="font-display text-4xl leading-none tracking-tight text-ink">
              {amount}
            </span>
            {suffix ? <span className="text-sm font-medium text-ink-muted">{suffix}</span> : null}
          </div>
          <p className="text-sm text-ink-muted leading-snug max-w-md">{plan.description}</p>
        </div>

        <ul className="grid gap-2 sm:grid-cols-2">
          {plan.highlights.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-ink-muted">
              <CheckCircle className="h-4 w-4 text-brand shrink-0 mt-0.5" aria-hidden />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-2 lg:min-w-[180px]">
          <Button
            className="h-11 w-full font-semibold bg-gradient-to-r from-brand to-brand-strong shadow-glow hover:shadow-glow-lg cursor-pointer"
            onClick={onSelect}
            disabled={isCurrent}
            aria-label={`${ctaLabel} — ${plan.name} plan`}
          >
            {ctaLabel}
          </Button>
          <p className="text-xs text-ink-muted text-center lg:text-left">
            Image-to-calorie API and credits-based usage included.
          </p>
        </div>
      </div>
    </article>
  )
}
