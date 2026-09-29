import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { buildPublicPageMetadata } from '@/lib/build-public-metadata'
import { getPublicPageSeo } from '@/lib/public-page-seo'
import { PublicPageSchema } from '@/components/seo/public-page-schema'
import { MarketingImageHero } from '@/components/marketing/marketing-image-hero'
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
      <MarketingImageHero compact centered waveTone="white">
        <p className="marketing-hero-badge mb-4 inline-flex">API Playground</p>
        <h1 className="font-display text-4xl md:text-5xl text-ink mb-4 text-balance">
          {PLAYGROUND_SEO.title}
        </h1>
        <p className="aeo-answer text-lg text-ink-muted max-w-2xl mx-auto">
          {PLAYGROUND_SEO.description}
        </p>
        <p className="mt-6 text-sm text-ink-muted">Authenticated endpoints and higher quotas:</p>
        <Link href="/auth/register" className="btn-brand mt-3 inline-flex items-center gap-2">
          Get a free API key <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </MarketingImageHero>
      <ApiPlaygroundPage />
    </div>
  )
}
