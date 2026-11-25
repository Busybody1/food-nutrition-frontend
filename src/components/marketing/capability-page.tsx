import Link from 'next/link'
import {
  allowsCommercialUse,
  formatPlanPrice,
  formatQuota,
  formatRateLimit,
  isEnterprisePlan,
  type PricingPlan,
} from '@/lib/pricing/plan-display'
import { BarcodeIcon, ChartBarIcon, CodeIcon, DatabaseIcon, ForkKnifeIcon, HeartbeatIcon, LightningIcon, MagnifyingGlassIcon, ShieldIcon } from '@phosphor-icons/react/ssr'
import type { MarketingIcon } from '@/components/marketing/marketing-shell'
import {
  MarketingCtaBand,
  MarketingFeatureGrid,
  MarketingSectionHeader,
  MarketingStatStrip,
} from '@/components/marketing/marketing-shell'
import { MarketingSheet, MarketingSheetHero, MarketingSplit } from '@/components/marketing/marketing-sheet'
import { FaqList } from '@/components/marketing/faq-section'
import { CapabilityCodeWindow } from '@/components/marketing/capability-code-window'
import { Testimonials } from '@/components/marketing/testimonials'
import { Reveal } from '@/components/marketing/reveal'
import { TrackedCtaLink } from '@/components/analytics/tracked-cta-link'
import { JsonLdScript } from '@/components/seo/structured-data'
import {
  buildBreadcrumbJsonLd,
  buildWebPageJsonLd,
} from '@/lib/seo-jsonld'
import { buildFaqPageJsonLd } from '@/lib/faq-data'
import { capabilityPath, type CapabilityPage } from '@/lib/capability-pages-data'
import { RelatedResources } from '@/components/seo/related-resources'

const FEATURE_ICONS: Record<CapabilityPage['features'][number]['icon'], MarketingIcon> = {
  search: MagnifyingGlassIcon,
  database: DatabaseIcon,
  zap: LightningIcon,
  shield: ShieldIcon,
  chart: ChartBarIcon,
  code: CodeIcon,
  scan: BarcodeIcon,
  utensils: ForkKnifeIcon,
  heart: HeartbeatIcon,
}

const INLINE_LINK_CLASS =
  'text-brand-strong font-medium underline decoration-brand/40 underline-offset-2 ' +
  'hover:decoration-brand-strong rounded-sm focus-visible:outline-none ' +
  'focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2'

function planQuotaLabel(plan: PricingPlan): string {
  if (isEnterprisePlan(plan.name)) return 'Custom'
  return formatQuota(plan.monthly_quota)
}

function orderedPlans(plans: PricingPlan[]): PricingPlan[] {
  return [...plans].sort((left, right) => {
    const leftEnterprise = isEnterprisePlan(left.name) ? 1 : 0
    const rightEnterprise = isEnterprisePlan(right.name) ? 1 : 0
    if (leftEnterprise !== rightEnterprise) return leftEnterprise - rightEnterprise
    return left.monthly_price - right.monthly_price
  })
}

export function CapabilityPageView({
  page,
  plans = [],
}: {
  page: CapabilityPage
  plans?: PricingPlan[]
}) {
  const path = capabilityPath(page.slug)

  return (
    <div className="marketing-page">
      <JsonLdScript
        id={`webpage-${page.slug}`}
        data={buildWebPageJsonLd({
          name: page.h1,
          description: page.heroCopy[0],
          path,
          speakable: true,
        })}
      />
      <JsonLdScript
        id={`breadcrumb-${page.slug}`}
        data={buildBreadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: page.h1, path },
        ])}
      />
      <JsonLdScript id={`faq-${page.slug}`} data={buildFaqPageJsonLd(page.faqs)} />

      <MarketingSheetHero
        badge={page.heroBadge}
        title={page.h1}
        lead={page.heroCopy[0]}
        leadClassName="aeo-answer"
        actions={
          <>
            <TrackedCtaLink href="/auth/register" eventLabel="Get started free" className="btn-brand">
              Get started free
            </TrackedCtaLink>
            <TrackedCtaLink href="/pricing" eventLabel="View pricing" className="btn-brand-outline">
              View pricing
            </TrackedCtaLink>
          </>
        }
      />

      <section className="py-10 md:py-14" aria-label="Platform stats">
        <div className="container-narrow">
          <Reveal>
            <MarketingStatStrip stats={page.stats} />
          </Reveal>
        </div>
      </section>

      <MarketingSheet aria-labelledby={`capability-features-${page.slug}`}>
        <div className="container-narrow">
          <Reveal>
            <MarketingSectionHeader
              id={`capability-features-${page.slug}`}
              title={`What the ${page.h1} gives you`}
            />
          </Reveal>
          <MarketingFeatureGrid
            items={page.features.map((feature) => ({
              icon: FEATURE_ICONS[feature.icon],
              title: feature.title,
              description: feature.description,
            }))}
          />
        </div>
      </MarketingSheet>

      <MarketingSheet>
        <div className="container-narrow">
          <MarketingSplit
            copy={
              <Reveal className="marketing-body max-w-xl space-y-4">
                {page.heroCopy.slice(1).map((paragraph) => (
                  <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                ))}
                {page.slug === 'food-database-api' ? (
                  <p>
                    Field lists are in the{' '}
                    <Link href="/docs/food-search" prefetch={false} className={INLINE_LINK_CLASS}>
                      food search API reference
                    </Link>
                    . Monthly quotas and per-minute caps are on{' '}
                    <Link href="/pricing" prefetch={false} className={INLINE_LINK_CLASS}>
                      pricing
                    </Link>
                    , and 429 and 402 behavior is in{' '}
                    <Link href="/docs/rate-limits" prefetch={false} className={INLINE_LINK_CLASS}>
                      rate limits
                    </Link>
                    . Try search in the{' '}
                    <Link href="/playground" prefetch={false} className={INLINE_LINK_CLASS}>
                      playground
                    </Link>{' '}
                    without signing up.
                  </p>
                ) : (
                  <p>
                    Full parameters and response shapes live in the{' '}
                    <Link href="/docs" prefetch={false} className={INLINE_LINK_CLASS}>
                      API documentation
                    </Link>
                    , and you can try every endpoint in the{' '}
                    <Link href="/playground" prefetch={false} className={INLINE_LINK_CLASS}>
                      playground
                    </Link>{' '}
                    without signing up.
                  </p>
                )}
              </Reveal>
            }
            aside={
              <Reveal delay={120} className="min-w-0">
                <div className="marketing-callout p-3 sm:p-6 md:p-8">
                  <CapabilityCodeWindow title={page.codeSample.title} code={page.codeSample.code} />
                </div>
              </Reveal>
            }
          />
        </div>
      </MarketingSheet>

      {page.slug === 'food-database-api' && plans.length > 0 && (
        <MarketingSheet aria-labelledby="food-database-plans">
          <div className="container-narrow">
            <Reveal>
              <MarketingSectionHeader
                id="food-database-plans"
                align="left"
                title="Live plan quotas"
                description="Loaded from the public plans API. Limits apply per account, not per IP."
              />
            </Reveal>
            <div className="overflow-x-auto rounded-[22px] border border-mk-hair bg-white">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="bg-mk-stage text-left">
                    <th scope="col" className="px-5 py-3.5 font-semibold text-mk-ink">Plan</th>
                    <th scope="col" className="px-5 py-3.5 font-semibold text-mk-ink">Price</th>
                    <th scope="col" className="px-5 py-3.5 font-semibold text-mk-ink">Calls / month</th>
                    <th scope="col" className="px-5 py-3.5 font-semibold text-mk-ink">Requests / minute</th>
                    <th scope="col" className="px-5 py-3.5 font-semibold text-mk-ink">Commercial</th>
                  </tr>
                </thead>
                <tbody>
                  {orderedPlans(plans).map((plan) => {
                    const price = formatPlanPrice(plan)
                    return (
                      <tr key={plan.id} className="border-t border-mk-hair">
                        <th scope="row" className="px-5 py-3.5 text-left font-medium text-mk-ink">
                          {plan.price_display_label?.trim() || plan.name}
                        </th>
                        <td className="px-5 py-3.5 text-mk-body">
                          {price.amount}
                          {price.suffix}
                        </td>
                        <td className="px-5 py-3.5 text-mk-body">{planQuotaLabel(plan)}</td>
                        <td className="px-5 py-3.5 text-mk-body">
                          {formatRateLimit(plan.rate_limit_per_minute)}
                        </td>
                        <td className="px-5 py-3.5 text-mk-body">
                          {allowsCommercialUse(plan.name) ? 'Yes' : 'No'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-mk-muted">
              Commercial production sends X-API-Usage-Type: commercial. The{' '}
              <Link href="/pricing" prefetch={false} className={INLINE_LINK_CLASS}>
                pricing page
              </Link>{' '}
              is the full grid.
            </p>
          </div>
        </MarketingSheet>
      )}

      {page.extraSections && page.extraSections.length > 0 && (
        <MarketingSheet>
          <div className="container-prose space-y-14 md:space-y-16">
            {page.extraSections.map((section) => {
              const slug = section.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '')
              const headingId = `capability-extra-${slug}`
              return (
                <section key={section.title} aria-labelledby={headingId}>
                  <Reveal>
                    <h2 id={headingId} className="marketing-h3 mb-5">
                      {section.title}
                    </h2>
                  </Reveal>
                  <Reveal delay={80} className="marketing-body space-y-4">
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph.slice(0, 48)}>{paragraph}</p>
                    ))}
                  </Reveal>
                </section>
              )
            })}
          </div>
        </MarketingSheet>
      )}

      <RelatedResources links={page.related} />

      <section className="marketing-canvas-pad" aria-labelledby="capability-faq-heading">
        <div className="container-narrow">
          <Reveal>
            <MarketingSectionHeader
              id="capability-faq-heading"
              title={`${page.h1}: frequently asked questions`}
            />
          </Reveal>
          <Reveal delay={120}>
            <FaqList items={page.faqs} />
          </Reveal>
        </div>
      </section>

      <Testimonials />

      <MarketingCtaBand
        title="Start building today"
        description="Create a free account, generate an API key, and make your first request in minutes."
        primaryHref="/auth/register"
        primaryLabel="Get started free"
        secondaryHref="/pricing"
        secondaryLabel="View pricing"
      />
    </div>
  )
}
