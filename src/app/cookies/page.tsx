import type { Metadata } from 'next'
import { LegalDocumentBody, LegalPageShell } from '@/components/marketing/legal-document'
import { COOKIES_EFFECTIVE_DATE, cookiesSections } from '@/content/legal/cookies'
import { buildPublicPageMetadata } from '@/lib/build-public-metadata'
import { PublicPageSchema } from '@/components/seo/public-page-schema'

export const metadata: Metadata = buildPublicPageMetadata('/cookies')

const LEGAL_DISCLAIMER =
  'These documents are templates and do not constitute legal advice. Please consult a qualified attorney.'

export default function CookiesPage() {
  return (
    <>
      <PublicPageSchema path="/cookies" pageName="Cookie Policy" />
      <LegalPageShell
      title="Cookie Policy"
      tagline="Understanding How We Use Cookies"
      effectiveDate={COOKIES_EFFECTIVE_DATE}
      footerNote={LEGAL_DISCLAIMER}
    >
      <LegalDocumentBody sections={cookiesSections} />
    </LegalPageShell>
    </>
  )
}
