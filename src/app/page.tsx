import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import Script from 'next/script'
import { buildPageMetadata } from '@/lib/metadata'
import { Search, Shield, Zap, BarChart3, Code2, Database } from 'lucide-react'
const ApiPlayground = dynamic(
  () => import('@/components/marketing/api-playground').then((m) => m.ApiPlayground),
  {
    loading: () => (
      <div className="marketing-card h-[280px] animate-pulse rounded-brand" aria-hidden />
    ),
  }
)
import { FaqSection, FAQ_JSON_LD } from '@/components/marketing/faq-section'
import { HomeHero } from '@/components/marketing/home-hero'
import {
  MarketingFeatureCard,
  MarketingCtaBand,
  MarketingSectionHeader,
} from '@/components/marketing/marketing-shell'
import { StructuredData } from '@/components/seo/structured-data'
import { HomeSeoContent } from '@/components/marketing/home-seo-content'

export const metadata: Metadata = buildPageMetadata({ path: '/' })

const features = [
  {
    icon: Search,
    title: 'Advanced food search',
    description: 'Multi-word matching, verified filters, suggest, and barcode lookup in one API.',
  },
  {
    icon: Database,
    title: 'Rich nutrition data',
    description: 'Macros per 100g, full nutrient arrays, and serving metadata for logging apps.',
  },
  {
    icon: Zap,
    title: 'Fast & cached',
    description: 'Redis-backed caching and indexed Postgres search for low-latency responses.',
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
    title: 'Developer-first',
    description: 'OpenAPI docs, predictable JSON, and a public playground to try before you sign up.',
  },
]

export default function HomePage() {
  return (
    <div className="marketing-page">
      <StructuredData type="api" />
      <StructuredData type="product" />
      <Script
        id="faq-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }}
      />

      <HomeHero />

      <section className="section-pad bg-surface-elevated -mt-1" id="demo">
        <div className="container-narrow">
          <MarketingSectionHeader
            label="Live demo"
            title="Try the API in seconds"
            description="Run a real search against our public demo endpoint, no signup required."
          />
          <ApiPlayground />
        </div>
      </section>

      <section className="section-pad">
        <div className="container-narrow">
          <MarketingSectionHeader
            label="Platform"
            title="Built for modern health products"
            description="Everything you need to integrate nutrition data into mobile, web, and AI workflows."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {features.map((f) => (
              <MarketingFeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      <MarketingCtaBand
        title="Ready to integrate?"
        description="Create an account, generate an API key, and start searching in minutes."
        primaryHref="/auth/register"
        primaryLabel="Get started free"
        secondaryHref="/pricing"
        secondaryLabel="View pricing"
      />

      <HomeSeoContent />

      <FaqSection />
    </div>
  )
}
