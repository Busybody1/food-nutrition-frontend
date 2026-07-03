import type { Metadata } from 'next'
import { MarketingHero } from '@/components/marketing/marketing-hero'
import { MarketingCtaBand } from '@/components/marketing/marketing-shell'
import { Reveal } from '@/components/marketing/reveal'
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
      <section className="bg-white section-pad-sm">
        <div className="container-prose">
          <Reveal>
            <div className="marketing-card card-hairline p-8 md:p-10 text-center">
              <span className="marketing-status-pill">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden />
                All systems operational
              </span>
              <p className="mt-6 text-sm text-ink-muted leading-relaxed max-w-xl mx-auto">
                Search, suggest, barcode lookup, and authentication services are running normally.
                Subscribe to updates via your account dashboard or contact support for enterprise SLAs.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <MarketingCtaBand
        title="Ready to build?"
        description="Create a free account, grab an API key, and make your first search in minutes."
        primaryHref="/auth/register"
        primaryLabel="Get started free"
        secondaryHref="/contact"
        secondaryLabel="Contact us"
      />

      <ApiStatusSeoContent />
    </div>
  )
}
