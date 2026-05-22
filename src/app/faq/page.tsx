import type { Metadata } from 'next'
import Script from 'next/script'
import { FaqSection, FAQ_JSON_LD } from '@/components/marketing/faq-section'
import { MarketingImageHero } from '@/components/marketing/marketing-image-hero'
import { SITE_NAME } from '@/lib/site'
import { buildPageMetadata } from '@/lib/metadata'

export const metadata: Metadata = buildPageMetadata({
  title: 'FAQ',
  description: `Frequently asked questions about ${SITE_NAME} — authentication, search, pricing, and integration.`,
  path: '/faq',
})

export default function FaqPage() {
  return (
    <div className="marketing-page">
      <Script
        id="faq-page-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }}
      />
      <MarketingImageHero compact centered waveTone="white">
        <h1 className="font-display text-4xl md:text-5xl text-ink mb-4">FAQ</h1>
        <p className="text-lg text-ink-muted leading-relaxed">
          Authentication, search, pricing, and integration, answered for developers.
        </p>
      </MarketingImageHero>
      <FaqSection showIntro={false} />
    </div>
  )
}
