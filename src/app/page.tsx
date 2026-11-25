import type { Metadata } from 'next'
import { buildPublicPageMetadata } from '@/lib/build-public-metadata'
import { HOME_FAQ_ITEMS, IMPLEMENTATION_FAQS, buildFaqPageJsonLd } from '@/lib/faq-data'
import { BarcodeIcon, BracketsCurlyIcon, ChartBarIcon, CodeIcon, DatabaseIcon, GiftIcon, LightningIcon, MagnifyingGlassIcon, ShieldIcon } from '@phosphor-icons/react/ssr'
import { LazyApiPlayground } from '@/components/marketing/lazy-api-playground'
import { FaqSection } from '@/components/marketing/faq-section'
import { HomeOrbitHero } from '@/components/marketing/home-hero'
import {
  MarketingCtaBand,
  MarketingHighlightStats,
  MarketingFeatureGrid,
  MarketingSectionHeader,
} from '@/components/marketing/marketing-shell'
import { MarketingSheet, MarketingSplit, MarketingSplitCopy } from '@/components/marketing/marketing-sheet'
import { MarketingPreviewCard, MarketingProductFrame } from '@/components/marketing/marketing-cards'
import {
  BarcodePreviewStage,
  ExampleResponseStack,
  MacroPreviewStage,
  SPLIT_EXAMPLE_FOODS,
  SearchPreviewStage,
} from '@/components/marketing/example-foods'
import { Reveal, RevealGroup } from '@/components/marketing/reveal'
import { TrackedCtaLink } from '@/components/analytics/tracked-cta-link'
import { StructuredData, JsonLdScript } from '@/components/seo/structured-data'
import { PublicPageSchema } from '@/components/seo/public-page-schema'
import { getPublicPageSeo } from '@/lib/public-page-seo'
import { HomeSeoContent } from '@/components/marketing/home-seo-content'
import { HomeMcpSection } from '@/components/marketing/home-mcp-section'
import { StatsBand } from '@/components/marketing/stats-band'
import { TestimonialStack, TESTIMONIALS_TITLE } from '@/components/marketing/testimonials'
import { getPublicTestimonials } from '@/lib/api/testimonials'
import { FOOD_DATABASE_SIZE_LABEL, FREE_TIER_CALLS } from '@/lib/site'
import { capabilityPath, getCapabilityPage } from '@/lib/capability-pages-data'

export const metadata: Metadata = buildPublicPageMetadata('/')

const HOME_SEO = getPublicPageSeo('/')

const features = [
  {
    icon: MagnifyingGlassIcon,
    title: 'Food API search',
    description: 'Multi-word matching, verified filters, suggest, and barcode lookup in one food API.',
  },
  {
    icon: DatabaseIcon,
    title: 'Nutrition API data',
    description: 'Macros per 100g, full nutrient arrays, and serving metadata from our food database API.',
  },
  {
    icon: LightningIcon,
    title: 'Fast food database API',
    description: 'Redis-backed caching and indexed Postgres search for low-latency calorie API responses.',
  },
  {
    icon: ShieldIcon,
    title: 'Secure by default',
    description: 'API keys hashed at rest, plan-based rate limits, and Stripe-verified billing.',
  },
  {
    icon: ChartBarIcon,
    title: 'Usage analytics',
    description: 'Track requests per endpoint in your dashboard with exportable reports.',
  },
  {
    icon: CodeIcon,
    title: 'Developer-first nutrition API',
    description: 'OpenAPI docs, predictable JSON, and a public playground to try before you sign up.',
  },
]

const HOME_STATS = [
  { icon: DatabaseIcon, value: FOOD_DATABASE_SIZE_LABEL.replace(/\s+foods?$/i, ''), label: 'foods in database' },
  { icon: GiftIcon, value: new Intl.NumberFormat('en-US').format(FREE_TIER_CALLS), label: 'free calls/month' },
  { icon: BarcodeIcon, value: 'UPC + EAN', label: 'barcode lookup with fallback' },
  { icon: BracketsCurlyIcon, value: 'REST + JSON', label: 'food nutrition API' },
]

const RESPONSE_FORMAT_FAQ =
  IMPLEMENTATION_FAQS.find((item) => item.q === 'What format are API responses in?') ?? IMPLEMENTATION_FAQS[5]

const PREVIEW_CARDS = [
  { slug: 'food-database-api', stage: <SearchPreviewStage /> },
  { slug: 'barcode-nutrition-api', stage: <BarcodePreviewStage /> },
  { slug: 'nutrition-analysis-api', stage: <MacroPreviewStage /> },
].flatMap(({ slug, stage }) => {
  const page = getCapabilityPage(slug)
  return page ? [{ href: capabilityPath(page.slug), title: page.h1, description: page.summary, stage }] : []
})

export default async function HomePage() {
  const testimonials = (await getPublicTestimonials()).slice(0, 3)
  const hasTestimonials = testimonials.length > 0

  return (
    <div className="marketing-page">
      <PublicPageSchema path="/" pageName={HOME_SEO.title ?? 'Food calorie API'} speakable />
      <HomeOrbitHero />

      <MarketingSheet band aria-labelledby="home-platform-heading">
        <div className="container-narrow">
          <Reveal>
            <MarketingSectionHeader
              id="home-platform-heading"
              title="Food database API for modern health products"
              description="Everything you need to integrate nutrition API data into mobile, web, and AI workflows."
            />
          </Reveal>
          <MarketingFeatureGrid items={features} />
          <Reveal className="mt-14 md:mt-20">
            <MarketingHighlightStats stats={HOME_STATS} />
          </Reveal>
        </div>
      </MarketingSheet>

      <MarketingSheet aria-labelledby="home-split-heading">
        <div className="container-narrow">
          <MarketingSplit
            copy={
              <Reveal>
                <MarketingSplitCopy
                  titleId="home-split-heading"
                  title={hasTestimonials ? TESTIMONIALS_TITLE : RESPONSE_FORMAT_FAQ.q}
                  description={hasTestimonials ? undefined : RESPONSE_FORMAT_FAQ.a}
                  actions={
                    <>
                      <TrackedCtaLink href="/auth/register" eventLabel="Get started free" className="btn-brand">
                        Get started free
                      </TrackedCtaLink>
                      <TrackedCtaLink href="/docs" eventLabel="Read documentation" className="btn-brand-outline">
                        Read documentation
                      </TrackedCtaLink>
                    </>
                  }
                />
              </Reveal>
            }
            aside={
              <Reveal delay={120}>
                <div className="marketing-callout px-4 py-10 sm:px-8 md:py-14">
                  {hasTestimonials ? (
                    <TestimonialStack testimonials={testimonials} />
                  ) : (
                    <ExampleResponseStack foods={SPLIT_EXAMPLE_FOODS} withMacros />
                  )}
                </div>
              </Reveal>
            }
          />
        </div>
      </MarketingSheet>

      <section className="marketing-canvas-pad marketing-band">
        <div className="container-narrow">
          <RevealGroup className="grid gap-4 md:grid-cols-3 md:gap-5" itemClassName="h-full min-w-0">
            {PREVIEW_CARDS.map((card) => (
              <MarketingPreviewCard key={card.href} {...card} />
            ))}
          </RevealGroup>
        </div>
      </section>

      <HomeMcpSection />

      <MarketingSheet band id="demo" aria-labelledby="home-demo-heading">
        <div className="container-narrow">
          <Reveal>
            <MarketingSectionHeader
              id="home-demo-heading"
              title="Try our food calorie API live"
              description="Run a real search against our public food API demo endpoint, no signup required."
            />
          </Reveal>
          <MarketingProductFrame>
            <LazyApiPlayground />
          </MarketingProductFrame>
          <StatsBand only={['latency', 'uptime']} variant="inline" />
        </div>
      </MarketingSheet>

      <HomeSeoContent />

      <FaqSection items={HOME_FAQ_ITEMS} className="marketing-band" />

      <MarketingCtaBand
        title="Ready to integrate?"
        description="Create an account, generate an API key, and start searching in minutes."
        primaryHref="/auth/register"
        primaryLabel="Get started free"
        secondaryHref="/pricing"
        secondaryLabel="View pricing"
      />

      <StructuredData type="api" />
      <JsonLdScript id="faq-jsonld" data={buildFaqPageJsonLd(HOME_FAQ_ITEMS)} />
    </div>
  )
}
