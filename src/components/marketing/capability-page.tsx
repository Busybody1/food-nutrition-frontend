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
import {
  MarketingCtaBand,
  MarketingFeatureGrid,
  MarketingSectionHeader,
  MarketingStatStrip,
} from '@/components/marketing/marketing-shell'
import { MarketingSheet, MarketingSheetHero, MarketingSplit } from '@/components/marketing/marketing-sheet'
import { FaqList } from '@/components/marketing/faq-section'
import { CapabilityCodeWindow } from '@/components/marketing/capability-code-window'
import { Testimonials } from '@/components/marketing/testimonials'
import { Reveal } from '@/components/marketing/reveal'
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

const INLINE_LINK_CLASS =
  'text-brand-strong font-medium underline decoration-brand/40 underline-offset-2 ' +
  'hover:decoration-brand-strong rounded-sm focus-visible:outline-none ' +
  'focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2'

export function CapabilityPageView({ page }: { page: CapabilityPage }) {
  const path = capabilityPath(page.slug)

  return (
    <div className="marketing-page">
      <JsonLdScript
        id={`webpage-${page.slug}`}
        data={buildWebPageJsonLd({
          name: page.h1,
          description: page.heroCopy[0],
          path,
          speakable: true,
        })}
      />
      <JsonLdScript
        id={`breadcrumb-${page.slug}`}
        data={buildBreadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: page.h1, path },
        ])}
      />
      <JsonLdScript id={`faq-${page.slug}`} data={buildFaqPageJsonLd(page.faqs)} />

      <MarketingSheetHero
        badge={page.heroBadge}
        title={page.h1}
        lead={page.heroCopy[0]}
        leadClassName="aeo-answer"
        actions={
          <>
            <TrackedCtaLink href="/auth/register" eventLabel="Get started free" className="btn-brand">
              Get started free
            </TrackedCtaLink>
            <TrackedCtaLink href="/pricing" eventLabel="View pricing" className="btn-brand-outline">
              View pricing
            </TrackedCtaLink>
          </>
        }
      />

      <section className="py-10 md:py-14" aria-label="Platform stats">
        <div className="container-narrow">
          <Reveal>
            <MarketingStatStrip stats={page.stats} />
          </Reveal>
        </div>
      </section>

      <MarketingSheet aria-labelledby={`capability-features-${page.slug}`}>
        <div className="container-narrow">
          <Reveal>
            <MarketingSectionHeader
              id={`capability-features-${page.slug}`}
              title={`What the ${page.h1} gives you`}
            />
          </Reveal>
          <MarketingFeatureGrid
            items={page.features.map((feature) => ({
              icon: FEATURE_ICONS[feature.icon],
              title: feature.title,
              description: feature.description,
            }))}
          />
        </div>
      </MarketingSheet>

      <MarketingSheet>
        <div className="container-narrow">
          <MarketingSplit
            copy={
              <Reveal className="marketing-body max-w-xl space-y-4">
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
            }
            aside={
              <Reveal delay={120} className="min-w-0">
                <div className="marketing-callout p-3 sm:p-6 md:p-8">
                  <CapabilityCodeWindow title={page.codeSample.title} code={page.codeSample.code} />
                </div>
              </Reveal>
            }
          />
        </div>
      </MarketingSheet>

      {page.extraSections && page.extraSections.length > 0 && (
        <MarketingSheet>
          <div className="container-prose space-y-14 md:space-y-16">
            {page.extraSections.map((section) => {
              const slug = section.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '')
              const headingId = `capability-extra-${slug}`
              return (
                <section key={section.title} aria-labelledby={headingId}>
                  <Reveal>
                    <h2 id={headingId} className="marketing-h3 mb-5">
                      {section.title}
                    </h2>
                  </Reveal>
                  <Reveal delay={80} className="marketing-body space-y-4">
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph.slice(0, 48)}>{paragraph}</p>
                    ))}
                  </Reveal>
                </section>
              )
            })}
          </div>
        </MarketingSheet>
      )}

      <RelatedResources links={page.related} />

      <section className="marketing-canvas-pad" aria-labelledby="capability-faq-heading">
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
