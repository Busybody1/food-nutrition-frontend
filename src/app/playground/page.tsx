import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPublicPageMetadata } from '@/lib/build-public-metadata'
import { getPublicPageSeo } from '@/lib/public-page-seo'
import { PublicPageSchema } from '@/components/seo/public-page-schema'
import { MarketingSheetHero } from '@/components/marketing/marketing-sheet'
import { ApiPlaygroundPage } from '@/components/playground/api-playground-page'

export const metadata: Metadata = buildPublicPageMetadata('/playground')

const PLAYGROUND_SEO = getPublicPageSeo('/playground')

export default function PlaygroundPage() {
  return (
    <div className="marketing-page">
      <PublicPageSchema
        path="/playground"
        pageName={PLAYGROUND_SEO.title ?? 'Nutrition API playground'}
        speakable
      />
      <MarketingSheetHero
        badge="API Playground"
        title={PLAYGROUND_SEO.title}
        lead={PLAYGROUND_SEO.description}
        leadClassName="aeo-answer"
      >
        <p className="mt-6 text-sm text-mk-muted">Authenticated endpoints and higher quotas:</p>
        <Link href="/auth/register" className="btn-brand mt-3">
          Get a free API key
        </Link>
      </MarketingSheetHero>
      <ApiPlaygroundPage />
    </div>
  )
}
