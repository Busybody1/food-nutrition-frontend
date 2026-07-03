import Link from 'next/link'
import {
  Search,
  Database,
  Zap,
  Shield,
  BarChart3,
  Code2,
  ScanBarcode,
  UtensilsCrossed,
  HeartPulse,
  type LucideIcon,
} from 'lucide-react'
import { MarketingImageHero } from '@/components/marketing/marketing-image-hero'
import {
  MarketingCtaBand,
  MarketingFeatureCard,
  MarketingSectionHeader,
  MarketingStatStrip,
} from '@/components/marketing/marketing-shell'
import { FaqList } from '@/components/marketing/faq-section'
import { CapabilityCodeWindow } from '@/components/marketing/capability-code-window'
import { Testimonials } from '@/components/marketing/testimonials'
import { Reveal, RevealGroup } from '@/components/marketing/reveal'
import { TrackedCtaLink } from '@/components/analytics/tracked-cta-link'
import { JsonLdScript } from '@/components/seo/structured-data'
import {
  buildBreadcrumbJsonLd,
  buildWebPageJsonLd,
} from '@/lib/seo-jsonld'
import { buildFaqPageJsonLd } from '@/lib/faq-data'
import { capabilityPath, type CapabilityPage } from '@/lib/capability-pages-data'
import { RelatedResources } from '@/components/seo/related-resources'

const FEATURE_ICONS: Record<CapabilityPage['features'][number]['icon'], LucideIcon> = {
  search: Search,
  database: Database,
  zap: Zap,
  shield: Shield,
  chart: BarChart3,
  code: Code2,
  scan: ScanBarcode,
  utensils: UtensilsCrossed,
  heart: HeartPulse,
}

/** Inline text links: persistent underline so they never rely on color alone. */
const INLINE_LINK_CLASS =
  'text-brand-strong font-medium underline decoration-brand/40 underline-offset-2 ' +
  'hover:decoration-brand-strong rounded-sm focus-visible:outline-none ' +
  'focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2'

export function CapabilityPageView({ page }: { page: CapabilityPage }) {
  const path = capabilityPath(page.slug)

  return (
    <div className="marketing-page">
      <JsonLdScript
        id={`webpage-${page.slug}`}
        data={buildWebPageJsonLd({ name: page.h1, description: page.description, path })}
      />
      <JsonLdScript
        id={`breadcrumb-${page.slug}`}
        data={buildBreadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: page.h1, path },
        ])}
      />
      <JsonLdScript id={`faq-${page.slug}`} data={buildFaqPageJsonLd(page.faqs)} />

      <MarketingImageHero compact centered waveTone="elevated">
        <p className="marketing-hero-badge mb-4 inline-flex">{page.heroBadge}</p>
        <h1 className="font-display text-4xl md:text-5xl text-ink mb-4 text-balance">{page.h1}</h1>
        <p className="text-lg text-ink-muted leading-relaxed max-w-2xl mx-auto">
          {page.heroCopy[0]}
        </p>
        {/* CTA labels duplicated verbatim from this page's CTA band below. */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <TrackedCtaLink
            href="/auth/register"
            eventLabel="Get started free"
            className="btn-brand h-12 w-full px-8 text-base sm:w-auto"
          >
            Get started free
          </TrackedCtaLink>
          <TrackedCtaLink
            href="/pricing"
            eventLabel="View pricing"
            className="btn-brand-outline h-12 w-full px-8 text-base sm:w-auto"
          >
            View pricing
          </TrackedCtaLink>
        </div>
      </MarketingImageHero>

      <section className="section-pad-sm bg-surface-elevated">
        <div className="container-narrow">
          <Reveal>
            <div className="glass-panel px-4 py-8 sm:px-6 md:px-8 md:py-10">
              <MarketingStatStrip stats={page.stats} />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="container-narrow grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
          <Reveal className="min-w-0 space-y-4 text-ink-muted leading-relaxed">
            {page.heroCopy.slice(1).map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
            <p>
              Full parameters and response shapes live in the{' '}
              <Link href="/docs" prefetch={false} className={INLINE_LINK_CLASS}>
                API documentation
              </Link>
              , and you can try every endpoint in the{' '}
              <Link href="/playground" prefetch={false} className={INLINE_LINK_CLASS}>
                playground
              </Link>{' '}
              without signing up.
            </p>
          </Reveal>
          <Reveal delay={120} className="relative min-w-0">
            <div
              className="absolute -inset-3 rounded-2xl bg-brand/10 blur-2xl pointer-events-none"
              aria-hidden
            />
            <div className="relative">
              <CapabilityCodeWindow title={page.codeSample.title} code={page.codeSample.code} />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section-pad bg-surface-elevated">
        <div className="container-narrow">
          <Reveal>
            <MarketingSectionHeader
              label="Capabilities"
              title={`What the ${page.h1.toLowerCase()} gives you`}
            />
          </Reveal>
          <RevealGroup
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5"
            itemClassName="h-full min-w-0"
          >
            {page.features.map((feature) => (
              <MarketingFeatureCard
                key={feature.title}
                icon={FEATURE_ICONS[feature.icon]}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </RevealGroup>
        </div>
      </section>

      <RelatedResources links={page.related} />

      <section className="section-pad bg-surface-elevated border-b border-surface-border/60" aria-labelledby="capability-faq-heading">
        <div className="container-narrow">
          <Reveal>
            <MarketingSectionHeader
              id="capability-faq-heading"
              title={`${page.h1}: frequently asked questions`}
            />
          </Reveal>
          <Reveal delay={120}>
            <FaqList items={page.faqs} />
          </Reveal>
        </div>
      </section>

      <Testimonials />

      <MarketingCtaBand
        title="Start building today"
        description="Create a free account, generate an API key, and make your first request in minutes."
        primaryHref="/auth/register"
        primaryLabel="Get started free"
        secondaryHref="/pricing"
        secondaryLabel="View pricing"
      />
    </div>
  )
}
