import Link from 'next/link'
import { MarketingImageHero } from '@/components/marketing/marketing-image-hero'
import {
  marketingCardClass,
  MarketingFeatureCard,
  MarketingSectionHeader,
  MarketingStatStrip,
  MarketingCtaBand,
} from '@/components/marketing/marketing-shell'
import { Reveal, RevealGroup } from '@/components/marketing/reveal'
import { TrackedCtaLink } from '@/components/analytics/tracked-cta-link'
import type { Metadata } from 'next'
import { buildPublicPageMetadata } from '@/lib/build-public-metadata'
import { PublicPageSchema } from '@/components/seo/public-page-schema'
import { AboutSeoContent } from '@/components/seo/public-page-seo-content'
import { buildAboutPageJsonLd } from '@/lib/seo-jsonld'
import { getPublicPageSeo } from '@/lib/public-page-seo'
import { Target, Award, Globe, Heart, Brain, Zap, Shield, Clock } from 'lucide-react'

const aboutSeo = getPublicPageSeo('/about')

export const metadata: Metadata = buildPublicPageMetadata('/about')

export default function AboutPage() {
  return (
    <div className="marketing-page">
      <PublicPageSchema
        path="/about"
        pageName="About"
        extraJsonLd={[buildAboutPageJsonLd(aboutSeo.description)]}
      />
      <MarketingImageHero compact centered waveTone="elevated">
        <p className="marketing-hero-badge mb-6 inline-flex items-center gap-2">
          <Heart className="h-4 w-4" aria-hidden />
          Our story
        </p>
        <h1 className="font-display text-4xl md:text-5xl tracking-tight text-ink mb-4 text-balance">
          Building the future of{' '}
          <span className="text-gradient-brand">nutrition technology</span>
        </h1>
        <p className="text-lg text-ink-muted leading-relaxed max-w-xl mx-auto">
          We democratize access to comprehensive nutrition data so developers can ship health and
          fitness products faster.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <TrackedCtaLink
            href="/auth/register"
            eventLabel="Get started free"
            className="btn-brand w-full sm:w-auto"
          >
            Get started free
          </TrackedCtaLink>
          <TrackedCtaLink
            href="/contact"
            eventLabel="Contact us"
            className="btn-brand-outline w-full sm:w-auto"
          >
            Contact us
          </TrackedCtaLink>
        </div>
      </MarketingImageHero>

      <section className="section-pad bg-surface-elevated">
        <div className="container-narrow grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <Reveal>
            <h2 className="font-display text-3xl md:text-4xl tracking-tight text-ink mb-6">
              Our mission
            </h2>
            <p className="text-ink-muted leading-relaxed mb-6">
              Provide developers with accurate, searchable nutrition data, from macros to
              barcode lookup, with transparent pricing and reliable uptime.
            </p>
            <p className="text-ink-muted leading-relaxed mb-8">
              Quality nutrition data should be simple to integrate, affordable at every scale,
              and secure by default.
            </p>
            <Link href="/docs" className="btn-brand-outline">
              <Target className="mr-2 h-4 w-4" aria-hidden />
              Read the docs
            </Link>
          </Reveal>
          <Reveal delay={120} className="relative">
            <div
              className="absolute left-1/2 top-1/2 -z-10 h-64 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/10 blur-3xl pointer-events-none"
              aria-hidden
            />
            <div className={`${marketingCardClass} card-hairline p-8 text-center`}>
              <div className="w-20 h-20 bg-gradient-to-br from-brand to-brand-strong rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow">
                <Heart className="h-10 w-10 text-surface" aria-hidden />
              </div>
              <h3 className="text-2xl font-display text-ink mb-4">Health first</h3>
              <p className="text-ink-muted">
                Every product decision is guided by helping people make better food choices
                through trustworthy data.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="container-narrow">
          <Reveal>
            <MarketingSectionHeader
              title="Core values"
              description="Principles that shape our API, documentation, and support."
            />
          </Reveal>
          <RevealGroup
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5"
            itemClassName="h-full min-w-0"
          >
            {[
              { icon: Zap, title: 'Innovation', description: 'Search, suggest, and barcode endpoints built for modern apps.' },
              { icon: Shield, title: 'Reliability', description: 'Rate limits, usage tracking, and health checks you can monitor.' },
              { icon: Heart, title: 'Community', description: 'Developer-first docs, examples, and responsive support.' },
              { icon: Globe, title: 'Accessibility', description: 'Free tier and public demo so you can evaluate before you commit.' },
              { icon: Brain, title: 'Intelligence', description: 'Verified foods, match modes, and rich nutrient payloads.' },
              { icon: Award, title: 'Excellence', description: 'Clear changelogs, versioning, and honest SLAs per plan.' },
            ].map(({ icon, title, description }) => (
              <MarketingFeatureCard key={title} icon={icon} title={title} description={description} />
            ))}
          </RevealGroup>
        </div>
      </section>

      <section className="section-pad-sm bg-gradient-to-b from-white to-surface-elevated">
        <div className="container-narrow">
          <Reveal>
            <MarketingSectionHeader
              title="Impact"
              description="Built for teams shipping calorie tracking, meal planning, and wellness products."
              className="mb-8 md:mb-10"
            />
          </Reveal>
          <Reveal delay={80}>
            <div className="rounded-brand border border-brand/15 bg-brand-muted/40 px-4 py-8 sm:px-6 md:px-8 md:py-10">
              <MarketingStatStrip
                stats={[
                  { value: '2M+', label: 'Food records', icon: Zap },
                  { value: '99.9%', label: 'Target uptime', icon: Clock },
                  { value: '<100ms', label: 'Search p95 goal', icon: Shield },
                  { value: 'Global', label: 'Developer access', icon: Globe },
                ]}
              />
            </div>
          </Reveal>
        </div>
      </section>

      <MarketingCtaBand
        title="Ready to build?"
        description="Create a free account, grab an API key, and make your first search in minutes."
        primaryHref="/auth/register"
        primaryLabel="Get started free"
        secondaryHref="/contact"
        secondaryLabel="Contact us"
      />

      <AboutSeoContent />
    </div>
  )
}
