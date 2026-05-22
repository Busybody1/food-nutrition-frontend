import type { Metadata } from 'next'
import { buildPublicPageMetadata } from '@/lib/build-public-metadata'
import { PublicPageSchema } from '@/components/seo/public-page-schema'
import { DocsSeoContent } from '@/components/seo/public-page-seo-content'
import { StructuredData } from '@/components/seo/structured-data'

export const metadata: Metadata = buildPublicPageMetadata('/docs')

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PublicPageSchema path="/docs" pageName="Documentation" />
      <StructuredData type="api" />
      {children}
      <DocsSeoContent />
    </>
  )
}
