import type { Metadata } from 'next'
import { FaqSection } from '@/components/marketing/faq-section'
import { FAQ_JSON_LD } from '@/lib/faq-data'
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
      <FaqSection showIntro={false} />
      <JsonLdScript id="faq-page-jsonld" data={FAQ_JSON_LD} />
    </div>
  )
}
