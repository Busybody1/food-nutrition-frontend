import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { BarbellIcon, ForkKnifeIcon, HeartbeatIcon, ShoppingCartIcon, SparkleIcon } from '@phosphor-icons/react/ssr'
import type { MarketingIcon } from '@/components/marketing/marketing-shell'
import { buildPageMetadata } from '@/lib/metadata'
import { JsonLdScript } from '@/components/seo/structured-data'
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from '@/lib/seo-jsonld'
import {
  MarketingCtaBand,
  MarketingIconDisc,
  discToneAt,
  marketingCardClass,
} from '@/components/marketing/marketing-shell'
import { MarketingSheetHero } from '@/components/marketing/marketing-sheet'
import { MarketingProductFrame } from '@/components/marketing/marketing-cards'
import { ExampleFoodCollage } from '@/components/marketing/example-foods'
import { Reveal } from '@/components/marketing/reveal'
import { TrackedCtaLink } from '@/components/analytics/tracked-cta-link'
import { SOLUTION_PAGES, solutionPath } from '@/lib/solutions-data'

const SOLUTIONS_H1 = 'Nutrition API for apps'
const DESCRIPTION =
  'Nutrition API for apps: fitness logging, meal planning, healthcare diaries, grocery barcode scans, and wellness platforms. Macros are per 100 g.'

export const metadata: Metadata = buildPageMetadata({
  title: SOLUTIONS_H1,
  description: DESCRIPTION,
  keywords: [
    'nutrition API use cases',
    'food API solutions',
    'nutrition data for apps',
    'food database integrations',
  ],
  path: '/solutions',
})

const SOLUTION_ICONS: Record<string, MarketingIcon> = {
  'fitness-apps': BarbellIcon,
  'meal-planning-apps': ForkKnifeIcon,
  healthcare: HeartbeatIcon,
  'grocery-retail': ShoppingCartIcon,
  'wellness-saas': SparkleIcon,
}

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
        data={buildWebPageJsonLd({
          name: SOLUTIONS_H1,
          description: DESCRIPTION,
          path: '/solutions',
          speakable: true,
        })}
      />
      <JsonLdScript
        id="breadcrumb-solutions"
        data={buildBreadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: SOLUTIONS_H1, path: '/solutions' },
        ])}
      />

      <MarketingSheetHero
        badge="Solutions"
        title={SOLUTIONS_H1}
        lead={DESCRIPTION}
        leadClassName="aeo-answer"
        actions={
          <>
            <TrackedCtaLink href="/contact" eventLabel="Talk to us" className="btn-brand">
              Talk to us
            </TrackedCtaLink>
            <TrackedCtaLink href="/docs" eventLabel="Read the docs" className="btn-brand-outline">
              Read the docs
            </TrackedCtaLink>
          </>
        }
        showcase={
          <div className="container-narrow hidden md:block">
            <MarketingProductFrame cropped className="rounded-b-none border-b-0">
              <ExampleFoodCollage />
            </MarketingProductFrame>
          </div>
        }
      />

      <section className="marketing-canvas-pad">
        <div className="container-narrow">
          <div className="grid gap-4 md:gap-5 sm:grid-cols-2 lg:grid-cols-6">
            {SOLUTION_PAGES.map((page, index) => {
              const Icon = SOLUTION_ICONS[page.slug] ?? SparkleIcon
              return (
                <Reveal
                  key={page.slug}
                  delay={Math.min(index, 6) * 80}
                  className={`h-full min-w-0 ${CARD_PLACEMENT[index] ?? 'lg:col-span-2'}`}
                >
                  <Link
                    href={solutionPath(page.slug)}
                    className={`${marketingCardClass} group flex h-full flex-col p-6 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2`}
                  >
                    <MarketingIconDisc icon={Icon} tone={discToneAt(index)} className="mb-4" />
                    <p className="mb-1.5 text-xs font-medium text-mk-muted">{page.heroBadge}</p>
                    <h2 className="mb-2 text-lg font-semibold tracking-[-0.01em] text-mk-ink">
                      {page.h1}
                    </h2>
                    <p className="text-[15px] leading-relaxed text-mk-muted">{page.summary}</p>
                    <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-medium text-mk-ink">
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
