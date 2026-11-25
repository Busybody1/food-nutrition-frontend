import type { Metadata } from 'next'
import { MarketingSheetHero } from '@/components/marketing/marketing-sheet'
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
      <MarketingSheetHero
        title="API status"
        lead="Core API and search endpoints. Check here for maintenance windows and incidents."
      />
      <section className="marketing-canvas-pad">
        <div className="container-prose">
          <Reveal>
            <div className="rounded-[20px] border border-mk-hair bg-white px-5 py-5 shadow-card md:px-6">
              <p className="flex items-center gap-2.5 text-base font-semibold text-mk-ink">
                <span className="h-2 w-2 shrink-0 rounded-full bg-mk-green" aria-hidden />
                All systems operational
              </p>
              <p className="mt-2 text-[15px] leading-relaxed text-mk-muted">
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
