import type { Metadata } from 'next'
import { buildPublicPageMetadata } from '@/lib/build-public-metadata'
import { getPublicPageSeo } from '@/lib/public-page-seo'
import { PublicPageSchema } from '@/components/seo/public-page-schema'
import { ContactSeoContent } from '@/components/seo/public-page-seo-content'
import { buildContactPageJsonLd } from '@/lib/seo-jsonld'

export const metadata: Metadata = buildPublicPageMetadata('/contact')

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  const seo = getPublicPageSeo('/contact')
  return (
    <>
      <PublicPageSchema
        path="/contact"
        pageName="Contact"
        extraJsonLd={[buildContactPageJsonLd(seo.description)]}
      />
      {children}
      <ContactSeoContent />
    </>
  )
}
