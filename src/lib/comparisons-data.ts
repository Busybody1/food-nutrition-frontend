import { FOOD_DATABASE_SIZE_LABEL, SITE_NAME } from '@/lib/site'
import type { FaqItem } from '@/lib/faq-data'

export type ComparisonRow = {
  dimension: string
  us: string
  them: string
}

export type ComparisonPage = {
  /** URL segment under /compare/ */
  slug: string
  competitor: string
  h1: string
  metaTitle: string
  description: string
  keywords: string[]
  intro: string[]
  matrix: ComparisonRow[]
  /** Honest "when the competitor is the better fit" — credibility earns citations */
  whenTheyFit: string[]
  whenWeFit: string[]
  migration: string[]
  faqs: FaqItem[]
  related: { label: string; href: string }[]
  summary: string
  /** Month the competitor claims were last reviewed, e.g. 'July 2026' */
  asOf: string
  dateModified: string
}

/** Rendered under every comparison table. */
export const COMPARISON_DISCLAIMER = (asOf: string) =>
  `Comparison notes reviewed as of ${asOf}. Competitor capabilities and pricing change — verify details against their current documentation before deciding.`

export const COMPARISON_PAGES: ComparisonPage[] = [
  {
    slug: 'nutritionix-alternative',
    competitor: 'Nutritionix',
    h1: 'Nutritionix Alternative',
    metaTitle: 'Nutritionix Alternative — Calorie API Comparison',
    description:
      'Comparing Calorie API and Nutritionix for developers: food database coverage, barcode lookup, verified data, commercial licensing, and migration notes.',
    keywords: [
      'Nutritionix alternative',
      'Nutritionix vs Calorie API',
      'nutrition API comparison',
      'food database API alternative',
    ],
    intro: [
      'Nutritionix is one of the most established nutrition data providers, known for its natural-language food parsing and restaurant-chain coverage. Calorie API takes a different shape: a lean REST food database API with verified macro data, explicit barcode fallback, and self-serve commercial licensing.',
      'Which is right depends on what your product actually does with food data — this page lays out the differences honestly so you can decide quickly.',
    ],
    matrix: [
      {
        dimension: 'Primary focus',
        us: `REST food search, barcode lookup, and verified per-100g macros (${FOOD_DATABASE_SIZE_LABEL})`,
        them: 'Natural-language food parsing, restaurant chain data, and tracking APIs',
      },
      {
        dimension: 'Barcode lookup',
        us: 'UPC/EAN with automatic Open Food Facts fallback and one normalized response shape',
        them: 'UPC lookup against their branded food database',
      },
      {
        dimension: 'Data quality control',
        us: 'verified_only filter guarantees curated foods with complete macros',
        them: 'Large branded database; verification approach differs by data source',
      },
      {
        dimension: 'Commercial licensing',
        us: 'Explicit self-serve: Plus/Enterprise plan + one request header',
        them: 'Tiered API plans; licensing terms scale with usage',
      },
      {
        dimension: 'Getting started',
        us: 'Free tier, no credit card; public playground without signup',
        them: 'Free tier available for development',
      },
    ],
    whenTheyFit: [
      'You want natural-language meal parsing ("2 eggs and toast") out of the box.',
      'Restaurant chain menu data is central to your product.',
      'You already use their tracking endpoints and the migration cost outweighs the benefits.',
    ],
    whenWeFit: [
      'You want predictable REST search + barcode + details endpoints with a paginated JSON envelope.',
      'Verified, per-100g normalized macro data matters for your calorie math.',
      'You want barcode coverage that extends past a single catalog via Open Food Facts fallback.',
      'You want commercial licensing to be a plan feature, not a sales conversation.',
    ],
    migration: [
      'Migration is mostly field mapping: swap your auth header to X-API-Key, point search at GET /api/v1/search/foods, and map macro fields to the per-100g baseline (calories, protein, carbs, fat). Barcode flows move to GET /api/v1/search/barcode/{upc} unchanged from the scanner side.',
      'Food IDs differ between providers, so re-resolve stored foods by name or barcode once and cache our stable IDs going forward.',
    ],
    faqs: [
      {
        q: 'Does Calorie API have natural-language meal parsing like Nutritionix?',
        a: 'No — search is keyword-based with multi-word ranking and match modes. If free-text meal parsing is your core interaction, Nutritionix is genuinely strong there; many trackers find ranked multi-word search covers their logging flow.',
      },
      {
        q: 'How do the food databases compare in size?',
        a: `Calorie API covers ${FOOD_DATABASE_SIZE_LABEL} plus Open Food Facts fallback on barcodes. Database sizes shift constantly across providers — coverage of the foods your users log matters more than headline totals, so test both with your real queries.`,
      },
      {
        q: 'Can I run both during a migration?',
        a: 'Yes — a common pattern is routing barcode traffic to Calorie API first (for the fallback coverage) while search migrates feature-by-feature behind a flag.',
      },
    ],
    related: [
      { label: 'Food database API overview', href: '/food-database-api' },
      { label: 'Barcode nutrition API overview', href: '/barcode-nutrition-api' },
      { label: 'All nutrition API comparisons', href: '/compare' },
      { label: 'API documentation', href: '/docs' },
    ],
    summary: 'REST-first verified food data vs Nutritionix’s NLP parsing and restaurant focus.',
    asOf: 'July 2026',
    dateModified: '2026-07-03',
  },
  {
    slug: 'edamam-alternative',
    competitor: 'Edamam',
    h1: 'Edamam Alternative',
    metaTitle: 'Edamam Alternative — Calorie API Comparison',
    description:
      'Comparing Calorie API and Edamam for developers: food search vs recipe analysis, barcode support, pricing model, and migration notes.',
    keywords: [
      'Edamam alternative',
      'Edamam vs Calorie API',
      'recipe nutrition API comparison',
      'food API alternative',
    ],
    intro: [
      'Edamam is best known for recipe-level nutrition analysis — send a full ingredient list, get an aggregate nutrition label. Calorie API is food-level infrastructure: fast search over a verified catalog, barcode lookup with fallback, and per-100g macros your own code aggregates.',
      'If your product needs recipe ingestion as a service, Edamam earns its place. If it logs foods, scans barcodes, or computes its own plans, food-level data with predictable licensing is usually the simpler foundation.',
    ],
    matrix: [
      {
        dimension: 'Primary focus',
        us: 'Food-level search, barcode lookup, and verified macros over REST',
        them: 'Recipe nutrition analysis, diet labeling, and meal recommendations',
      },
      {
        dimension: 'Recipe handling',
        us: 'Resolve ingredients individually and aggregate in your code (guides show the pattern)',
        them: 'Recipe ingestion endpoint returns aggregate nutrition per recipe',
      },
      {
        dimension: 'Barcode lookup',
        us: 'UPC/EAN endpoint with Open Food Facts fallback built in',
        them: 'Available within their food database API',
      },
      {
        dimension: 'Pricing model',
        us: 'Flat monthly plans with per-minute limits and monthly quotas',
        them: 'Tiered plans; heavier usage typically moves to per-call pricing',
      },
      {
        dimension: 'Data normalization',
        us: 'Per-100g macros guaranteed on every food',
        them: 'Per-serving and per-recipe outputs depending on endpoint',
      },
    ],
    whenTheyFit: [
      'You need turnkey recipe analysis — paste ingredients, receive a nutrition label.',
      'Diet and allergen classification at the recipe level is core to your product.',
      'You want meal recommendation endpoints rather than building recommendation logic.',
    ],
    whenWeFit: [
      'Your product logs individual foods or scans barcodes more than it ingests recipes.',
      'You want flat, predictable monthly pricing as volume grows.',
      'You prefer owning aggregation logic with a guaranteed per-100g baseline.',
      'Verified-only data mode matters for your accuracy story.',
    ],
    migration: [
      'For food search flows, migration is direct: X-API-Key auth, GET /api/v1/search/foods, and per-100g macro mapping. For recipe analysis flows, the pattern shifts — resolve each ingredient via search once, cache the stable food IDs, and aggregate by quantity in your code. The Python guide shows the aggregation building blocks.',
    ],
    faqs: [
      {
        q: 'Can Calorie API analyze a full recipe like Edamam?',
        a: 'Not as a single endpoint. You resolve ingredients individually and aggregate per-100g macros by quantity — more code than a recipe endpoint, but you keep control of matching and the result is fully cacheable.',
      },
      {
        q: 'Which is cheaper at scale?',
        a: 'It depends on call patterns — flat monthly plans are easiest to predict when volume grows steadily. Model your expected requests against both providers’ current pricing pages before committing.',
      },
      {
        q: 'Do both support commercial products?',
        a: 'Yes. On Calorie API commercial use is a plan feature (Plus/Enterprise plus a request header); Edamam licenses commercially through its tiers. Either way, read the terms before launch.',
      },
    ],
    related: [
      { label: 'Nutrition analysis API overview', href: '/nutrition-analysis-api' },
      { label: 'Python nutrition data guide', href: '/docs/guides/python-nutrition-data' },
      { label: 'All nutrition API comparisons', href: '/compare' },
      { label: 'Solutions for meal planning apps', href: '/solutions/meal-planning-apps' },
    ],
    summary: 'Food-level data and flat pricing vs Edamam’s recipe-analysis services.',
    asOf: 'July 2026',
    dateModified: '2026-07-03',
  },
  {
    slug: 'usda-fooddata-central-alternative',
    competitor: 'USDA FoodData Central',
    h1: 'USDA FoodData Central Alternative',
    metaTitle: 'USDA FoodData Central Alternative — Calorie API Comparison',
    description:
      'When to use Calorie API vs the free USDA FoodData Central API: branded coverage, barcode lookup, autocomplete, rate limits, and production readiness.',
    keywords: [
      'USDA FoodData Central alternative',
      'USDA API vs commercial nutrition API',
      'free nutrition API limitations',
      'FDC API production',
    ],
    intro: [
      'USDA FoodData Central is a genuinely great resource — free, authoritative, and the reference standard for US generic foods. Plenty of products should just use it. This page is about the cases where teams outgrow it.',
      'The gaps show up in production consumer apps: international and long-tail branded coverage, barcode lookup UX, autocomplete endpoints, and support commitments. That is the layer a commercial food API adds.',
    ],
    matrix: [
      {
        dimension: 'Cost',
        us: 'Free development tier; paid plans for scale and commercial use',
        them: 'Free (US government data, api.data.gov key)',
      },
      {
        dimension: 'Generic US foods',
        us: 'Covered, with verified curation and per-100g normalization',
        them: 'Authoritative reference standard (Foundation/SR Legacy data)',
      },
      {
        dimension: 'Branded & international products',
        us: `${FOOD_DATABASE_SIZE_LABEL} plus Open Food Facts barcode fallback for the long tail`,
        them: 'US-centric branded data; international coverage limited',
      },
      {
        dimension: 'App-oriented endpoints',
        us: 'Autocomplete suggest, ranked multi-word search, barcode-to-nutrition in one call',
        them: 'Research-oriented search; no typeahead-optimized or barcode-first endpoints',
      },
      {
        dimension: 'Support & guarantees',
        us: 'Support, dashboards, and enterprise terms available',
        them: 'Public service — no SLA or support channel',
      },
    ],
    whenTheyFit: [
      'Research, academic, or internal tools where US generic-food data is enough.',
      'Zero-budget projects that can build their own search UX on top.',
      'You need the authoritative USDA nutrient detail for compliance or research citations.',
    ],
    whenWeFit: [
      'Consumer apps that need typeahead, ranked search, and barcode scanning UX.',
      'Products whose users log branded and international foods.',
      'Teams that want a support channel and terms behind a production dependency.',
      'Hybrid setups: USDA for reference data, Calorie API for the live logging flow.',
    ],
    migration: [
      'Teams often keep FDC for reference analysis and put Calorie API in the interactive path: suggest for typeahead, search for logging, barcode for packaged foods. If you migrate fully, map FDC nutrient fields to the per-100g macro baseline and re-resolve stored foods by name once to obtain stable IDs.',
    ],
    faqs: [
      {
        q: 'Is USDA data inside Calorie API?',
        a: 'The catalog includes curated generic foods consistent with USDA reference data alongside branded and international products; verified_only surfaces the curated tier.',
      },
      {
        q: 'Why pay when USDA is free?',
        a: 'You are paying for the productized layer: autocomplete, ranked search, barcode-with-fallback, branded/international coverage, dashboards, and support. If you do not need that layer, USDA is the right call.',
      },
      {
        q: 'Can I use both together?',
        a: 'Yes — a common architecture uses FDC for authoritative reference lookups and Calorie API for the user-facing logging flow where UX endpoints matter.',
      },
    ],
    related: [
      { label: 'Food database API overview', href: '/food-database-api' },
      { label: 'Food Search API reference', href: '/docs/food-search' },
      { label: 'All nutrition API comparisons', href: '/compare' },
      { label: 'Solutions for healthcare', href: '/solutions/healthcare' },
    ],
    summary: 'Production app layer (typeahead, barcode, support) vs the free USDA reference API.',
    asOf: 'July 2026',
    dateModified: '2026-07-03',
  },
  {
    slug: 'spoonacular-alternative',
    competitor: 'Spoonacular',
    h1: 'Spoonacular Alternative',
    metaTitle: 'Spoonacular Alternative — Calorie API Comparison',
    description:
      'Comparing Calorie API and Spoonacular: food/nutrition data vs recipe content, pricing models, barcode lookup, and when each API fits.',
    keywords: [
      'Spoonacular alternative',
      'Spoonacular vs Calorie API',
      'recipe API vs food API',
      'nutrition data API comparison',
    ],
    intro: [
      'Spoonacular is a recipe-content platform first: recipes with instructions and images, meal-plan content, and product data, priced on a points system. Calorie API is nutrition data infrastructure: search, barcode, and verified macros over plain REST with flat plans.',
      'Products that need recipe content should look at Spoonacular seriously. Products that need reliable food data underneath their own content usually want the infrastructure shape.',
    ],
    matrix: [
      {
        dimension: 'Primary focus',
        us: 'Food search, barcode lookup, verified macro data',
        them: 'Recipe content (instructions, images), meal-plan content, product data',
      },
      {
        dimension: 'Pricing model',
        us: 'Flat monthly plans with clear per-minute limits and quotas',
        them: 'Points-based: different endpoints consume different point amounts',
      },
      {
        dimension: 'Nutrition data shape',
        us: 'Per-100g normalized macros plus structured nutrient arrays',
        them: 'Nutrition attached to recipes and products',
      },
      {
        dimension: 'Barcode lookup',
        us: 'Dedicated UPC/EAN endpoint with Open Food Facts fallback',
        them: 'Product endpoints support UPC lookups',
      },
      {
        dimension: 'Content licensing',
        us: 'Data API — your UI and content are your own',
        them: 'Recipe content licensing terms apply to displayed recipes',
      },
    ],
    whenTheyFit: [
      'You need ready-made recipe content — instructions, images, and search by cuisine or diet.',
      'Meal-plan content generation (not just data) is the feature you are shipping.',
      'Wine pairings, product matching, and food trivia-style content fit your product.',
    ],
    whenWeFit: [
      'You own the content experience and need dependable food data underneath.',
      'Predictable flat pricing beats per-endpoint points math for your usage.',
      'Barcode scanning with fallback coverage is a core flow.',
      'Verified macro data feeds calculations, not just display.',
    ],
    migration: [
      'If you used Spoonacular for ingredient/product data, map to food search and barcode endpoints with X-API-Key auth and per-100g macros. If you used recipe content, that content layer stays yours to build or source — Calorie API supplies the ingredient-level data your aggregation needs.',
    ],
    faqs: [
      {
        q: 'Does Calorie API provide recipes?',
        a: 'No — it is deliberately a food-data API. Ingredient resolution and macro aggregation for your own recipes is the supported pattern, shown in the meal-planning solution and Python guide.',
      },
      {
        q: 'How does flat pricing compare to points?',
        a: 'Flat plans make cost a function of request volume only, which is easier to forecast. Points systems can be economical for low-volume mixed usage — model your call mix against both.',
      },
      {
        q: 'Which has better product/barcode coverage?',
        a: 'Coverage depends on your users’ regions and products. Calorie API’s Open Food Facts fallback gives broad international long-tail coverage; test both with barcodes from your actual user base.',
      },
    ],
    related: [
      { label: 'Food database API overview', href: '/food-database-api' },
      { label: 'Barcode nutrition API overview', href: '/barcode-nutrition-api' },
      { label: 'All nutrition API comparisons', href: '/compare' },
      { label: 'Solutions for meal planning apps', href: '/solutions/meal-planning-apps' },
    ],
    summary: 'Nutrition data infrastructure with flat pricing vs Spoonacular’s recipe content platform.',
    asOf: 'July 2026',
    dateModified: '2026-07-03',
  },
]

export function getComparisonPage(slug: string): ComparisonPage | undefined {
  return COMPARISON_PAGES.find((p) => p.slug === slug)
}

export function comparisonPath(slug: string): string {
  return `/compare/${slug}`
}

/** Hub-page summary rows: one honest line per provider. */
export const COMPARE_HUB_ROWS = [
  {
    provider: SITE_NAME,
    focus: 'REST food search, barcode lookup with fallback, verified per-100g macros',
    bestFor: 'Meal tracking, barcode scanning, and apps that compute from macro data',
    href: '/docs',
  },
  {
    provider: 'Nutritionix',
    focus: 'Natural-language food parsing and restaurant chain data',
    bestFor: 'Free-text meal logging and restaurant-heavy products',
    href: '/compare/nutritionix-alternative',
  },
  {
    provider: 'Edamam',
    focus: 'Recipe nutrition analysis and diet labeling',
    bestFor: 'Turnkey recipe ingestion and recipe-level diet classification',
    href: '/compare/edamam-alternative',
  },
  {
    provider: 'USDA FoodData Central',
    focus: 'Free authoritative US reference data',
    bestFor: 'Research, internal tools, and zero-budget US-generic use cases',
    href: '/compare/usda-fooddata-central-alternative',
  },
  {
    provider: 'Spoonacular',
    focus: 'Recipe content, meal-plan content, and product data (points pricing)',
    bestFor: 'Products that need ready-made recipe content',
    href: '/compare/spoonacular-alternative',
  },
] as const
