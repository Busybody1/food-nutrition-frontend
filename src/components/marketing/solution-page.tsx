import Link from 'next/link'
import { BuildingsIcon, CubeIcon, DatabaseIcon, FileTextIcon, FlaskIcon, GrainsSlashIcon, GraphIcon, LightningIcon, LockIcon, PackageIcon, ScalesIcon, SealCheckIcon, ShieldCheckIcon, TagIcon } from '@phosphor-icons/react/ssr'
import type { MarketingIcon } from '@/components/marketing/marketing-shell'
import {
  MarketingCtaBand,
  MarketingFeatureGrid,
  MarketingSectionHeader,
} from '@/components/marketing/marketing-shell'
import {
  MarketingSheet,
  MarketingSheetHero,
  MarketingSplit,
  MarketingSplitCopy,
} from '@/components/marketing/marketing-sheet'
import { FaqList } from '@/components/marketing/faq-section'
import { Reveal } from '@/components/marketing/reveal'
import { TrackedCtaLink } from '@/components/analytics/tracked-cta-link'
import { JsonLdScript } from '@/components/seo/structured-data'
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from '@/lib/seo-jsonld'
import { buildFaqPageJsonLd } from '@/lib/faq-data'
import { RelatedResources } from '@/components/seo/related-resources'
import { solutionPath, type SolutionPage } from '@/lib/solutions-data'

const PAIN_POINT_ICONS: Record<string, MarketingIcon[]> = {
  'fitness-apps': [LightningIcon, ShieldCheckIcon, DatabaseIcon],
  'meal-planning-apps': [DatabaseIcon, ScalesIcon, TagIcon],
  healthcare: [SealCheckIcon, LockIcon, FlaskIcon],
  'grocery-retail': [PackageIcon, GrainsSlashIcon, GraphIcon],
  'wellness-saas': [CubeIcon, BuildingsIcon, FileTextIcon],
}

const DEFAULT_PAIN_POINT_ICONS: MarketingIcon[] = [LightningIcon, ShieldCheckIcon, DatabaseIcon]

export function SolutionPageView({ page }: { page: SolutionPage }) {
  const path = solutionPath(page.slug)
  const painPointIcons = PAIN_POINT_ICONS[page.slug] ?? DEFAULT_PAIN_POINT_ICONS

  return (
    <div className="marketing-page">
      <JsonLdScript
        id={`webpage-solution-${page.slug}`}
        data={buildWebPageJsonLd({
          name: page.h1,
          description: page.intro[0],
          path,
          speakable: true,
        })}
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

      <MarketingSheetHero
        badge={page.heroBadge}
        title={page.h1}
        lead={page.intro[0]}
        leadClassName="aeo-answer"
        actions={
          <>
            <TrackedCtaLink href="/auth/register" eventLabel="Get started free" className="btn-brand">
              Get started free
            </TrackedCtaLink>
            <TrackedCtaLink
              href="/docs/guides"
              eventLabel="Browse integration guides"
              className="btn-brand-outline"
            >
              Browse integration guides
            </TrackedCtaLink>
          </>
        }
      />

      {(page.intro.length > 1 || page.productLink) && (
        <section className="marketing-canvas-pad">
          <Reveal className="container-prose marketing-body space-y-4">
            {page.intro.slice(1).map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
            {page.productLink && (
              <p>
                {page.productLink.before}{' '}
                <Link
                  href={page.productLink.href}
                  prefetch={false}
                  className="text-brand-strong font-medium underline decoration-brand/40 underline-offset-2 hover:decoration-brand-strong rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                >
                  {page.productLink.label}
                </Link>{' '}
                {page.productLink.after}
              </p>
            )}
          </Reveal>
        </section>
      )}

      <MarketingSheet aria-labelledby={`solution-pain-${page.slug}`}>
        <div className="container-narrow">
          <Reveal>
            <MarketingSectionHeader
              id={`solution-pain-${page.slug}`}
              title="Built for your product's hardest problems"
            />
          </Reveal>
          <MarketingFeatureGrid
            items={page.painPoints.map((point, index) => ({
              icon:
                painPointIcons[index] ??
                DEFAULT_PAIN_POINT_ICONS[index % DEFAULT_PAIN_POINT_ICONS.length],
              title: point.title,
              description: point.description,
            }))}
          />
        </div>
      </MarketingSheet>

      <MarketingSheet aria-labelledby={`solution-map-${page.slug}`}>
        <div className="container-narrow">
          <MarketingSplit
            copy={
              <Reveal>
                <MarketingSplitCopy
                  titleId={`solution-map-${page.slug}`}
                  title="Product needs → API endpoints"
                  description="Each need in your roadmap maps to a documented endpoint you can try in the playground today."
                />
              </Reveal>
            }
            aside={
              <Reveal delay={120}>
                <div className="overflow-x-auto rounded-[22px] border border-mk-hair bg-white shadow-card">
                  <table className="w-full min-w-[520px] text-sm">
                    <thead>
                      <tr className="bg-mk-stage text-left">
                        <th scope="col" className="px-5 py-3.5 font-semibold text-mk-ink">Product need</th>
                        <th scope="col" className="px-5 py-3.5 font-semibold text-mk-ink">Endpoint</th>
                      </tr>
                    </thead>
                    <tbody>
                      {page.endpointMap.map((row) => (
                        <tr
                          key={row.need}
                          className="border-t border-mk-hair transition-colors duration-200 hover:bg-mk-stage/60"
                        >
                          <th scope="row" className="px-5 py-3.5 text-left font-medium text-mk-ink">
                            {row.need}
                          </th>
                          <td className="px-5 py-3.5">
                            <Link
                              href={row.href}
                              prefetch={false}
                              className="inline-flex cursor-pointer rounded decoration-mk-line underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                            >
                              <code className="whitespace-nowrap rounded-md border border-mk-hair bg-mk-stage px-1.5 py-0.5 font-mono text-[13px] text-mk-ink">
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
            }
          />
        </div>
      </MarketingSheet>

      <RelatedResources links={page.related} />

      <section className="marketing-canvas-pad" aria-labelledby="solution-faq-heading">
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
