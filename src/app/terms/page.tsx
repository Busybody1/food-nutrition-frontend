import type { Metadata } from 'next'
import { LegalDocumentBody, LegalPageShell } from '@/components/marketing/legal-document'
import { TERMS_EFFECTIVE_DATE, termsSections } from '@/content/legal/terms'
import { absoluteUrl } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Terms and Conditions',
  description: 'API usage agreement governing access to Food Database API services.',
  alternates: { canonical: absoluteUrl('/terms') },
}

const LEGAL_DISCLAIMER =
  'These documents are templates and do not constitute legal advice. Please consult a qualified attorney.'

export default function TermsPage() {
  return (
    <LegalPageShell
      title="Terms and Conditions"
      tagline="API Usage Agreement"
      effectiveDate={TERMS_EFFECTIVE_DATE}
      footerNote={LEGAL_DISCLAIMER}
    >
      <LegalDocumentBody sections={termsSections} />
    </LegalPageShell>
  )
}
