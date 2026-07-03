import type { FaqItem } from '@/lib/faq-data'

export type SolutionEndpointRow = {
  need: string
  endpoint: string
  href: string
}

export type SolutionPage = {
  /** URL segment under /solutions/ */
  slug: string
  h1: string
  metaTitle: string
  description: string
  keywords: string[]
  heroBadge: string
  intro: string[]
  painPoints: { title: string; description: string }[]
  /** Which product needs map to which endpoints */
  endpointMap: SolutionEndpointRow[]
  faqs: FaqItem[]
  related: { label: string; href: string }[]
  summary: string
  dateModified: string
}

export const SOLUTION_PAGES: SolutionPage[] = [
  {
    slug: 'fitness-apps',
    h1: 'Nutrition API for Fitness Apps',
    metaTitle: 'Nutrition API for Fitness & Calorie Tracking Apps',
    description:
      'Add food logging, macro tracking, and barcode scanning to fitness apps with one nutrition API: fast autocomplete, verified macros, and per-account rate limits.',
    keywords: [
      'nutrition API for fitness apps',
      'calorie tracking API',
      'fitness app food database',
      'macro tracking API',
    ],
    heroBadge: 'Fitness apps',
    intro: [
      'Fitness users log meals between sets — the food search has to feel instant, and the macros have to be right. The API pairs a keystroke-fast suggest endpoint with verified per-100g macro data, so calorie budgets and macro splits stay trustworthy.',
      'Barcode scanning covers packaged foods and protein products, and stable food IDs make favorites and recents cost zero extra API calls once cached.',
    ],
    painPoints: [
      {
        title: 'Logging friction kills retention',
        description:
          'Typeahead via the suggest endpoint keeps the log flow under a second — the single biggest retention lever in food tracking.',
      },
      {
        title: 'Bad macros break trust',
        description:
          'verified_only search restricts results to curated, quality-checked macro data your calorie math can rely on.',
      },
      {
        title: 'Building a food database is a product of its own',
        description:
          'Millions of generic, branded, and restaurant foods with barcode fallback — without maintaining your own catalog.',
      },
    ],
    endpointMap: [
      { need: 'Meal logging typeahead', endpoint: 'GET /search/suggest', href: '/docs/food-search' },
      { need: 'Macros after selection', endpoint: 'GET /foods/{id}', href: '/docs/food-details' },
      { need: 'Packaged food scanning', endpoint: 'GET /search/barcode/{upc}', href: '/docs/barcode-lookup' },
      { need: 'Verified-only results', endpoint: 'GET /search/foods?verified_only=true', href: '/docs/food-search' },
    ],
    faqs: [
      {
        q: 'Can the API handle a large mobile user base?',
        a: 'Rate limits apply per account (your API account), not per end user or IP, and paid plans scale to 5,000 requests/minute. Cache food details by stable ID to keep per-user request counts low.',
      },
      {
        q: 'Do I need a commercial plan for a paid fitness app?',
        a: 'Yes — monetized apps are commercial use, which requires Plus or Enterprise and the X-API-Usage-Type: commercial header.',
      },
      {
        q: 'How do other fitness apps structure the log flow?',
        a: 'Debounced suggest while typing, food details on selection, portion math from per-100g macros, and barcode scan as the fast path for packaged foods — the React Native guide walks through the full pattern.',
      },
    ],
    related: [
      { label: 'Meal tracking API overview', href: '/meal-tracking-api' },
      { label: 'React Native food tracking guide', href: '/docs/guides/react-native-food-tracking' },
      { label: 'Barcode nutrition API overview', href: '/barcode-nutrition-api' },
      { label: 'Pricing plans', href: '/pricing' },
    ],
    summary: 'Food logging, macros, and barcode scanning for fitness and calorie apps.',
    dateModified: '2026-07-03',
  },
  {
    slug: 'meal-planning-apps',
    h1: 'Food API for Meal Planning Apps',
    metaTitle: 'Food API for Meal Planning & Recipe Apps',
    description:
      'Power meal planners with structured food data: search millions of foods, aggregate per-100g macros into plans, and score meals against nutrition targets.',
    keywords: [
      'meal planning API',
      'food API for meal planner',
      'recipe ingredient nutrition API',
      'meal plan generator data',
    ],
    heroBadge: 'Meal planning',
    intro: [
      'Meal planners are constraint solvers: hit protein targets, respect calorie budgets, vary the menu. That only works when every candidate food carries consistent, complete macro data — which is exactly what per-100g normalization and the verified-foods filter provide.',
      'Resolve each ingredient with food search, aggregate macros by quantity, and score plans against user targets. Reference endpoints for nutrients, brands, and categories power filter UIs and dietary constraints.',
    ],
    painPoints: [
      {
        title: 'Plans are only as good as the data',
        description:
          'Complete macro data is guaranteed on every search result — no null-handling in the middle of your solver.',
      },
      {
        title: 'Ingredient quantities need a common baseline',
        description:
          'Per-100g normalization makes aggregating a recipe one multiplication per ingredient.',
      },
      {
        title: 'Users want brand-level choices',
        description:
          'Brand filters and branded-product coverage let plans reference the actual products users buy.',
      },
    ],
    endpointMap: [
      { need: 'Ingredient resolution', endpoint: 'GET /search/foods', href: '/docs/food-search' },
      { need: 'Macro aggregation', endpoint: 'GET /foods/{id}', href: '/docs/food-details' },
      { need: 'Dietary filter UIs', endpoint: 'GET /foods/categories/', href: '/docs/reference-data' },
      { need: 'Nutrient taxonomy', endpoint: 'GET /foods/nutrients/', href: '/docs/reference-data' },
    ],
    faqs: [
      {
        q: 'Can I analyze a whole recipe in one call?',
        a: 'There is no recipe-ingestion endpoint — resolve ingredients individually with search and aggregate by quantity. Cached food IDs make repeat plan generation nearly free.',
      },
      {
        q: 'How do I keep generated plans within quota?',
        a: 'Plan generation reads from your cached ingredient pool rather than live-searching every candidate. A few hundred cached foods cover most planners’ menus.',
      },
      {
        q: 'Does the API support dietary restrictions?',
        a: 'Barcode responses include ingredients and allergen lists when the source provides them, and category data supports building your own dietary filters.',
      },
    ],
    related: [
      { label: 'Nutrition analysis API overview', href: '/nutrition-analysis-api' },
      { label: 'Python nutrition data guide', href: '/docs/guides/python-nutrition-data' },
      { label: 'Food database API overview', href: '/food-database-api' },
      { label: 'Solutions for wellness SaaS', href: '/solutions/wellness-saas' },
    ],
    summary: 'Ingredient resolution and macro aggregation for meal-plan generators.',
    dateModified: '2026-07-03',
  },
  {
    slug: 'healthcare',
    h1: 'Food Database API for Healthcare',
    metaTitle: 'Food Database API for Healthcare & Dietitian Software',
    description:
      'Nutrition data for healthcare software: verified macros for dietitian tools, patient food diaries, and clinical wellness programs, with per-account rate limits.',
    keywords: [
      'food database API healthcare',
      'dietitian software API',
      'patient food diary API',
      'clinical nutrition data',
    ],
    heroBadge: 'Healthcare',
    intro: [
      'Dietitian platforms, patient food diaries, and clinical wellness programs need nutrition data that practitioners can defend. The verified-foods mode restricts results to curated entries with complete, quality-checked macros — the right default for professional tools.',
      'Structured micronutrient arrays support deeper dietary review, and your patient data never touches the API: you send food queries, we return food data, and diaries stay in your system.',
    ],
    painPoints: [
      {
        title: 'Practitioners need defensible numbers',
        description:
          'Curated verified foods with complete macro data give dietitian-facing tools a quality baseline.',
      },
      {
        title: 'Patient data must stay yours',
        description:
          'The API is stateless food lookup — no patient identifiers, diaries, or health data ever leave your platform.',
      },
      {
        title: 'Micronutrients matter clinically',
        description:
          'Structured nutrient arrays (vitamins, minerals, units) support reviews beyond calories and macros.',
      },
    ],
    endpointMap: [
      { need: 'Food diary entry', endpoint: 'GET /search/suggest + /foods/{id}', href: '/docs/food-details' },
      { need: 'Verified-only data', endpoint: 'GET /search/foods?verified_only=true', href: '/docs/food-search' },
      { need: 'Micronutrient review', endpoint: 'GET /foods/{id} (nutrients array)', href: '/docs/food-details' },
      { need: 'Packaged food intake', endpoint: 'GET /search/barcode/{upc}', href: '/docs/barcode-lookup' },
    ],
    faqs: [
      {
        q: 'Is the API HIPAA compliant?',
        a: 'The API never receives patient data — requests contain food queries only, so it sits outside your PHI boundary in most architectures. Route calls through your backend and keep diaries in your own systems.',
      },
      {
        q: 'Is the data suitable for clinical decisions?',
        a: 'The data supports wellness and dietary-review features. For regulated clinical decision-making, apply your own clinical validation layer on top.',
      },
      {
        q: 'Can we get an SLA for a healthcare deployment?',
        a: 'Enterprise plans include custom limits and terms — contact us to discuss uptime and support commitments for clinical environments.',
      },
    ],
    related: [
      { label: 'Nutrition analysis API overview', href: '/nutrition-analysis-api' },
      { label: 'Food Search API reference', href: '/docs/food-search' },
      { label: 'Contact for enterprise', href: '/contact' },
      { label: 'API status & uptime', href: '/api-status' },
    ],
    summary: 'Verified nutrition data for dietitian tools and patient food diaries.',
    dateModified: '2026-07-03',
  },
  {
    slug: 'grocery-retail',
    h1: 'Barcode Food API for Grocery & Retail',
    metaTitle: 'Barcode Food API for Grocery & Retail Apps',
    description:
      'Scan-to-nutrition for grocery and retail apps: UPC/EAN lookup with Open Food Facts fallback, allergen data, and logging-ready product payloads.',
    keywords: [
      'grocery app barcode API',
      'retail food scanning API',
      'UPC product nutrition API',
      'food label API',
    ],
    heroBadge: 'Grocery & retail',
    intro: [
      'Shoppers point their camera at a product and expect an answer: what is in it, what are the macros, does it fit my diet. The barcode endpoint resolves UPC and EAN codes to product name, brand, ingredients, allergens, and normalized nutrition in one request.',
      'The two-source design — verified local catalog plus Open Food Facts fallback — matters most in retail, where new products appear on shelves weekly. Misses return a clean 404 so your app can offer text search instead.',
    ],
    painPoints: [
      {
        title: 'Shelf coverage is a moving target',
        description:
          'Open Food Facts fallback extends coverage to newly released and regional products automatically.',
      },
      {
        title: 'Allergen answers must be fast',
        description:
          'Ingredients and allergen lists arrive in the same scan response — no second lookup.',
      },
      {
        title: 'Kiosks and fleets share IPs',
        description:
          'Per-account (not per-IP) rate limits keep in-store kiosks and app fleets behind NAT working.',
      },
    ],
    endpointMap: [
      { need: 'Scan to product data', endpoint: 'GET /search/barcode/{upc}', href: '/docs/barcode-lookup' },
      { need: 'Search fallback on miss', endpoint: 'GET /search/foods', href: '/docs/food-search' },
      { need: 'Brand browsing', endpoint: 'GET /foods/brands/', href: '/docs/reference-data' },
      { need: 'Category navigation', endpoint: 'GET /foods/categories/', href: '/docs/reference-data' },
    ],
    faqs: [
      {
        q: 'How well are non-US products covered?',
        a: 'EAN codes are supported and the Open Food Facts fallback has strong international coverage, which the local catalog extends over time.',
      },
      {
        q: 'Can in-store kiosks share one API account?',
        a: 'Yes — limits are per account rather than per IP, so a kiosk fleet works naturally. Size your plan to fleet-wide request volume.',
      },
      {
        q: 'Do scan responses include package sizes?',
        a: 'Serving metadata and package quantity appear when the source provides them; per-100g values are always present as the normalization baseline.',
      },
    ],
    related: [
      { label: 'Barcode nutrition API overview', href: '/barcode-nutrition-api' },
      { label: 'Flutter barcode scanning guide', href: '/docs/guides/flutter-barcode-scanning' },
      { label: 'Barcode Lookup API reference', href: '/docs/barcode-lookup' },
      { label: 'Pricing plans', href: '/pricing' },
    ],
    summary: 'UPC/EAN scan-to-nutrition for shopping and retail experiences.',
    dateModified: '2026-07-03',
  },
  {
    slug: 'wellness-saas',
    h1: 'Nutrition API for Wellness Platforms',
    metaTitle: 'Nutrition API for Wellness & Corporate Health SaaS',
    description:
      'Embed nutrition features in wellness SaaS: food logging, macro insights, and coaching data from one REST API with commercial licensing and scalable plans.',
    keywords: [
      'wellness platform nutrition API',
      'corporate wellness food API',
      'health SaaS nutrition data',
      'coaching app food API',
    ],
    heroBadge: 'Wellness SaaS',
    intro: [
      'Wellness platforms win deals with breadth: challenges, coaching, habit tracking — and nutrition. Embedding food logging and macro insights through an API turns a quarter-long data project into a sprint.',
      'Commercial licensing is explicit (one header on a Plus or Enterprise plan), limits are per account so multi-tenant architectures just work, and stable food IDs keep your per-tenant caches simple.',
    ],
    painPoints: [
      {
        title: 'Nutrition is table stakes, not your core product',
        description:
          'Ship logging and macro features on top of the API instead of building a food database team.',
      },
      {
        title: 'Multi-tenant architectures complicate limits',
        description:
          'Per-account rate limiting means one integration serves every tenant; size the plan to aggregate volume.',
      },
      {
        title: 'Procurement asks about licensing',
        description:
          'Commercial use is an explicit, documented plan feature — no ambiguous terms to negotiate around.',
      },
    ],
    endpointMap: [
      { need: 'Employee food logging', endpoint: 'GET /search/suggest + /foods/{id}', href: '/docs/food-details' },
      { need: 'Coaching macro insights', endpoint: 'GET /search/foods?verified_only=true', href: '/docs/food-search' },
      { need: 'Challenge integrations', endpoint: 'GET /search/barcode/{upc}', href: '/docs/barcode-lookup' },
      { need: 'Usage monitoring', endpoint: 'Dashboard analytics', href: '/docs/rate-limits' },
    ],
    faqs: [
      {
        q: 'How does licensing work for a B2B2C platform?',
        a: 'Your platform is the API customer: one commercial plan (Plus or Enterprise) covers your tenants. Send X-API-Usage-Type: commercial and size the plan to aggregate volume.',
      },
      {
        q: 'Can we white-label the nutrition features?',
        a: 'Yes — the API is invisible infrastructure. Your UI, your brand; the API only supplies data.',
      },
      {
        q: 'What happens when our volume grows past a plan?',
        a: 'Upgrades apply immediately from the dashboard, and Enterprise plans negotiate custom rate limits and quotas when you outgrow self-serve tiers.',
      },
    ],
    related: [
      { label: 'Meal tracking API overview', href: '/meal-tracking-api' },
      { label: 'Nutrition analysis API overview', href: '/nutrition-analysis-api' },
      { label: 'Rate limits & quotas', href: '/docs/rate-limits' },
      { label: 'Contact for enterprise', href: '/contact' },
    ],
    summary: 'Embedded nutrition features for wellness and corporate health platforms.',
    dateModified: '2026-07-03',
  },
]

export function getSolutionPage(slug: string): SolutionPage | undefined {
  return SOLUTION_PAGES.find((p) => p.slug === slug)
}

export function solutionPath(slug: string): string {
  return `/solutions/${slug}`
}
