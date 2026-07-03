import Link from 'next/link'
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
import { solutionPath, type SolutionPage } from '@/lib/solutions-data'

export function SolutionPageView({ page }: { page: SolutionPage }) {
  const path = solutionPath(page.slug)

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

      <MarketingImageHero compact centered waveTone="white">
        <p className="marketing-hero-badge mb-4 inline-flex">{page.heroBadge}</p>
        <h1 className="font-display text-4xl md:text-5xl text-ink mb-4 text-balance">{page.h1}</h1>
        <p className="text-lg text-ink-muted leading-relaxed max-w-2xl mx-auto">{page.intro[0]}</p>
      </MarketingImageHero>

      <section className="section-pad bg-white -mt-1">
        <div className="container-narrow max-w-3xl space-y-4 text-ink-muted leading-relaxed">
          {page.intro.slice(1).map((paragraph) => (
            <p key={paragraph.slice(0, 40)}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section className="section-pad bg-surface-elevated">
        <div className="container-narrow">
          <MarketingSectionHeader label="Why teams choose us" title="Built for your product's hardest problems" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {page.painPoints.map((point) => (
              <div key={point.title} className={`${marketingCardClass} p-6`}>
                <h3 className="text-lg font-semibold text-ink mb-2">{point.title}</h3>
                <p className="text-sm text-ink-muted leading-relaxed">{point.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-narrow max-w-3xl">
          <MarketingSectionHeader
            label="How it maps"
            title="Product needs → API endpoints"
            description="Each need in your roadmap maps to a documented endpoint you can try in the playground today."
          />
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-surface-border rounded-brand overflow-hidden">
              <thead>
                <tr className="bg-surface-elevated text-left">
                  <th scope="col" className="px-4 py-3 font-semibold text-ink">Product need</th>
                  <th scope="col" className="px-4 py-3 font-semibold text-ink">Endpoint</th>
                </tr>
              </thead>
              <tbody>
                {page.endpointMap.map((row) => (
                  <tr key={row.need} className="border-t border-surface-border">
                    <td className="px-4 py-3 text-ink-muted">{row.need}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={row.href}
                        prefetch={false}
                        className="text-brand-strong font-medium hover:underline"
                      >
                        <code className="text-xs">{row.endpoint}</code>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="section-pad bg-surface-elevated" aria-label="Frequently asked questions">
        <div className="container-narrow">
          <MarketingSectionHeader title={`${page.h1}: frequently asked questions`} />
          <FaqList items={page.faqs} />
        </div>
      </section>

      <RelatedResources links={page.related} />

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
