import type { Metadata } from 'next'
import { FaqList } from '@/components/marketing/faq-section'
import { ALL_FAQ_ITEMS, FAQ_GROUPS, buildFaqPageJsonLd } from '@/lib/faq-data'
import { JsonLdScript } from '@/components/seo/structured-data'
import { MarketingImageHero } from '@/components/marketing/marketing-image-hero'
import { buildPublicPageMetadata } from '@/lib/build-public-metadata'
import { PublicPageSchema } from '@/components/seo/public-page-schema'
import { FaqSeoIntro } from '@/components/seo/public-page-seo-content'

export const metadata: Metadata = buildPublicPageMetadata('/faq')

export default function FaqPage() {
  return (
    <div className="marketing-page">
      <PublicPageSchema path="/faq" pageName="FAQ" />
      <MarketingImageHero compact centered waveTone="white">
        <h1 className="font-display text-4xl md:text-5xl text-ink mb-4">FAQ</h1>
        <p className="text-lg text-ink-muted leading-relaxed">
          Authentication, search, pricing, and integration, answered for developers.
        </p>
      </MarketingImageHero>
      <FaqSeoIntro />
      <section className="section-pad pt-8 md:pt-10 -mt-1" id="faq" aria-label="Frequently asked questions">
        <div className="container-narrow space-y-10">
          {FAQ_GROUPS.map((group) => (
            <div key={group.id} id={group.id}>
              <h2 className="font-display text-2xl md:text-3xl text-ink mb-5 text-center">
                {group.title}
              </h2>
              <FaqList items={group.items} openFirst={group.id === 'general'} />
            </div>
          ))}
        </div>
      </section>
      <JsonLdScript id="faq-page-jsonld" data={buildFaqPageJsonLd(ALL_FAQ_ITEMS)} />
    </div>
  )
}
