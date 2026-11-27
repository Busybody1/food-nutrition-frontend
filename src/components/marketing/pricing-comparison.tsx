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
import { DEFAULT_ENTERPRISE_PRICING, type EnterprisePricing } from '@/lib/enterprise/model'
import { cn } from '@/lib/utils/cn'

function CompareCellValue({ value }: { value: boolean | string }) {
  if (typeof value === 'boolean') {
    return value ? (
      <>
        <Check className="h-4 w-4 text-mk-green mx-auto" aria-hidden />
        <span className="sr-only">Included</span>
      </>
    ) : (
      <>
        <span className="text-mk-muted text-sm" aria-hidden>
          -
        </span>
        <span className="sr-only">Not included</span>
      </>
    )
  }
  return <span className="text-sm text-mk-ink font-medium tabular-nums">{value}</span>
}

const SECTION_LABELS: Record<NonNullable<CompareRow['section']>, string> = {
  limits: 'Limits',
  features: 'Features',
  support: 'Support & enterprise',
}

function sectionLabel(section: CompareRow['section']): string | null {
  if (!section) return null
  return SECTION_LABELS[section]
}

const STICKY_HEAD_BG = 'bg-mk-stage'
const STICKY_ZEBRA_BG = 'bg-[#FBFBFC]'
const STICKY_EDGE_SHADOW = 'max-lg:shadow-[inset_-8px_0_8px_-8px_rgba(0,0,0,0.08)]'

export function PricingComparison({
  plans,
  enterprisePricing = DEFAULT_ENTERPRISE_PRICING,
}: {
  plans: PricingPlan[]
  enterprisePricing?: EnterprisePricing
}) {
  if (plans.length === 0) return null
  const context = { enterprise: enterprisePricing }

  let lastSection: CompareRow['section'] | undefined

  return (
    <section className="marketing-sheet-wrap" aria-labelledby="compare-plans-heading">
      <div className="marketing-sheet marketing-sheet-pad">
        <div className="container-narrow">
          <Reveal>
            <MarketingSectionHeader
              id="compare-plans-heading"
              title="Compare plans"
              description="All paid tiers include per-account rate limits, monthly quotas, and a foods-per-query cap. Commercial apps need Plus or Enterprise. Enterprise is priced by monthly users, from $150, with photo scans included."
            />
          </Reveal>

          <Reveal delay={120}>
            <div className="relative">
              <div className="overflow-x-auto max-w-full rounded-[22px] border border-mk-hair bg-white shadow-card [-webkit-overflow-scrolling:touch]">
                {}
                <table className="w-full min-w-[720px] text-left border-separate border-spacing-0">
                  <thead>
                    <tr className="bg-mk-stage">
                      <th
                        scope="col"
                        className={cn(
                          'sticky left-0 z-20 w-[26%] border-b border-mk-hair py-4 pl-5 pr-4 text-sm font-semibold text-mk-ink',
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
                            'border-b border-mk-hair py-4 px-3 text-center text-sm font-semibold min-w-[88px]',
                            plan.is_recommended ? 'bg-mk-hair/60 text-mk-ink' : 'text-mk-ink'
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
                      /* eslint-disable-next-line react-hooks/immutability */
                      if (row.section) lastSection = row.section
                      const zebra = rowIndex % 2 === 1
                      const isLastRow = rowIndex === COMPARE_ROWS.length - 1
                      const cellBorder = isLastRow ? '' : 'border-b border-mk-hair'
                      return (
                        <Fragment key={row.feature}>
                          {showSection && (
                            <tr className="bg-white">
                              <td
                                colSpan={plans.length + 1}
                                className="border-b border-mk-hair pb-2 pl-5 pr-4 pt-5 text-xs font-medium text-mk-muted"
                              >
                                {}
                                <span className="sticky left-5 inline-block">
                                  {sectionLabel(row.section)}
                                </span>
                              </td>
                            </tr>
                          )}
                          <tr className={zebra ? 'bg-[#FBFBFC]' : 'bg-white'}>
                            <th
                              scope="row"
                              className={cn(
                                'sticky left-0 z-10 py-3.5 pl-5 pr-4 text-sm font-medium text-mk-ink text-left',
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
                                  plan.is_recommended && 'bg-mk-stage/70'
                                )}
                              >
                                <CompareCellValue value={row.getValue(plan, context)} />
                              </td>
                            ))}
                          </tr>
                        </Fragment>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              {}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-y-px right-px w-10 rounded-r-[22px] bg-gradient-to-l from-white lg:hidden"
              />
            </div>
          </Reveal>

          <Reveal delay={160}>
            <ul className="mt-8 space-y-2 text-sm text-mk-muted list-disc pl-5 max-w-3xl">
              {PRICING_FOOTNOTES.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
