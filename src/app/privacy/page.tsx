import type { Metadata } from 'next'
import { LegalDocumentBody, LegalPageShell } from '@/components/marketing/legal-document'
import { PRIVACY_EFFECTIVE_DATE, privacySections } from '@/content/legal/privacy'
import { buildPageMetadata } from '@/lib/metadata'

export const metadata: Metadata = buildPageMetadata({
  title: 'Privacy Policy',
  description: 'How Food Database API collects, uses, and protects your personal information.',
  path: '/privacy',
})

const LEGAL_DISCLAIMER =
  'These documents are templates and do not constitute legal advice. Please consult a qualified attorney.'

export default function PrivacyPage() {
  return (
    <LegalPageShell
      title="Privacy Policy"
      tagline="Your Privacy, Our Commitment"
      effectiveDate={PRIVACY_EFFECTIVE_DATE}
      footerNote={LEGAL_DISCLAIMER}
    >
      <LegalDocumentBody sections={privacySections} />
    </LegalPageShell>
  )
}
