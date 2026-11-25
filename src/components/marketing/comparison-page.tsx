import { Check } from 'lucide-react'
import { SITE_NAME } from '@/lib/site'
import {
  MarketingCtaBand,
  MarketingSectionHeader,
  marketingCardClass,
} from '@/components/marketing/marketing-shell'
import { MarketingSheet, MarketingSheetHero } from '@/components/marketing/marketing-sheet'
import { FaqList } from '@/components/marketing/faq-section'
import { Reveal, RevealGroup } from '@/components/marketing/reveal'
import { TrackedCtaLink } from '@/components/analytics/tracked-cta-link'
import { JsonLdScript } from '@/components/seo/structured-data'
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from '@/lib/seo-jsonld'
import { buildFaqPageJsonLd } from '@/lib/faq-data'
import { RelatedResources } from '@/components/seo/related-resources'
import {
  COMPARISON_DISCLAIMER,
  comparisonPath,
  type ComparisonPage,
} from '@/lib/comparisons-data'

export function ComparisonPageView({ page }: { page: ComparisonPage }) {
  const path = comparisonPath(page.slug)
  const headline = `${page.h1}: ${SITE_NAME} vs ${page.competitor}`

  return (
    <div className="marketing-page">
      <JsonLdScript
        id={`webpage-compare-${page.slug}`}
        data={buildWebPageJsonLd({
          name: headline,
          description: page.intro[0],
          path,
          speakable: true,
        })}
      />
      <JsonLdScript
        id={`breadcrumb-compare-${page.slug}`}
        data={buildBreadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Compare', path: '/compare' },
          { name: headline, path },
        ])}
      />
      <JsonLdScript id={`faq-compare-${page.slug}`} data={buildFaqPageJsonLd(page.faqs)} />

      <MarketingSheetHero
        badge="Comparison"
        title={headline}
        lead={page.intro[0]}
        leadClassName="aeo-answer"
        actions={
          <>
            <TrackedCtaLink href="/playground" eventLabel="Open the playground" className="btn-brand">
              Open the playground
            </TrackedCtaLink>
            <TrackedCtaLink href="/auth/register" eventLabel="Get a free API key" className="btn-brand-outline">
              Get a free API key
            </TrackedCtaLink>
          </>
        }
      />

      {page.intro.length > 1 && (
        <section className="marketing-canvas-pad">
          <div className="container-prose marketing-body space-y-4">
            {page.intro.slice(1).map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
          </div>
        </section>
      )}

      <MarketingSheet aria-label="Feature comparison">
        <div className="container-narrow">
          <Reveal>
            <MarketingSectionHeader title={`${SITE_NAME} vs ${page.competitor}`} />
          </Reveal>
          <Reveal delay={80}>
            <div className="overflow-x-auto rounded-[22px] border border-mk-hair bg-white shadow-card">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="bg-mk-stage text-left">
                    <th scope="col" className="px-5 py-3.5 font-semibold text-mk-ink">Dimension</th>
                    <th scope="col" className="bg-mk-hair/60 px-5 py-3.5 font-semibold text-mk-ink">
                      {SITE_NAME}
                    </th>
                    <th scope="col" className="px-5 py-3.5 font-semibold text-mk-ink">{page.competitor}</th>
                  </tr>
                </thead>
                <tbody>
                  {page.matrix.map((row) => (
                    <tr key={row.dimension} className="border-t border-mk-hair align-top">
                      <th scope="row" className="px-5 py-3.5 text-left font-medium text-mk-ink">
                        {row.dimension}
                      </th>
                      <td className="bg-mk-stage px-5 py-3.5 font-medium text-mk-ink">{row.us}</td>
                      <td className="px-5 py-3.5 text-mk-muted">{row.them}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mx-auto mt-4 max-w-3xl text-center text-xs text-mk-muted">
              {COMPARISON_DISCLAIMER(page.asOf)}
            </p>
          </Reveal>
        </div>
      </MarketingSheet>

      <section className="marketing-canvas-pad">
        <div className="container-narrow">
          <RevealGroup className="grid gap-4 md:grid-cols-2 md:gap-5" itemClassName="h-full min-w-0">
            <div className={`${marketingCardClass} h-full p-6 md:p-8`}>
              <h2 className="mb-4 text-lg font-semibold tracking-[-0.01em] text-mk-ink">
                When {SITE_NAME} is the better fit
              </h2>
              <ul className="space-y-3 text-[15px] leading-relaxed text-mk-muted">
                {page.whenWeFit.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <Check className="mt-1 h-4 w-4 shrink-0 text-mk-green" aria-hidden />
                    <span className="min-w-0">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className={`${marketingCardClass} h-full p-6 md:p-8`}>
              <h2 className="mb-4 text-lg font-semibold tracking-[-0.01em] text-mk-ink">
                When {page.competitor} is the better fit
              </h2>
              <ul className="space-y-3 text-[15px] leading-relaxed text-mk-muted">
                {page.whenTheyFit.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-mk-muted/50" aria-hidden />
                    <span className="min-w-0">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </RevealGroup>
        </div>
      </section>

      <MarketingSheet>
        <div className="container-narrow">
          <Reveal>
            <MarketingSectionHeader title={`Migrating from ${page.competitor}`} />
          </Reveal>
          <Reveal delay={80}>
            <div className="marketing-body mx-auto max-w-3xl space-y-4">
              {page.migration.map((paragraph) => (
                <p key={paragraph.slice(0, 40)}>{paragraph}</p>
              ))}
            </div>
          </Reveal>
        </div>
      </MarketingSheet>

      <RelatedResources links={page.related} />

      <section className="marketing-canvas-pad" aria-label="Frequently asked questions">
        <div className="container-narrow">
          <Reveal>
            <MarketingSectionHeader title={`${page.h1}: frequently asked questions`} />
          </Reveal>
          <Reveal delay={80}>
            <FaqList items={page.faqs} />
          </Reveal>
        </div>
      </section>

      <MarketingCtaBand
        title={`Try ${SITE_NAME} against your real queries`}
        description="The public playground needs no signup. Run your users' actual foods and barcodes through it before you decide."
        primaryHref="/playground"
        primaryLabel="Open the playground"
        secondaryHref="/auth/register"
        secondaryLabel="Get a free API key"
      />
    </div>
  )
}
