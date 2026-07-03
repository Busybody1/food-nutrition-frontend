import Link from 'next/link'
import {
  BadgeCheck,
  Blocks,
  Building2,
  Database,
  FileCheck,
  Lock,
  Microscope,
  Network,
  PackageSearch,
  Scale,
  ShieldCheck,
  Tags,
  WheatOff,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { MarketingImageHero } from '@/components/marketing/marketing-image-hero'
import {
  MarketingCtaBand,
  MarketingFeatureCard,
  MarketingSectionHeader,
} from '@/components/marketing/marketing-shell'
import { FaqList } from '@/components/marketing/faq-section'
import { Reveal, RevealGroup } from '@/components/marketing/reveal'
import { TrackedCtaLink } from '@/components/analytics/tracked-cta-link'
import { JsonLdScript } from '@/components/seo/structured-data'
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from '@/lib/seo-jsonld'
import { buildFaqPageJsonLd } from '@/lib/faq-data'
import { RelatedResources } from '@/components/seo/related-resources'
import { solutionPath, type SolutionPage } from '@/lib/solutions-data'

/**
 * Decorative icons for the pain-point cards, keyed by solution slug and
 * ordered to match `painPoints` in solutions-data (data file stays untouched).
 */
const PAIN_POINT_ICONS: Record<string, LucideIcon[]> = {
  'fitness-apps': [Zap, ShieldCheck, Database],
  'meal-planning-apps': [Database, Scale, Tags],
  healthcare: [BadgeCheck, Lock, Microscope],
  'grocery-retail': [PackageSearch, WheatOff, Network],
  'wellness-saas': [Blocks, Building2, FileCheck],
}

const DEFAULT_PAIN_POINT_ICONS: LucideIcon[] = [Zap, ShieldCheck, Database]

export function SolutionPageView({ page }: { page: SolutionPage }) {
  const path = solutionPath(page.slug)
  const painPointIcons = PAIN_POINT_ICONS[page.slug] ?? DEFAULT_PAIN_POINT_ICONS

  return (
    <div className="marketing-page">
      <JsonLdScript
        id={`webpage-solution-${page.slug}`}
        data={buildWebPageJsonLd({ name: page.h1, description: page.description, path })}
      />
      <JsonLdScript
        id={`breadcrumb-solution-${page.slug}`}
        data={buildBreadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Solutions', path: '/solutions' },
          { name: page.h1, path },
        ])}
      />
      <JsonLdScript id={`faq-solution-${page.slug}`} data={buildFaqPageJsonLd(page.faqs)} />

      <MarketingImageHero compact centered waveTone="elevated">
        <p className="marketing-hero-badge mb-4 inline-flex">{page.heroBadge}</p>
        <h1 className="font-display text-4xl md:text-5xl text-ink mb-4 text-balance">{page.h1}</h1>
        <p className="text-lg text-ink-muted leading-relaxed max-w-2xl mx-auto">{page.intro[0]}</p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <TrackedCtaLink
            href="/auth/register"
            eventLabel="Get started free"
            className="btn-brand h-12 px-8 text-base w-full sm:w-auto"
          >
            Get started free
          </TrackedCtaLink>
          <TrackedCtaLink
            href="/docs/guides"
            eventLabel="Browse integration guides"
            className="btn-brand-outline h-12 px-8 text-base w-full sm:w-auto"
          >
            Browse integration guides
          </TrackedCtaLink>
        </div>
      </MarketingImageHero>

      <section className="section-pad-sm bg-surface-elevated">
        <Reveal className="container-prose space-y-4 text-ink-muted leading-relaxed">
          {page.intro.slice(1).map((paragraph) => (
            <p key={paragraph.slice(0, 40)}>{paragraph}</p>
          ))}
        </Reveal>
      </section>

      <section className="section-pad bg-white">
        <div className="container-narrow">
          <Reveal>
            <MarketingSectionHeader label="Why teams choose us" title="Built for your product's hardest problems" />
          </Reveal>
          <RevealGroup className="grid gap-4 md:gap-5 md:grid-cols-3" itemClassName="h-full min-w-0">
            {page.painPoints.map((point, index) => (
              <MarketingFeatureCard
                key={point.title}
                icon={painPointIcons[index] ?? DEFAULT_PAIN_POINT_ICONS[index % DEFAULT_PAIN_POINT_ICONS.length]}
                title={point.title}
                description={point.description}
              />
            ))}
          </RevealGroup>
        </div>
      </section>

      <section className="section-pad bg-surface-elevated">
        <div className="container-prose">
          <Reveal>
            <MarketingSectionHeader
              label="How it maps"
              title="Product needs → API endpoints"
              description="Each need in your roadmap maps to a documented endpoint you can try in the playground today."
            />
          </Reveal>
          <Reveal delay={120}>
            <div className="overflow-x-auto rounded-brand border border-surface-border bg-white shadow-glass">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="bg-brand-muted/50 text-left">
                    <th scope="col" className="px-4 py-3 font-semibold text-ink">Product need</th>
                    <th scope="col" className="px-4 py-3 font-semibold text-ink">Endpoint</th>
                  </tr>
                </thead>
                <tbody>
                  {page.endpointMap.map((row) => (
                    <tr
                      key={row.need}
                      className="border-t border-surface-border odd:bg-surface-elevated/50 hover:bg-brand-muted/30 transition-colors duration-200"
                    >
                      <th scope="row" className="px-4 py-3 font-medium text-ink text-left">
                        {row.need}
                      </th>
                      <td className="px-4 py-3">
                        <Link
                          href={row.href}
                          prefetch={false}
                          className="inline-flex rounded cursor-pointer hover:underline decoration-brand/40 underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2"
                        >
                          <code className="whitespace-nowrap rounded bg-brand-muted/60 px-1.5 py-0.5 font-mono text-[13px] text-brand-strong">
                            {row.endpoint}
                          </code>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </section>

      <RelatedResources links={page.related} />

      <section className="section-pad bg-surface-elevated" aria-labelledby="solution-faq-heading">
        <div className="container-narrow">
          <Reveal>
            <MarketingSectionHeader
              id="solution-faq-heading"
              title={`${page.h1}: frequently asked questions`}
            />
          </Reveal>
          <Reveal delay={120}>
            <FaqList items={page.faqs} />
          </Reveal>
        </div>
      </section>

      <MarketingCtaBand
        title="Ship nutrition features this sprint"
        description="Create a free account, explore the playground, and integrate with your stack using our framework guides."
        primaryHref="/auth/register"
        primaryLabel="Get started free"
        secondaryHref="/docs/guides"
        secondaryLabel="Browse integration guides"
      />
    </div>
  )
}
