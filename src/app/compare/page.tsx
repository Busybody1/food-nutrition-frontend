import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { SITE_NAME } from '@/lib/site'
import { buildPageMetadata } from '@/lib/metadata'
import { JsonLdScript } from '@/components/seo/structured-data'
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from '@/lib/seo-jsonld'
import { buildFaqPageJsonLd } from '@/lib/faq-data'
import { MarketingImageHero } from '@/components/marketing/marketing-image-hero'
import {
  MarketingCtaBand,
  MarketingSectionHeader,
  marketingCardClass,
} from '@/components/marketing/marketing-shell'
import { FaqList } from '@/components/marketing/faq-section'
import { Reveal, RevealGroup } from '@/components/marketing/reveal'
import { TrackedCtaLink } from '@/components/analytics/tracked-cta-link'
import {
  COMPARE_HUB_ROWS,
  COMPARISON_PAGES,
  comparisonPath,
} from '@/lib/comparisons-data'

const DESCRIPTION =
  'How to choose a nutrition API: an honest comparison of Calorie API, Nutritionix, Edamam, USDA FoodData Central, and Spoonacular for developers.'

const HUB_FAQS = [
  {
    q: 'What is the best nutrition API?',
    a: 'It depends on your product. Free-text meal parsing points to Nutritionix; turnkey recipe analysis to Edamam; free US reference data to USDA FoodData Central; recipe content to Spoonacular. For REST food search, barcode scanning with fallback, and verified per-100g macros with flat pricing, Calorie API is built exactly for that shape.',
  },
  {
    q: 'How should I evaluate nutrition APIs?',
    a: 'Test with your real data: run your users’ actual food queries and barcodes against each candidate, check macro completeness on the results, and model your call volume against each pricing page. Coverage of your foods beats headline database sizes.',
  },
  {
    q: 'Can I combine multiple nutrition data providers?',
    a: 'Yes, hybrid setups are common, like USDA FoodData Central for reference analysis with Calorie API in the interactive logging path. Normalize to per-100g values at your boundary to keep the mix maintainable.',
  },
]

export const metadata: Metadata = buildPageMetadata({
  title: 'Compare Nutrition APIs',
  description: DESCRIPTION,
  keywords: [
    'best nutrition API',
    'nutrition API comparison',
    'food database API comparison',
    'Nutritionix vs Edamam',
    'nutrition API for developers',
  ],
  path: '/compare',
})

export default function CompareHubPage() {
  return (
    <div className="marketing-page">
      <JsonLdScript
        id="webpage-compare"
        data={buildWebPageJsonLd({
          name: 'Compare Nutrition APIs',
          description: DESCRIPTION,
          path: '/compare',
        })}
      />
      <JsonLdScript
        id="breadcrumb-compare"
        data={buildBreadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Compare', path: '/compare' },
        ])}
      />
      <JsonLdScript id="faq-compare-hub" data={buildFaqPageJsonLd(HUB_FAQS)} />

      <MarketingImageHero compact centered waveTone="white">
        <p className="marketing-hero-badge mb-4 inline-flex">Compare</p>
        <h1 className="font-display text-4xl md:text-5xl text-ink mb-4 text-balance">
          Choosing a nutrition API
        </h1>
        <p className="text-lg text-ink-muted leading-relaxed max-w-2xl mx-auto">
          Every provider below is good at something. This page maps who is good at what, so you
          can shortlist in minutes and verify with your own data.
        </p>
        {/* CTA labels/hrefs duplicated verbatim from this page's MarketingCtaBand below. */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <TrackedCtaLink
            href="/playground"
            eventLabel="Open the playground"
            className="btn-brand w-full sm:w-auto"
          >
            Open the playground
          </TrackedCtaLink>
          <TrackedCtaLink
            href="/auth/register"
            eventLabel="Get a free API key"
            className="btn-brand-outline w-full sm:w-auto"
          >
            Get a free API key
          </TrackedCtaLink>
        </div>
      </MarketingImageHero>

      <section className="section-pad-sm bg-white" aria-label="Provider overview">
        <div className="container-narrow">
          <Reveal>
            <div className="overflow-x-auto rounded-brand border border-surface-border bg-white shadow-glass">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="bg-brand-muted/50 text-left">
                    <th scope="col" className="px-4 py-3 font-semibold text-ink">Provider</th>
                    <th scope="col" className="px-4 py-3 font-semibold text-ink">Primary focus</th>
                    <th scope="col" className="px-4 py-3 font-semibold text-ink">Best for</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARE_HUB_ROWS.map((row) => (
                    <tr
                      key={row.provider}
                      className="border-t border-surface-border align-top odd:bg-surface-elevated/50 hover:bg-brand-muted/30 transition-colors duration-150"
                    >
                      <th scope="row" className="px-4 py-3 font-medium text-ink text-left whitespace-nowrap">
                        <Link
                          href={row.href}
                          prefetch={false}
                          className="rounded-sm text-brand-strong underline decoration-brand/40 underline-offset-2 hover:decoration-brand-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2"
                        >
                          {row.provider}
                        </Link>
                      </th>
                      <td className="px-4 py-3 text-ink-muted">{row.focus}</td>
                      <td className="px-4 py-3 text-ink-muted">{row.bestFor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-center text-xs text-ink-muted">
              Summaries reviewed as of July 2026; verify against each provider&apos;s current
              documentation before deciding.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section-pad bg-surface-elevated">
        <div className="container-narrow">
          <Reveal>
            <MarketingSectionHeader
              label="Deep dives"
              title="Detailed comparisons"
              description={`Feature matrices, honest fit guidance, and migration notes for each ${SITE_NAME} alternative page.`}
            />
          </Reveal>
          <RevealGroup className="grid sm:grid-cols-2 gap-4 md:gap-5" itemClassName="h-full min-w-0">
            {COMPARISON_PAGES.map((page) => (
              <Link
                key={page.slug}
                href={comparisonPath(page.slug)}
                className={`${marketingCardClass} group flex h-full cursor-pointer flex-col p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2`}
              >
                <h3 className="text-lg font-semibold text-ink mb-1 transition-colors duration-200 group-hover:text-brand-strong">
                  {SITE_NAME} vs {page.competitor}
                </h3>
                <p className="text-sm text-ink-muted leading-relaxed">{page.summary}</p>
                <span className="mt-auto inline-flex items-center gap-1 pt-3 text-sm font-medium text-brand-strong">
                  Read comparison{' '}
                  <ArrowRight
                    className="w-4 h-4 transition-transform duration-200 motion-safe:group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </span>
              </Link>
            ))}
          </RevealGroup>
        </div>
      </section>

      <section className="section-pad bg-white" aria-label="Frequently asked questions">
        <div className="container-narrow">
          <Reveal>
            <MarketingSectionHeader title="Choosing a nutrition API: common questions" />
          </Reveal>
          <Reveal delay={80}>
            <FaqList items={HUB_FAQS} />
          </Reveal>
        </div>
      </section>

      <MarketingCtaBand
        title="Shortlisted us? Verify with real data"
        description="Run your users' actual food queries and barcodes through the public playground, no signup required."
        primaryHref="/playground"
        primaryLabel="Open the playground"
        secondaryHref="/auth/register"
        secondaryLabel="Get a free API key"
      />
    </div>
  )
}
