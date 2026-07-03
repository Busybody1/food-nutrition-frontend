import type { Metadata } from 'next'
import { LegalPageShell } from '@/components/marketing/legal-document'
import { COOKIES_EFFECTIVE_DATE, cookiesSections } from '@/content/legal/cookies'
import { buildPublicPageMetadata } from '@/lib/build-public-metadata'
import { PublicPageSchema } from '@/components/seo/public-page-schema'

export const metadata: Metadata = buildPublicPageMetadata('/cookies')

export default function CookiesPage() {
  return (
    <>
      <PublicPageSchema path="/cookies" pageName="Cookie Policy" />
      <LegalPageShell
        title="Cookie Policy"
        tagline="Understanding How We Use Cookies"
        effectiveDate={COOKIES_EFFECTIVE_DATE}
        path="/cookies"
        sections={cookiesSections}
        codeListLeads
      />
    </>
  )
}
