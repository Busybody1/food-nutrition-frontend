import type { Metadata } from 'next'
import { buildPublicPageMetadata } from '@/lib/build-public-metadata'
import { PublicPageSchema } from '@/components/seo/public-page-schema'
import { PricingSeoContent } from '@/components/seo/public-page-seo-content'
import { FaqSection } from '@/components/marketing/faq-section'
import { MarketingCtaBand } from '@/components/marketing/marketing-shell'
import { PRICING_FAQS } from '@/lib/faq-data'
import { getPublicPageSeo } from '@/lib/public-page-seo'

export const metadata: Metadata = buildPublicPageMetadata('/pricing')

const PRICING_SEO = getPublicPageSeo('/pricing')

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PublicPageSchema
        path="/pricing"
        pageName={PRICING_SEO.title ?? 'Nutrition API pricing'}
        includeProduct
        speakable
      />
      {children}
      <PricingSeoContent />
      {}
      <div className="bg-surface-elevated">
        <FaqSection items={PRICING_FAQS} />
      </div>
      <MarketingCtaBand
        title="Ready to integrate?"
        description="Create an account, generate an API key, and start searching in minutes."
        primaryHref="/auth/register"
        primaryLabel="Get started free"
        secondaryHref="/contact?inquiry=enterprise"
        secondaryLabel="Schedule a call"
      />
    </>
  )
}
