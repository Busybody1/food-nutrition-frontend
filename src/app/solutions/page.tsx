import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  Dumbbell,
  HeartPulse,
  ShoppingCart,
  Sparkles,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react'
import { buildPageMetadata } from '@/lib/metadata'
import { JsonLdScript } from '@/components/seo/structured-data'
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from '@/lib/seo-jsonld'
import { MarketingImageHero } from '@/components/marketing/marketing-image-hero'
import { MarketingCtaBand, marketingCardClass } from '@/components/marketing/marketing-shell'
import { Reveal } from '@/components/marketing/reveal'
import { TrackedCtaLink } from '@/components/analytics/tracked-cta-link'
import { SOLUTION_PAGES, solutionPath } from '@/lib/solutions-data'

const DESCRIPTION =
  'How teams use the Calorie API: fitness and calorie tracking apps, meal planners, healthcare software, grocery and retail scanning, and wellness platforms.'

export const metadata: Metadata = buildPageMetadata({
  title: 'Solutions',
  description: DESCRIPTION,
  keywords: [
    'nutrition API use cases',
    'food API solutions',
    'nutrition data for apps',
    'food database integrations',
  ],
  path: '/solutions',
})

/** Decorative card icons keyed by solution slug (data file stays untouched). */
const SOLUTION_ICONS: Record<string, LucideIcon> = {
  'fitness-apps': Dumbbell,
  'meal-planning-apps': UtensilsCrossed,
  healthcare: HeartPulse,
  'grocery-retail': ShoppingCart,
  'wellness-saas': Sparkles,
}

/**
 * 5 cards on a 6-track lg grid: row of three, then a centered pair
 * (no left-hugging orphan row under the centered hero). The 5th card
 * spans the full 2-col row between sm and lg for the same reason.
 */
const CARD_PLACEMENT = [
  'lg:col-span-2',
  'lg:col-span-2',
  'lg:col-span-2',
  'lg:col-span-2 lg:col-start-2',
  'sm:max-lg:col-span-2 lg:col-span-2',
]

export default function SolutionsIndexPage() {
  return (
    <div className="marketing-page">
      <JsonLdScript
        id="webpage-solutions"
        data={buildWebPageJsonLd({ name: 'Solutions', description: DESCRIPTION, path: '/solutions' })}
      />
      <JsonLdScript
        id="breadcrumb-solutions"
        data={buildBreadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Solutions', path: '/solutions' },
        ])}
      />

      <MarketingImageHero compact centered waveTone="white">
        <p className="marketing-hero-badge mb-4 inline-flex">Solutions</p>
        <h1 className="font-display text-4xl md:text-5xl text-ink mb-4 text-balance">
          One nutrition API, every food product
        </h1>
        <p className="text-lg text-ink-muted leading-relaxed max-w-2xl mx-auto">{DESCRIPTION}</p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <TrackedCtaLink
            href="/contact"
            eventLabel="Talk to us"
            className="btn-brand h-12 px-8 text-base w-full sm:w-auto"
          >
            Talk to us
          </TrackedCtaLink>
          <TrackedCtaLink
            href="/docs"
            eventLabel="Read the docs"
            className="btn-brand-outline h-12 px-8 text-base w-full sm:w-auto"
          >
            Read the docs
          </TrackedCtaLink>
        </div>
      </MarketingImageHero>

      <section className="bg-white pt-12 md:pt-16 pb-20 md:pb-28">
        <div className="container-narrow">
          <div className="grid gap-4 md:gap-5 sm:grid-cols-2 lg:grid-cols-6">
            {SOLUTION_PAGES.map((page, index) => {
              const Icon = SOLUTION_ICONS[page.slug] ?? Sparkles
              return (
                <Reveal
                  key={page.slug}
                  delay={Math.min(index, 6) * 80}
                  className={`h-full min-w-0 ${CARD_PLACEMENT[index] ?? 'lg:col-span-2'}`}
                >
                  <Link
                    href={solutionPath(page.slug)}
                    className={`${marketingCardClass} group flex h-full flex-col p-6 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2`}
                  >
                    <span className="marketing-feature-icon transition-all duration-200 motion-safe:group-hover:scale-105">
                      <Icon className="h-6 w-6 text-brand-strong" aria-hidden />
                    </span>
                    <p className="marketing-section-label mb-2">{page.heroBadge}</p>
                    <h2 className="text-lg font-semibold text-ink mb-2 transition-colors duration-200 group-hover:text-brand-strong">
                      {page.h1}
                    </h2>
                    <p className="text-sm text-ink-muted leading-relaxed">{page.summary}</p>
                    <span className="mt-auto pt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-strong">
                      Explore
                      <ArrowRight
                        className="w-4 h-4 transition-transform duration-200 motion-safe:group-hover:translate-x-0.5"
                        aria-hidden
                      />
                    </span>
                  </Link>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      <MarketingCtaBand
        title="Don't see your use case?"
        description="The API is general-purpose food and nutrition infrastructure. Tell us what you're building and we'll point you at the right endpoints."
        primaryHref="/contact"
        primaryLabel="Talk to us"
        secondaryHref="/docs"
        secondaryLabel="Read the docs"
      />
    </div>
  )
}
