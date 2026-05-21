import type { Metadata } from 'next'
import Script from 'next/script'
import { FaqSection, FAQ_JSON_LD } from '@/components/marketing/faq-section'
import { MarketingHero } from '@/components/marketing/marketing-hero'
import { absoluteUrl, SITE_NAME } from '@/lib/site'

export const metadata: Metadata = {
  title: 'FAQ',
  description: `Frequently asked questions about ${SITE_NAME} — authentication, search, pricing, and integration.`,
  alternates: { canonical: absoluteUrl('/faq') },
}

export default function FaqPage() {
  return (
    <div className="marketing-page">
      <Script
        id="faq-page-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }}
      />
      <MarketingHero
        title="FAQ"
        subtitle="Authentication, search, pricing, and integration — answered for developers."
        compact
      />
      <FaqSection showIntro={false} />
    </div>
  )
}
