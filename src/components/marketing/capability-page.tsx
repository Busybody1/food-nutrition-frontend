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
  ArrowRight,
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
import { DocsCodeBlock } from '@/components/docs/docs-code-block'
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

      <MarketingImageHero compact centered waveTone="white">
        <p className="marketing-hero-badge mb-4 inline-flex">{page.heroBadge}</p>
        <h1 className="font-display text-4xl md:text-5xl text-ink mb-4 text-balance">{page.h1}</h1>
        <p className="text-lg text-ink-muted leading-relaxed max-w-2xl mx-auto">
          {page.heroCopy[0]}
        </p>
      </MarketingImageHero>

      <section className="section-pad bg-surface-elevated -mt-1">
        <div className="container-narrow">
          <MarketingStatStrip stats={page.stats} />
        </div>
      </section>

      <section className="section-pad">
        <div className="container-narrow grid lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-4 text-ink-muted leading-relaxed">
            {page.heroCopy.slice(1).map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
            <p>
              Full parameters and response shapes live in the{' '}
              <Link href="/docs" prefetch={false} className="text-brand-strong font-medium hover:underline">
                API documentation
              </Link>
              , and you can try every endpoint in the{' '}
              <Link href="/playground" prefetch={false} className="text-brand-strong font-medium hover:underline">
                playground
              </Link>{' '}
              without signing up.
            </p>
          </div>
          <DocsCodeBlock title={page.codeSample.title} code={page.codeSample.code} copyable />
        </div>
      </section>

      <section className="section-pad bg-surface-elevated">
        <div className="container-narrow">
          <MarketingSectionHeader
            label="Capabilities"
            title={`What the ${page.h1.toLowerCase()} gives you`}
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {page.features.map((feature) => (
              <MarketingFeatureCard
                key={feature.title}
                icon={FEATURE_ICONS[feature.icon]}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad" aria-label="Frequently asked questions">
        <div className="container-narrow">
          <MarketingSectionHeader title={`${page.h1} — frequently asked questions`} />
          <FaqList items={page.faqs} />
        </div>
      </section>

      <RelatedResources links={page.related} />

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
