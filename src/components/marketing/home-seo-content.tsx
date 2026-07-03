import { Reveal } from '@/components/marketing/reveal'
import { SeoInlineLink } from '@/components/seo/marketing-seo-section'
import { SITE_NAME } from '@/lib/site'

/** Same treatment as SeoInlineLink, for external anchors. */
const externalLinkClass =
  'text-brand-strong font-medium underline decoration-brand/40 underline-offset-2 transition-colors duration-200 hover:decoration-brand-strong rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2'

const subheadClass = 'font-display text-xl tracking-tight text-ink pt-6'

export function HomeSeoContent() {
  return (
    <section className="section-pad bg-surface-elevated">
      <div className="container-prose">
        <Reveal>
          <h2 className="font-display text-3xl md:text-4xl tracking-tight text-ink mb-3">
            Why developers choose our food calorie API
          </h2>
          <div
            className="h-1 w-12 rounded-full bg-gradient-to-r from-brand to-brand-soft mb-6"
            aria-hidden
          />
        </Reveal>
        <Reveal delay={120}>
          <div className="space-y-4 text-ink-muted leading-relaxed">
            <p>
              {SITE_NAME} is a production-ready food calorie API for teams shipping meal tracking,
              macro logging, and barcode scan features in health and fitness apps. Our food database
              API combines fast search, autocomplete suggest, and verified macro data per 100g so your
              product can log meals accurately without maintaining a private food catalog.
            </p>

            <h3 className={subheadClass}>Food API endpoints built for scale</h3>
            <p>
              Use REST endpoints with JSON responses and API key authentication. The food API supports
              multi-word search, verified-food filters, UPC and EAN barcode lookup, and autocomplete
              suggest. Rate limits and monthly quotas scale from a free developer tier to high-volume
              commercial use, so your calorie API integration grows with your user base.
            </p>

            <h3 className={subheadClass}>Nutrition API data you can trust</h3>
            <p>
              Every nutrition API response includes structured macros per 100g, micronutrients when
              available, and serving metadata for logging apps. Whether you are building a calorie
              counter, meal planner, or wellness coach, the nutrition API delivers consistent JSON
              payloads that map cleanly to your data models.
            </p>

            <h3 className={subheadClass}>Food database API coverage</h3>
            <p>
              Search across a large verified food database API with brand, category, and nutrient
              filters. Barcode lookup falls back to Open Food Facts when a product is not yet in the
              local catalog, giving your food calorie API broad product coverage out of the box.
            </p>

            <h3 className={subheadClass}>Popular use cases</h3>
            <p>
              Teams use the API to power{' '}
              <SeoInlineLink href="/solutions/fitness-apps">
                fitness and calorie-tracking apps
              </SeoInlineLink>
              ,{' '}
              <SeoInlineLink href="/solutions/meal-planning-apps">
                meal planners
              </SeoInlineLink>
              ,{' '}
              <SeoInlineLink href="/solutions/healthcare">
                healthcare and dietitian software
              </SeoInlineLink>
              , and{' '}
              <SeoInlineLink href="/solutions/grocery-retail">
                grocery and retail scanning
              </SeoInlineLink>
              . Product-specific capabilities are covered on the{' '}
              <SeoInlineLink href="/barcode-nutrition-api">
                barcode nutrition API
              </SeoInlineLink>
              ,{' '}
              <SeoInlineLink href="/food-database-api">
                food database API
              </SeoInlineLink>
              ,{' '}
              <SeoInlineLink href="/meal-tracking-api">
                meal tracking API
              </SeoInlineLink>
              , and{' '}
              <SeoInlineLink href="/nutrition-analysis-api">
                nutrition analysis API
              </SeoInlineLink>{' '}
              pages.
            </p>

            <h3 className={subheadClass}>Integrate in minutes</h3>
            <p>
              Create an account, generate an API key in the dashboard, and make your first request.
              The{' '}
              <SeoInlineLink href="/docs">
                quickstart guide
              </SeoInlineLink>{' '}
              walks through authentication and your first food search in curl, JavaScript, and Python.
              Framework walkthroughs for React Native, Next.js, Flutter, and Node.js live in the{' '}
              <SeoInlineLink href="/docs/guides">
                integration guides
              </SeoInlineLink>
              .
            </p>

            <h3 className={subheadClass}>How {SITE_NAME} compares</h3>
            <p>
              Evaluating nutrition data providers? See how {SITE_NAME} stacks up against Nutritionix,
              Edamam, USDA FoodData Central, and Spoonacular in our{' '}
              <SeoInlineLink href="/compare">
                nutrition API comparison
              </SeoInlineLink>
              , including free-tier limits, barcode coverage, and migration notes.
            </p>

            <p>
              Explore the{' '}
              <SeoInlineLink href="/docs">
                API documentation
              </SeoInlineLink>
              , compare{' '}
              <SeoInlineLink href="/pricing">
                pricing plans
              </SeoInlineLink>
              , or read answers on the{' '}
              <SeoInlineLink href="/faq">
                FAQ page
              </SeoInlineLink>
              . For standards on nutrition labeling, see the{' '}
              <a
                href="https://www.fda.gov/food/nutrition-facts-label/how-understand-and-use-nutrition-facts-label"
                className={externalLinkClass}
                target="_blank"
                rel="noopener noreferrer"
              >
                FDA nutrition facts guidance
              </a>
              .
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
