import { SITE_NAME } from '@/lib/site'
import { MarketingImageHero } from '@/components/marketing/marketing-image-hero'
import {
  MarketingCtaBand,
  MarketingSectionHeader,
  marketingCardClass,
} from '@/components/marketing/marketing-shell'
import { FaqList } from '@/components/marketing/faq-section'
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
      </MarketingImageHero>

      <section className="section-pad bg-white -mt-1">
        <div className="container-narrow max-w-3xl space-y-4 text-ink-muted leading-relaxed">
          {page.intro.slice(1).map((paragraph) => (
            <p key={paragraph.slice(0, 40)}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section className="section-pad bg-surface-elevated" aria-label="Feature comparison">
        <div className="container-narrow">
          <MarketingSectionHeader
            label="Side by side"
            title={`${SITE_NAME} vs ${page.competitor}`}
          />
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-surface-border rounded-brand overflow-hidden bg-white">
              <thead>
                <tr className="bg-surface-elevated text-left">
                  <th scope="col" className="px-4 py-3 font-semibold text-ink">Dimension</th>
                  <th scope="col" className="px-4 py-3 font-semibold text-ink">{SITE_NAME}</th>
                  <th scope="col" className="px-4 py-3 font-semibold text-ink">{page.competitor}</th>
                </tr>
              </thead>
              <tbody>
                {page.matrix.map((row) => (
                  <tr key={row.dimension} className="border-t border-surface-border align-top">
                    <th scope="row" className="px-4 py-3 font-medium text-ink text-left">
                      {row.dimension}
                    </th>
                    <td className="px-4 py-3 text-ink-muted">{row.us}</td>
                    <td className="px-4 py-3 text-ink-muted">{row.them}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-ink-dim max-w-3xl">{COMPARISON_DISCLAIMER(page.asOf)}</p>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-narrow grid md:grid-cols-2 gap-6">
          <div className={`${marketingCardClass} p-6`}>
            <h2 className="text-xl font-semibold text-ink mb-4">
              When {page.competitor} is the better fit
            </h2>
            <ul className="space-y-3 text-sm text-ink-muted leading-relaxed list-disc pl-5">
              {page.whenTheyFit.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className={`${marketingCardClass} p-6`}>
            <h2 className="text-xl font-semibold text-ink mb-4">
              When {SITE_NAME} is the better fit
            </h2>
            <ul className="space-y-3 text-sm text-ink-muted leading-relaxed list-disc pl-5">
              {page.whenWeFit.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section-pad bg-surface-elevated">
        <div className="container-narrow max-w-3xl">
          <h2 className="font-display text-2xl md:text-3xl text-ink mb-4">
            Migrating from {page.competitor}
          </h2>
          <div className="space-y-4 text-ink-muted leading-relaxed">
            {page.migration.map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
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
        title={`Try ${SITE_NAME} against your real queries`}
        description="The public playground needs no signup — run your users' actual foods and barcodes through it before you decide."
        primaryHref="/playground"
        primaryLabel="Open the playground"
        secondaryHref="/auth/register"
        secondaryLabel="Get a free API key"
      />
    </div>
  )
}
