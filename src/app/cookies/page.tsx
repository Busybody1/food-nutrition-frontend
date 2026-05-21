import type { Metadata } from 'next'
import { LegalDocumentBody, LegalPageShell } from '@/components/marketing/legal-document'
import { COOKIES_EFFECTIVE_DATE, cookiesSections } from '@/content/legal/cookies'
import { absoluteUrl } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'How Food Database API uses cookies on the developer portal.',
  alternates: { canonical: absoluteUrl('/cookies') },
}

const LEGAL_DISCLAIMER =
  'These documents are templates and do not constitute legal advice. Please consult a qualified attorney.'

export default function CookiesPage() {
  return (
    <LegalPageShell
      title="Cookie Policy"
      tagline="Understanding How We Use Cookies"
      effectiveDate={COOKIES_EFFECTIVE_DATE}
      footerNote={LEGAL_DISCLAIMER}
    >
      <LegalDocumentBody sections={cookiesSections} />
    </LegalPageShell>
  )
}
