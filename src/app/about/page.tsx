import Link from 'next/link'
import {
  MarketingIconDisc,
  MarketingFeatureGrid,
  MarketingSectionHeader,
  MarketingStatStrip,
  MarketingCtaBand,
} from '@/components/marketing/marketing-shell'
import {
  MarketingSheet,
  MarketingSheetHero,
  MarketingSplit,
  MarketingSplitCopy,
} from '@/components/marketing/marketing-sheet'
import { Reveal } from '@/components/marketing/reveal'
import { TrackedCtaLink } from '@/components/analytics/tracked-cta-link'
import type { Metadata } from 'next'
import { buildPublicPageMetadata } from '@/lib/build-public-metadata'
import { PublicPageSchema } from '@/components/seo/public-page-schema'
import { AboutSeoContent } from '@/components/seo/public-page-seo-content'
import { buildAboutPageJsonLd } from '@/lib/seo-jsonld'
import { getPublicPageSeo } from '@/lib/public-page-seo'
import { Target, Award, Globe, Heart, Brain, Zap, Shield } from 'lucide-react'

const aboutSeo = getPublicPageSeo('/about')

export const metadata: Metadata = buildPublicPageMetadata('/about')

const CORE_VALUES = [
  { icon: Zap, title: 'Innovation', description: 'Search, suggest, and barcode endpoints built for modern apps.' },
  { icon: Shield, title: 'Reliability', description: 'Rate limits, usage tracking, and health checks you can monitor.' },
  { icon: Heart, title: 'Community', description: 'Developer-first docs, examples, and responsive support.' },
  { icon: Globe, title: 'Accessibility', description: 'Free tier and public demo so you can evaluate before you commit.' },
  { icon: Brain, title: 'Intelligence', description: 'Verified foods, match modes, and rich nutrient payloads.' },
  { icon: Award, title: 'Excellence', description: 'Clear changelogs, versioning, and honest SLAs per plan.' },
]

export default function AboutPage() {
  return (
    <div className="marketing-page">
      <PublicPageSchema
        path="/about"
        pageName={aboutSeo.title ?? 'About Calorie API'}
        speakable
        extraJsonLd={[buildAboutPageJsonLd(aboutSeo.description)]}
      />
      <MarketingSheetHero
        badge={
          <>
            <Heart className="h-3.5 w-3.5" aria-hidden />
            Our story
          </>
        }
        title={aboutSeo.title}
        lead={aboutSeo.description}
        leadClassName="aeo-answer"
        actions={
          <>
            <TrackedCtaLink href="/auth/register" eventLabel="Get started free" className="btn-brand">
              Get started free
            </TrackedCtaLink>
            <TrackedCtaLink href="/contact" eventLabel="Contact us" className="btn-brand-outline">
              Contact us
            </TrackedCtaLink>
          </>
        }
      />

      <MarketingSheet aria-labelledby="about-mission-heading">
        <div className="container-narrow">
          <MarketingSplit
            copy={
              <Reveal>
                <MarketingSplitCopy
                  titleId="about-mission-heading"
                  title="Our mission"
                  actions={
                    <Link href="/docs" className="btn-brand-outline">
                      <Target className="h-4 w-4" aria-hidden />
                      Read the docs
                    </Link>
                  }
                >
                  <p className="marketing-body mt-4">
                    Provide developers with accurate, searchable nutrition data, from macros to
                    barcode lookup, with transparent pricing and reliable uptime.
                  </p>
                  <p className="marketing-body mt-4">
                    Quality nutrition data should be simple to integrate, affordable at every scale,
                    and secure by default.
                  </p>
                </MarketingSplitCopy>
              </Reveal>
            }
            aside={
              <Reveal delay={120}>
                <div className="marketing-callout px-4 py-10 sm:px-10 md:py-14">
                  <div className="marketing-float-card mx-auto max-w-sm p-6 text-center md:p-8">
                    <MarketingIconDisc icon={Heart} tone="coral" className="mx-auto" />
                    <h3 className="mt-5 text-xl font-semibold tracking-[-0.02em] text-mk-ink">Health first</h3>
                    <p className="marketing-body mt-3">
                      Every product decision is guided by helping people make better food choices
                      through trustworthy data.
                    </p>
                  </div>
                </div>
              </Reveal>
            }
          />
        </div>
      </MarketingSheet>

      <MarketingSheet aria-labelledby="about-values-heading">
        <div className="container-narrow">
          <Reveal>
            <MarketingSectionHeader
              id="about-values-heading"
              title="Core values"
              description="Principles that shape our API, documentation, and support."
            />
          </Reveal>
          <MarketingFeatureGrid items={CORE_VALUES} />
        </div>
      </MarketingSheet>

      <section className="marketing-canvas-pad" aria-labelledby="about-impact-heading">
        <div className="container-narrow">
          <Reveal>
            <MarketingSectionHeader
              id="about-impact-heading"
              title="Impact"
              description="Built for teams shipping calorie tracking, meal planning, and wellness products."
              className="mb-8 md:mb-10"
            />
          </Reveal>
          <Reveal delay={80}>
            <MarketingStatStrip
              stats={[
                { value: '2M+', label: 'Food records' },
                { value: '99.9%', label: 'Target uptime' },
                { value: '<100ms', label: 'Search p95 goal' },
                { value: 'Global', label: 'Developer access' },
              ]}
            />
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
