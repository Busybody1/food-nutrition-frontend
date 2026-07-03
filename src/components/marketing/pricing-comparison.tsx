'use client'

import { Fragment } from 'react'
import { Check } from 'lucide-react'
import { MarketingSectionHeader } from '@/components/marketing/marketing-shell'
import { Reveal } from '@/components/marketing/reveal'
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
      <>
        <Check className="h-4 w-4 text-brand-strong mx-auto" aria-hidden />
        <span className="sr-only">Included</span>
      </>
    ) : (
      <>
        <span className="text-ink-muted text-sm" aria-hidden>
          -
        </span>
        <span className="sr-only">Not included</span>
      </>
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

/**
 * Sticky first column needs opaque backgrounds; these are the flattened
 * (over-white) equivalents of bg-brand-muted/50 and bg-surface-elevated/50.
 */
const STICKY_HEAD_BG = 'bg-[#F4FDFE]'
const STICKY_ZEBRA_BG = 'bg-[#FBFDFE]'
const STICKY_EDGE_SHADOW = 'max-lg:shadow-[inset_-8px_0_8px_-8px_rgba(0,0,0,0.08)]'

export function PricingComparison({ plans }: { plans: PricingPlan[] }) {
  if (plans.length === 0) return null

  let lastSection: CompareRow['section'] | undefined

  return (
    <section className="section-pad bg-surface-elevated" aria-labelledby="compare-plans-heading">
      <div className="container-narrow">
        <Reveal>
          <MarketingSectionHeader
            id="compare-plans-heading"
            title="Compare plans"
            description="All paid tiers include DDoS-oriented per-account rate limits, monthly quotas, and a 5% distinct-food cap. Commercial apps need Plus or Enterprise."
          />
        </Reveal>

        <Reveal delay={120}>
          <div className="relative">
            <div className="overflow-x-auto max-w-full rounded-brand border border-surface-border/80 bg-white shadow-glass [-webkit-overflow-scrolling:touch]">
              {/* border-separate (not collapse) so the sticky row headers keep working while scrolling. */}
              <table className="w-full min-w-[720px] text-left border-separate border-spacing-0">
                <thead>
                  <tr className="bg-brand-muted/50">
                    <th
                      scope="col"
                      className={cn(
                        'sticky left-0 z-20 w-[26%] border-b border-surface-border py-4 pl-5 pr-4 text-xs font-semibold uppercase tracking-wider text-ink-muted',
                        STICKY_HEAD_BG,
                        STICKY_EDGE_SHADOW
                      )}
                    >
                      Feature
                    </th>
                    {plans.map((plan) => (
                      <th
                        key={plan.id}
                        scope="col"
                        className={cn(
                          'border-b border-surface-border py-4 px-3 text-center text-xs font-semibold uppercase tracking-wider min-w-[88px]',
                          plan.name === 'Plus'
                            ? 'border-t-2 border-t-brand bg-brand-muted text-brand-strong'
                            : 'text-ink-muted'
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
                    const zebra = rowIndex % 2 === 1
                    const isLastRow = rowIndex === COMPARE_ROWS.length - 1
                    const cellBorder = isLastRow ? '' : 'border-b border-surface-border/60'
                    return (
                      <Fragment key={row.feature}>
                        {showSection && (
                          <tr className="bg-surface-elevated/70">
                            <td
                              colSpan={plans.length + 1}
                              className="border-b border-surface-border/60 py-2 pl-5 pr-4 text-xs font-semibold uppercase tracking-wider text-ink-muted"
                            >
                              {/* Sticky label so section names stay readable mid horizontal scroll. */}
                              <span className="sticky left-5 inline-block">
                                {sectionLabel(row.section)}
                              </span>
                            </td>
                          </tr>
                        )}
                        <tr className={zebra ? 'bg-surface-elevated/50' : 'bg-white'}>
                          <th
                            scope="row"
                            className={cn(
                              'sticky left-0 z-10 py-3.5 pl-5 pr-4 text-sm font-medium text-ink text-left',
                              cellBorder,
                              zebra ? STICKY_ZEBRA_BG : 'bg-white',
                              STICKY_EDGE_SHADOW
                            )}
                          >
                            {row.feature}
                          </th>
                          {plans.map((plan) => (
                            <td
                              key={`${plan.id}-${row.feature}`}
                              className={cn(
                                'py-3.5 px-3 text-center',
                                cellBorder,
                                plan.name === 'Plus' && 'bg-brand-muted/20'
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
            {/* Mobile affordance: the table continues past the right edge. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 right-0 w-12 rounded-r-brand bg-gradient-to-l from-white lg:hidden"
            />
          </div>
        </Reveal>

        <Reveal delay={160}>
          <ul className="mt-8 space-y-2 text-sm text-ink-muted list-disc pl-5 max-w-3xl">
            {PRICING_FOOTNOTES.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}
