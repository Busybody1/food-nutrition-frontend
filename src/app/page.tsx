import type { Metadata } from 'next'
import { buildPublicPageMetadata } from '@/lib/build-public-metadata'
import { HOME_FAQ_ITEMS, buildFaqPageJsonLd } from '@/lib/faq-data'
import { Search, Shield, Zap, BarChart3, Code2, Database } from 'lucide-react'
import { LazyApiPlayground } from '@/components/marketing/lazy-api-playground'
import { FaqSection } from '@/components/marketing/faq-section'
import { HomeHero } from '@/components/marketing/home-hero'
import {
  MarketingFeatureCard,
  MarketingCtaBand,
  MarketingSectionHeader,
} from '@/components/marketing/marketing-shell'
import { Reveal, RevealGroup } from '@/components/marketing/reveal'
import { StructuredData, JsonLdScript } from '@/components/seo/structured-data'
import { PricingProductSchema } from '@/components/seo/pricing-product-schema'
import { HomeSeoContent } from '@/components/marketing/home-seo-content'
import { StatsBand } from '@/components/marketing/stats-band'
import { Testimonials } from '@/components/marketing/testimonials'

export const metadata: Metadata = buildPublicPageMetadata('/')

const features = [
  {
    icon: Search,
    title: 'Food API search',
    description: 'Multi-word matching, verified filters, suggest, and barcode lookup in one food API.',
  },
  {
    icon: Database,
    title: 'Nutrition API data',
    description: 'Macros per 100g, full nutrient arrays, and serving metadata from our food database API.',
  },
  {
    icon: Zap,
    title: 'Fast food database API',
    description: 'Redis-backed caching and indexed Postgres search for low-latency calorie API responses.',
  },
  {
    icon: Shield,
    title: 'Secure by default',
    description: 'API keys hashed at rest, plan-based rate limits, and Stripe-verified billing.',
  },
  {
    icon: BarChart3,
    title: 'Usage analytics',
    description: 'Track requests per endpoint in your dashboard with exportable reports.',
  },
  {
    icon: Code2,
    title: 'Developer-first nutrition API',
    description: 'OpenAPI docs, predictable JSON, and a public playground to try before you sign up.',
  },
]

export default function HomePage() {
  return (
    <div className="marketing-page">
      <HomeHero />

      <section className="section-pad bg-surface-elevated" id="demo">
        <div className="container-narrow">
          <Reveal>
            <MarketingSectionHeader
              label="Live demo"
              title="Try our food calorie API live"
              description="Run a real search against our public food API demo endpoint, no signup required."
            />
          </Reveal>
          <LazyApiPlayground />
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="container-narrow">
          <Reveal>
            <MarketingSectionHeader
              label="Platform"
              title="Food database API for modern health products"
              description="Everything you need to integrate nutrition API data into mobile, web, and AI workflows."
            />
          </Reveal>
          <RevealGroup
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5"
            itemClassName="h-full min-w-0"
          >
            {features.map((f) => (
              <MarketingFeatureCard key={f.title} {...f} />
            ))}
          </RevealGroup>
        </div>
      </section>

      <Testimonials />

      <StatsBand />

      <HomeSeoContent />

      <FaqSection items={HOME_FAQ_ITEMS} />

      <MarketingCtaBand
        title="Ready to integrate?"
        description="Create an account, generate an API key, and start searching in minutes."
        primaryHref="/auth/register"
        primaryLabel="Get started free"
        secondaryHref="/pricing"
        secondaryLabel="View pricing"
      />

      <StructuredData type="api" />
      <PricingProductSchema />
      <JsonLdScript id="faq-jsonld" data={buildFaqPageJsonLd(HOME_FAQ_ITEMS)} />
    </div>
  )
}
