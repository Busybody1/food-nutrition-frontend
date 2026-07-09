import type { Metadata } from 'next'
import { LegalPageShell } from '@/components/marketing/legal-document'
import {
  COMMERCIAL_LICENSE_EFFECTIVE_DATE,
  commercialLicenseSections,
} from '@/content/legal/commercial-license'
import { buildPublicPageMetadata } from '@/lib/build-public-metadata'
import { PublicPageSchema } from '@/components/seo/public-page-schema'

export const metadata: Metadata = buildPublicPageMetadata('/commercial-license')

export default function CommercialLicensePage() {
  return (
    <>
      <PublicPageSchema
        path="/commercial-license"
        pageName="Commercial API License Agreement"
      />
      <LegalPageShell
        title="Commercial API License Agreement"
        tagline="Commercial Use of the Food Database API"
        effectiveDate={COMMERCIAL_LICENSE_EFFECTIVE_DATE}
        path="/commercial-license"
        sections={commercialLicenseSections}
      />
    </>
  )
}
