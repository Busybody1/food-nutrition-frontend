import { Check } from 'lucide-react'
import { SITE_NAME } from '@/lib/site'
import { MarketingImageHero } from '@/components/marketing/marketing-image-hero'
import {
  MarketingCtaBand,
  MarketingSectionHeader,
  marketingCardClass,
} from '@/components/marketing/marketing-shell'
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

  return (
    <div className="marketing-page">
      <JsonLdScript
        id={`webpage-compare-${page.slug}`}
        data={buildWebPageJsonLd({ name: page.h1, description: page.description, path })}
      />
      <JsonLdScript
        id={`breadcrumb-compare-${page.slug}`}
        data={buildBreadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Compare', path: '/compare' },
          { name: page.h1, path },
        ])}
      />
      <JsonLdScript id={`faq-compare-${page.slug}`} data={buildFaqPageJsonLd(page.faqs)} />

      <MarketingImageHero compact centered waveTone="white">
        <p className="marketing-hero-badge mb-4 inline-flex">Comparison</p>
        <h1 className="font-display text-4xl md:text-5xl text-ink mb-4 text-balance">
          {page.h1}: {SITE_NAME} vs {page.competitor}
        </h1>
        <p className="text-lg text-ink-muted leading-relaxed max-w-2xl mx-auto">{page.intro[0]}</p>
        {/* CTA labels/hrefs duplicated verbatim from this page's MarketingCtaBand below. */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <TrackedCtaLink
            href="/playground"
            eventLabel="Open the playground"
            className="btn-brand w-full sm:w-auto"
          >
            Open the playground
          </TrackedCtaLink>
          <TrackedCtaLink
            href="/auth/register"
            eventLabel="Get a free API key"
            className="btn-brand-outline w-full sm:w-auto"
          >
            Get a free API key
          </TrackedCtaLink>
        </div>
      </MarketingImageHero>

      <section className="section-pad-sm bg-white">
        <div className="container-prose space-y-4 text-ink-muted leading-relaxed">
          {page.intro.slice(1).map((paragraph) => (
            <p key={paragraph.slice(0, 40)}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section className="section-pad bg-surface-elevated" aria-label="Feature comparison">
        <div className="container-narrow">
          <Reveal>
            <MarketingSectionHeader
              label="Side by side"
              title={`${SITE_NAME} vs ${page.competitor}`}
            />
          </Reveal>
          <Reveal delay={80}>
            <div className="overflow-x-auto rounded-brand border border-surface-border bg-white shadow-glass">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="bg-brand-muted/50 text-left">
                    <th scope="col" className="px-4 py-3 font-semibold text-ink">Dimension</th>
                    <th
                      scope="col"
                      className="border-t-2 border-brand bg-brand-muted px-4 py-3 font-semibold text-brand-strong"
                    >
                      {SITE_NAME}
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold text-ink">{page.competitor}</th>
                  </tr>
                </thead>
                <tbody>
                  {page.matrix.map((row) => (
                    <tr
                      key={row.dimension}
                      className="border-t border-surface-border align-top odd:bg-surface-elevated/50"
                    >
                      <th scope="row" className="px-4 py-3 text-left font-medium text-ink">
                        {row.dimension}
                      </th>
                      <td className="bg-brand-muted/30 px-4 py-3 text-ink-muted">{row.us}</td>
                      <td className="px-4 py-3 text-ink-muted">{row.them}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mx-auto mt-4 max-w-3xl text-center text-xs text-ink-muted">
              {COMPARISON_DISCLAIMER(page.asOf)}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="container-narrow">
          <RevealGroup className="grid gap-4 md:grid-cols-2 md:gap-5" itemClassName="h-full min-w-0">
            <div className={`${marketingCardClass} card-hairline h-full p-6`}>
              <h2 className="mb-4 text-lg font-semibold text-ink">
                When {SITE_NAME} is the better fit
              </h2>
              <ul className="space-y-3 text-sm leading-relaxed text-ink-muted">
                {page.whenWeFit.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-strong" aria-hidden />
                    <span className="min-w-0">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className={`${marketingCardClass} h-full p-6`}>
              <h2 className="mb-4 text-lg font-semibold text-ink">
                When {page.competitor} is the better fit
              </h2>
              <ul className="space-y-3 text-sm leading-relaxed text-ink-muted">
                {page.whenTheyFit.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ink-dim" aria-hidden />
                    <span className="min-w-0">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </RevealGroup>
        </div>
      </section>

      <section className="section-pad bg-surface-elevated">
        <div className="container-narrow">
          <Reveal>
            <MarketingSectionHeader title={`Migrating from ${page.competitor}`} />
          </Reveal>
          <Reveal delay={80}>
            <div className="mx-auto max-w-3xl space-y-4 leading-relaxed text-ink-muted">
              {page.migration.map((paragraph) => (
                <p key={paragraph.slice(0, 40)}>{paragraph}</p>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <RelatedResources links={page.related} />

      <section className="section-pad bg-surface-elevated" aria-label="Frequently asked questions">
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
