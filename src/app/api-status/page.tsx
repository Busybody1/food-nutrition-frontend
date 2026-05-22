import type { Metadata } from 'next'
import { MarketingHero } from '@/components/marketing/marketing-hero'
import { buildPublicPageMetadata } from '@/lib/build-public-metadata'
import { PublicPageSchema } from '@/components/seo/public-page-schema'
import { ApiStatusSeoContent } from '@/components/seo/public-page-seo-content'

export const metadata: Metadata = buildPublicPageMetadata('/api-status')

export default function ApiStatusPage() {
  return (
    <div className="marketing-page">
      <PublicPageSchema path="/api-status" pageName="API Status" />
      <MarketingHero
        title="API status"
        subtitle="Core API and search endpoints. Check here for maintenance windows and incidents."
        compact
      />
      <section className="pb-20 md:pb-28 -mt-4">
        <div className="container-narrow max-w-xl text-center">
          <div className="marketing-card p-8 md:p-10 inline-block w-full">
            <span className="marketing-status-pill">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden />
              All systems operational
            </span>
            <p className="mt-6 text-sm text-ink-muted leading-relaxed">
              Search, suggest, barcode lookup, and authentication services are running normally.
              Subscribe to updates via your account dashboard or contact support for enterprise SLAs.
            </p>
          </div>
        </div>
      </section>

      <ApiStatusSeoContent />
    </div>
  )
}
