'use client'

import { Fragment } from 'react'
import { Check } from 'lucide-react'
import {
  COMPARE_ROWS,
  PRICING_FOOTNOTES,
  type PricingPlan,
  type CompareRow,
} from '@/lib/pricing/plan-display'
import { cn } from '@/lib/utils/cn'

function CompareCellValue({ value }: { value: boolean | string }) {
  if (typeof value === 'boolean') {
    return value ? (
      <Check className="h-4 w-4 text-brand-strong mx-auto" aria-label="Included" />
    ) : (
      <span className="text-ink-dim text-sm" aria-label="Not included">
        —
      </span>
    )
  }
  return <span className="text-sm text-ink font-medium tabular-nums">{value}</span>
}

const SECTION_LABELS: Record<NonNullable<CompareRow['section']>, string> = {
  limits: 'Limits & protection',
  features: 'Features',
  support: 'Support & enterprise',
}

function sectionLabel(section: CompareRow['section']): string | null {
  if (!section) return null
  return SECTION_LABELS[section]
}

export function PricingComparison({ plans }: { plans: PricingPlan[] }) {
  if (plans.length === 0) return null

  let lastSection: CompareRow['section'] | undefined

  return (
    <section className="section-pad border-t border-surface-border/60 bg-white">
      <div className="container-narrow">
        <div className="max-w-2xl mb-8">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl text-ink mb-3">Compare plans</h2>
          <p className="text-ink-muted text-sm leading-relaxed">
            All paid tiers include DDoS-oriented per-account rate limits, monthly quotas, and a
            5% distinct-food cap. Commercial apps need Plus or Enterprise.
          </p>
        </div>

        <div className="overflow-x-auto max-w-full rounded-brand border border-surface-border/80 bg-white shadow-glass [-webkit-overflow-scrolling:touch]">
          <table className="w-full min-w-[720px] text-left border-collapse">
            <thead>
              <tr className="bg-surface-elevated border-b border-surface-border">
                <th
                  scope="col"
                  className="py-4 pl-5 pr-4 text-xs font-semibold uppercase tracking-wider text-ink-dim w-[26%]"
                >
                  Feature
                </th>
                {plans.map((plan) => (
                  <th
                    key={plan.id}
                    scope="col"
                    className={cn(
                      'py-4 px-3 text-center text-xs font-semibold uppercase tracking-wider min-w-[88px]',
                      plan.name === 'Plus'
                        ? 'text-brand-strong bg-brand-muted/30'
                        : 'text-ink-dim'
                    )}
                  >
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE_ROWS.map((row, rowIndex) => {
                const showSection = row.section && row.section !== lastSection
                if (row.section) lastSection = row.section
                return (
                  <Fragment key={row.feature}>
                    {showSection && (
                      <tr className="bg-surface-elevated/70">
                        <td
                          colSpan={plans.length + 1}
                          className="py-2 pl-5 text-xs font-semibold uppercase tracking-wider text-ink-dim"
                        >
                          {sectionLabel(row.section)}
                        </td>
                      </tr>
                    )}
                    <tr
                      className={cn(
                        'border-b border-surface-border/60 last:border-0',
                        rowIndex % 2 === 1 ? 'bg-surface-elevated/40' : 'bg-white'
                      )}
                    >
                      <th
                        scope="row"
                        className="py-3.5 pl-5 pr-4 text-sm font-medium text-ink text-left"
                      >
                        {row.feature}
                      </th>
                      {plans.map((plan) => (
                        <td
                          key={`${plan.id}-${row.feature}`}
                          className={cn(
                            'py-3.5 px-3 text-center',
                            plan.name === 'Plus' && 'bg-brand-muted/10'
                          )}
                        >
                          <CompareCellValue value={row.getValue(plan)} />
                        </td>
                      ))}
                    </tr>
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>

        <ul className="mt-8 space-y-2 text-sm text-ink-muted list-disc pl-5 max-w-3xl">
          {PRICING_FOOTNOTES.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </div>
    </section>
  )
}
