import Link from 'next/link'
import Script from 'next/script'
import { Search, Shield, Zap, BarChart3, Code2, Database } from 'lucide-react'
import { ApiPlayground } from '@/components/marketing/api-playground'
import { FaqSection, FAQ_JSON_LD } from '@/components/marketing/faq-section'
import {
  MarketingFeatureCard,
  MarketingTrustPills,
  MarketingCtaBand,
  MarketingSectionHeader,
} from '@/components/marketing/marketing-shell'
import { StructuredData } from '@/components/seo/structured-data'

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

      <section className="hero-glow relative overflow-hidden pt-20 pb-24 md:pt-28 md:pb-32">
        <div className="container-narrow text-center relative z-10">
          <p className="marketing-hero-badge mb-8">Nutrition API for developers</p>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-[3.5rem] text-ink leading-[1.05] tracking-tight text-balance max-w-4xl mx-auto">
            The ultimate food &amp; nutrition database API
          </h1>
          <p className="mt-6 text-lg md:text-xl text-ink-muted max-w-2xl mx-auto leading-relaxed">
            Ship meal tracking, macro logging, and barcode scan features faster with search,
            suggest, and verified nutrition data, built for production health apps.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/auth/register" className="btn-brand">
              Get API key for Free
            </Link>
            <Link href="/docs" className="btn-brand-outline">
              Read documentation
            </Link>
          </div>
          <div className="mt-10">
            <MarketingTrustPills
              items={['No credit card for free tier', 'REST + JSON', '99.9% uptime target']}
            />
          </div>
        </div>
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-brand/20 blur-[100px] pointer-events-none"
          aria-hidden
        />
      </section>

      <section className="section-pad bg-surface-elevated" id="demo">
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

      <FaqSection />
    </div>
  )
}
