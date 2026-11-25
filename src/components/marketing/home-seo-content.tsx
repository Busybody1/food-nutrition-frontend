import type { ReactNode } from 'react'
import { BookOpenIcon, BracketsCurlyIcon, DatabaseIcon, RocketIcon, ScalesIcon, ShieldCheckIcon, SquaresFourIcon } from '@phosphor-icons/react/ssr'
import type { MarketingIcon } from '@/components/marketing/marketing-shell'
import { Reveal, RevealGroup } from '@/components/marketing/reveal'
import { SeoInlineLink } from '@/components/seo/marketing-seo-section'
import { TrackedCtaLink } from '@/components/analytics/tracked-cta-link'
import { MarketingIconDisc, discToneAt } from '@/components/marketing/marketing-shell'
import { MarketingSheet } from '@/components/marketing/marketing-sheet'
import { SITE_NAME } from '@/lib/site'

const externalLinkClass =
  'text-brand-strong font-medium underline decoration-brand/40 underline-offset-2 transition-colors duration-200 hover:decoration-brand-strong rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2'

type SeoRow = { icon: MarketingIcon; title: string; body: ReactNode }

const ROWS: SeoRow[] = [
  {
    icon: BracketsCurlyIcon,
    title: 'Food API endpoints built for scale',
    body: (
      <>
        Use REST endpoints with JSON responses and API key authentication. The food API supports
        multi-word search, verified-food filters, UPC and EAN barcode lookup, and autocomplete
        suggest. Rate limits and monthly quotas scale from a free developer tier to high-volume
        commercial use, so your calorie API integration grows with your user base.
      </>
    ),
  },
  {
    icon: ShieldCheckIcon,
    title: 'Nutrition API data you can trust',
    body: (
      <>
        Every <SeoInlineLink href="/nutrition-api">nutrition API</SeoInlineLink> response includes
        structured macros per 100g, micronutrients when available, and serving metadata for
        logging apps. Whether you are building a calorie counter, meal planner, or wellness
        coach, the nutrition API delivers consistent JSON payloads that map cleanly to your
        data models.
      </>
    ),
  },
  {
    icon: DatabaseIcon,
    title: 'Food database API coverage',
    body: (
      <>
        Search across a large verified food database API with brand, category, and nutrient
        filters. Barcode lookup falls back to Open Food Facts when a product is not yet in the
        local catalog, giving your food calorie API broad product coverage out of the box.
      </>
    ),
  },
  {
    icon: SquaresFourIcon,
    title: 'Popular use cases',
    body: (
      <>
        Teams use the API to power{' '}
        <SeoInlineLink href="/solutions/fitness-apps">fitness and calorie-tracking apps</SeoInlineLink>
        , <SeoInlineLink href="/solutions/meal-planning-apps">meal planners</SeoInlineLink>,{' '}
        <SeoInlineLink href="/solutions/healthcare">healthcare and dietitian software</SeoInlineLink>,{' '}
        <SeoInlineLink href="/solutions/grocery-retail">grocery and retail scanning</SeoInlineLink>, and{' '}
        <SeoInlineLink href="/solutions/wellness-saas">wellness and corporate-health platforms</SeoInlineLink>
        . Product-specific capabilities are covered on the{' '}
        <SeoInlineLink href="/nutrition-api">nutrition API</SeoInlineLink> hub, plus the{' '}
        <SeoInlineLink href="/barcode-nutrition-api">barcode nutrition API</SeoInlineLink>,{' '}
        <SeoInlineLink href="/food-database-api">food database API</SeoInlineLink>,{' '}
        <SeoInlineLink href="/meal-tracking-api">meal tracking API</SeoInlineLink>, and{' '}
        <SeoInlineLink href="/nutrition-analysis-api">nutrition analysis API</SeoInlineLink> pages.
      </>
    ),
  },
  {
    icon: RocketIcon,
    title: 'Integrate in minutes',
    body: (
      <>
        Create an account, generate an API key in the dashboard, and make your first request. The{' '}
        <SeoInlineLink href="/docs">quickstart guide</SeoInlineLink> walks through authentication and
        your first food search in curl, JavaScript, and Python. Framework walkthroughs for React
        Native, Next.js, Flutter, and Node.js live in the{' '}
        <SeoInlineLink href="/docs/guides">integration guides</SeoInlineLink>.
      </>
    ),
  },
  {
    icon: ScalesIcon,
    title: `How ${SITE_NAME} compares`,
    body: (
      <>
        Evaluating nutrition data providers? See how {SITE_NAME} stacks up against Nutritionix,
        Edamam, USDA FoodData Central, Spoonacular, FatSecret, and Open Food Facts in our{' '}
        <SeoInlineLink href="/compare">nutrition API comparison</SeoInlineLink>, including
        authentication, free-tier limits, barcode coverage, and migration notes.
      </>
    ),
  },
  {
    icon: BookOpenIcon,
    title: 'From the developer blog',
    body: (
      <>
        The <SeoInlineLink href="/blog">developer blog</SeoInlineLink> goes deeper on choosing and
        migrating between nutrition data providers. Start with the{' '}
        <SeoInlineLink href="/blog/best-food-nutrition-apis-2025">best food and nutrition APIs</SeoInlineLink>{' '}
        roundup, or the{' '}
        <SeoInlineLink href="/blog/edamam-api-alternative">Edamam API alternative</SeoInlineLink>{' '}
        walkthrough for a concrete migration example with code.
      </>
    ),
  },
]

export function HomeSeoContent() {
  return (
    <MarketingSheet aria-labelledby="home-why-heading">
      <div className="container-narrow">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <Reveal className="lg:sticky lg:top-[calc(var(--site-header-offset)+2.5rem)]">
              <h2 id="home-why-heading" className="marketing-h2">
                Why developers choose our food calorie API
              </h2>
              <p className="marketing-body mt-5">
                {SITE_NAME} is a production-ready food calorie API for teams shipping meal tracking,
                macro logging, and barcode scan features in health and fitness apps. Our food database
                API combines fast search, autocomplete suggest, and verified macro data per 100g so your
                product can log meals accurately without maintaining a private food catalog.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <TrackedCtaLink href="/auth/register" eventLabel="Get API Key Free" className="btn-brand">
                  Get API Key Free
                </TrackedCtaLink>
                <TrackedCtaLink href="/docs" eventLabel="Read documentation" className="btn-brand-outline">
                  Read documentation
                </TrackedCtaLink>
              </div>
              <p className="mt-8 border-t border-mk-hair pt-6 text-[15px] leading-relaxed text-mk-muted">
                Explore the <SeoInlineLink href="/docs">API documentation</SeoInlineLink>, compare{' '}
                <SeoInlineLink href="/pricing">pricing plans</SeoInlineLink>, or read answers on the{' '}
                <SeoInlineLink href="/faq">FAQ page</SeoInlineLink>. For standards on nutrition labeling,
                see the{' '}
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
            </Reveal>
          </div>

          <RevealGroup
            className="divide-y divide-mk-hair border-y border-mk-hair lg:col-span-7"
            itemClassName="min-w-0"
            step={60}
          >
            {ROWS.map((row, index) => (
              <div key={row.title} className="flex gap-4 py-7 md:gap-5 md:py-8">
                <MarketingIconDisc icon={row.icon} tone={discToneAt(index)} className="mt-0.5" />
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold tracking-[-0.01em] text-mk-ink">{row.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-mk-muted md:text-base md:text-mk-body">
                    {row.body}
                  </p>
                </div>
              </div>
            ))}
          </RevealGroup>
        </div>
      </div>
    </MarketingSheet>
  )
}
