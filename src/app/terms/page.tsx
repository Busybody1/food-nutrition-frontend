import type { Metadata } from 'next'
import { LegalDocumentBody, LegalPageShell } from '@/components/marketing/legal-document'
import { TERMS_EFFECTIVE_DATE, termsSections } from '@/content/legal/terms'
import { buildPublicPageMetadata } from '@/lib/build-public-metadata'
import { PublicPageSchema } from '@/components/seo/public-page-schema'

export const metadata: Metadata = buildPublicPageMetadata('/terms')

const LEGAL_DISCLAIMER =
  'These documents are templates and do not constitute legal advice. Please consult a qualified attorney.'

export default function TermsPage() {
  return (
    <>
      <PublicPageSchema path="/terms" pageName="Terms of Service" />
      <LegalPageShell
      title="Terms and Conditions"
      tagline="API Usage Agreement"
      effectiveDate={TERMS_EFFECTIVE_DATE}
      footerNote={LEGAL_DISCLAIMER}
    >
      <LegalDocumentBody sections={termsSections} />
    </LegalPageShell>
    </>
  )
}
