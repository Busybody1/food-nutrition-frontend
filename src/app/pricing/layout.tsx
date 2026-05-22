import type { Metadata } from 'next'
import { buildPublicPageMetadata } from '@/lib/build-public-metadata'
import { PublicPageSchema } from '@/components/seo/public-page-schema'
import { PricingSeoContent } from '@/components/seo/public-page-seo-content'

export const metadata: Metadata = buildPublicPageMetadata('/pricing')

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PublicPageSchema path="/pricing" pageName="Pricing" includeProduct />
      {children}
      <PricingSeoContent />
    </>
  )
}
