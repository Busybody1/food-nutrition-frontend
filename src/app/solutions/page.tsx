import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { buildPageMetadata } from '@/lib/metadata'
import { JsonLdScript } from '@/components/seo/structured-data'
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from '@/lib/seo-jsonld'
import { MarketingImageHero } from '@/components/marketing/marketing-image-hero'
import { MarketingCtaBand, marketingCardClass } from '@/components/marketing/marketing-shell'
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
      </MarketingImageHero>

      <section className="section-pad bg-white -mt-1">
        <div className="container-narrow">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {SOLUTION_PAGES.map((page) => (
              <Link
                key={page.slug}
                href={solutionPath(page.slug)}
                className={`${marketingCardClass} group p-6 block`}
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-brand-strong mb-2">
                  {page.heroBadge}
                </p>
                <h2 className="text-lg font-semibold text-ink mb-2 group-hover:text-brand-strong">
                  {page.h1}
                </h2>
                <p className="text-sm text-ink-muted leading-relaxed">{page.summary}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-strong">
                  Explore <ArrowRight className="w-4 h-4" aria-hidden />
                </span>
              </Link>
            ))}
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
