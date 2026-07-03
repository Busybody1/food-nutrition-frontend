import type { Metadata } from 'next'
import { LegalPageShell } from '@/components/marketing/legal-document'
import { TERMS_EFFECTIVE_DATE, termsSections } from '@/content/legal/terms'
import { buildPublicPageMetadata } from '@/lib/build-public-metadata'
import { PublicPageSchema } from '@/components/seo/public-page-schema'

export const metadata: Metadata = buildPublicPageMetadata('/terms')

export default function TermsPage() {
  return (
    <>
      <PublicPageSchema path="/terms" pageName="Terms of Service" />
      <LegalPageShell
        title="Terms and Conditions"
        tagline="API Usage Agreement"
        effectiveDate={TERMS_EFFECTIVE_DATE}
        path="/terms"
        sections={termsSections}
      />
    </>
  )
}
