import Link from 'next/link'
import { SITE_NAME } from '@/lib/site'

export function HomeSeoContent() {
  return (
    <section className="section-pad bg-white border-t border-surface-border/60">
      <div className="container-narrow max-w-3xl">
        <h2 className="font-display text-2xl md:text-3xl text-ink mb-4">
          Why teams choose our food &amp; nutrition database API
        </h2>
        <div className="space-y-4 text-ink-muted leading-relaxed">
          <p>
            {SITE_NAME} is built for developers shipping meal tracking, macro logging, and barcode
            scan features in production health apps. The ultimate food and nutrition database API
            combines fast search, autocomplete suggest, and verified macro data per 100g so your
            product can log meals accurately without maintaining a private food catalog.
          </p>
          <p>
            Use REST endpoints with JSON responses and API key authentication. Filter by verified
            foods, match multi-word queries, and look up products by UPC. Rate limits and monthly
            quotas scale with your plan, from a free developer tier to high-volume commercial use.
          </p>
          <p>
            Explore the{' '}
            <Link href="/docs" prefetch={false} className="text-brand-strong font-medium hover:underline">
              API documentation
            </Link>
            , compare{' '}
            <Link href="/pricing" prefetch={false} className="text-brand-strong font-medium hover:underline">
              pricing plans
            </Link>
            , or read answers on the{' '}
            <Link href="/faq" prefetch={false} className="text-brand-strong font-medium hover:underline">
              FAQ page
            </Link>
            . For standards on nutrition labeling, see the{' '}
            <a
              href="https://www.fda.gov/food/nutrition-facts-label/how-understand-and-use-nutrition-facts-label"
              className="text-brand-strong font-medium hover:underline"
              rel="noopener noreferrer"
            >
              FDA nutrition facts guidance
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  )
}
