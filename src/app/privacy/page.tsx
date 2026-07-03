import type { Metadata } from 'next'
import { LegalPageShell } from '@/components/marketing/legal-document'
import { PRIVACY_EFFECTIVE_DATE, privacySections } from '@/content/legal/privacy'
import { buildPublicPageMetadata } from '@/lib/build-public-metadata'
import { PublicPageSchema } from '@/components/seo/public-page-schema'

export const metadata: Metadata = buildPublicPageMetadata('/privacy')

export default function PrivacyPage() {
  return (
    <>
      <PublicPageSchema path="/privacy" pageName="Privacy Policy" />
      <LegalPageShell
        title="Privacy Policy"
        tagline="Your Privacy, Our Commitment"
        effectiveDate={PRIVACY_EFFECTIVE_DATE}
        path="/privacy"
        sections={privacySections}
      />
    </>
  )
}
