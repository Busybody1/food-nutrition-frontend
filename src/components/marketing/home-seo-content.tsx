import Link from 'next/link'
import { SITE_NAME } from '@/lib/site'

export function HomeSeoContent() {
  return (
    <section className="section-pad bg-white border-t border-surface-border/60">
      <div className="container-narrow max-w-3xl">
        <h2 className="font-display text-2xl md:text-3xl text-ink mb-4">
          Why developers choose our food calorie API
        </h2>
        <div className="space-y-4 text-ink-muted leading-relaxed">
          <p>
            {SITE_NAME} is a production-ready food calorie API for teams shipping meal tracking,
            macro logging, and barcode scan features in health and fitness apps. Our food database
            API combines fast search, autocomplete suggest, and verified macro data per 100g so your
            product can log meals accurately without maintaining a private food catalog.
          </p>

          <h3 className="font-display text-xl text-ink pt-2">Food API endpoints built for scale</h3>
          <p>
            Use REST endpoints with JSON responses and API key authentication. The food API supports
            multi-word search, verified-food filters, UPC and EAN barcode lookup, and autocomplete
            suggest. Rate limits and monthly quotas scale from a free developer tier to high-volume
            commercial use — so your calorie API integration grows with your user base.
          </p>

          <h3 className="font-display text-xl text-ink pt-2">Nutrition API data you can trust</h3>
          <p>
            Every nutrition API response includes structured macros per 100g, micronutrients when
            available, and serving metadata for logging apps. Whether you are building a calorie
            counter, meal planner, or wellness coach, the nutrition API delivers consistent JSON
            payloads that map cleanly to your data models.
          </p>

          <h3 className="font-display text-xl text-ink pt-2">Food database API coverage</h3>
          <p>
            Search across a large verified food database API with brand, category, and nutrient
            filters. Barcode lookup falls back to Open Food Facts when a product is not yet in the
            local catalog, giving your food calorie API broad product coverage out of the box.
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
