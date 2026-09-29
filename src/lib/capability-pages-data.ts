import { API_CONFIG } from '@/lib/config/api'
import { FOOD_DATABASE_SIZE_LABEL } from '@/lib/site'
import type { FaqItem } from '@/lib/faq-data'

const API_BASE = API_CONFIG.baseURL.replace(/\/$/, '')

export type CapabilityFeature = {
  icon: 'search' | 'database' | 'zap' | 'shield' | 'chart' | 'code' | 'scan' | 'utensils' | 'heart'
  title: string
  description: string
}

export type CapabilityPage = {

  slug: string

  h1: string
  metaTitle: string
  description: string
  keywords: string[]
  heroBadge: string
  heroCopy: string[]
  stats: { value: string; label: string }[]
  codeSample: { title: string; code: string }
  features: CapabilityFeature[]
  faqs: FaqItem[]
  related: { label: string; href: string }[]
  extraSections?: { title: string; paragraphs: string[] }[]

  summary: string

  dateModified: string
}

export const CAPABILITY_PAGES: CapabilityPage[] = [
  {
    slug: 'nutrition-api',
    h1: 'Nutrition API',
    metaTitle: 'Nutrition API for Food Calories and Macros',
    description:
      `REST nutrition API for apps: food search, barcode lookup, calorie tracking, and per-100g macros across ${FOOD_DATABASE_SIZE_LABEL}. Free developer tier.`,
    keywords: [
      'nutrition api',
      'food api',
      'food nutrition api',
      'calorie counter api',
      'calorie tracking api',
      'api for food calories',
      'calorie estimation api',
      'barcode food api',
    ],
    heroBadge: 'Nutrition API',
    heroCopy: [
      `A nutrition API is the data layer behind meal logging, calorie counters, and macro coaching. Calorie API is a REST food nutrition API over ${FOOD_DATABASE_SIZE_LABEL}: search, autocomplete, barcode lookup, and named calories, protein, carbs, and fat per 100 g.`,
      'Teams searching for a food API, a calorie tracking API, or an API for food calories usually need the same three calls: typeahead while the user types, full nutrition on selection, and barcode lookup for packaged foods. This hub maps those jobs to endpoints and to the more specific capability pages.',
      'Responses are JSON with stable food IDs, so favorites, recents, and meal plans cache cleanly. Verified-only search restricts results to curated macros when your calorie counter or estimator cannot tolerate sparse labels.',
    ],
    stats: [
      { value: FOOD_DATABASE_SIZE_LABEL, label: 'foods in catalog' },
      { value: 'REST + JSON', label: 'food nutrition API' },
      { value: 'per 100g', label: 'named macros' },
      { value: 'UPC + EAN', label: 'barcode food API' },
    ],
    codeSample: {
      title: 'GET /api/v1/search/foods',
      code: `curl "${API_BASE}/api/v1/search/foods?q=grilled+chicken&verified_only=true" \\\n  -H "X-API-Key: your_api_key_here"`,
    },
    features: [
      {
        icon: 'search',
        title: 'Food search and suggest',
        description:
          'Ranked multi-word search plus a lightweight suggest endpoint for typeahead. This is the core of a food API inside a logging UI.',
      },
      {
        icon: 'scan',
        title: 'Barcode food lookup',
        description:
          'Resolve UPC and EAN codes to nutrition in one request, with Open Food Facts fallback when the local catalog misses a product.',
      },
      {
        icon: 'utensils',
        title: 'Calorie tracking payloads',
        description:
          'Named calories and macros per 100 g, plus serving metadata, so a calorie tracking API integration is portion math rather than nutrient-ID mapping.',
      },
      {
        icon: 'chart',
        title: 'Calorie estimation building blocks',
        description:
          'No photo model. You resolve foods, scale per-100g values by grams, and estimate a meal. Suitable as a calorie estimation API for recipes you already parsed.',
      },
      {
        icon: 'shield',
        title: 'Verified macros',
        description:
          'verified_only=true keeps calorie counter math on curated entries with complete protein, carbs, fat, and energy.',
      },
      {
        icon: 'code',
        title: 'Stable IDs and JSON',
        description:
          'Cache by food ID. Paginated envelopes (data, total, skip, limit) keep a food nutrition API predictable under load.',
      },
    ],
    extraSections: [
      {
        title: 'What a nutrition API is (and how it differs from a food API)',
        paragraphs: [
          'People type "nutrition API" and "food API" for the same shopping trip: they need calories and macros for foods their users will log. A food API emphasizes catalog search (names, brands, restaurant items). A nutrition API emphasizes the numbers on those foods (energy, macros, micronutrients when present). Calorie API is both: one REST surface for lookup and for analysis.',
          `A food nutrition API should return a consistent shape whether the hit is a generic food, a branded product, or a barcode fallback. That is what keeps a calorie counter honest when the user switches from "chicken breast" to a UPC on a yogurt cup. The catalog here covers ${FOOD_DATABASE_SIZE_LABEL}, with Open Food Facts filling long-tail packaged goods.`,
          'If you only need USDA generic foods for research, the free FoodData Central API may be enough. If you are shipping a consumer app, you usually also need typeahead, barcode lookup, branded coverage, and a published quota. Those are the jobs this nutrition API is built for. The USDA guide on the blog is the honest comparison when you have just hit a government rate limit.',
        ],
      },
      {
        title: 'Calorie counter API and calorie tracking API',
        paragraphs: [
          'A calorie counter API is the backend of a diary: search or scan a food, store the food ID and grams, sum energy for the day. A calorie tracking API is the same loop with history, favorites, and often macros next to calories. Neither requires the API to store your users. You own the logs; the API supplies foods and nutrition.',
          'The practical integration is three endpoints. Debounce GET /api/v1/search/suggest while the user types (id, name, brand). On selection, GET /api/v1/foods/{id} for per-100g macros and serving metadata. For packaged items, GET /api/v1/search/barcode/{upc}. Unknown barcodes return 404 so you can fall back to text search or a custom food.',
          'Quota hygiene matters more than micro-optimizing JSON. Cache food details by ID so re-logging breakfast costs zero extra calls. Debounce suggest. Page search with skip and limit (max 100). Per-account rate limits are safer for mobile fleets behind NAT than IP limits copied from research APIs.',
        ],
      },
      {
        title: 'API for food calories and calorie estimation',
        paragraphs: [
          'An API for food calories should expose energy as a named field, not as USDA nutrient number 1008 buried in an array. Calorie API returns calories alongside protein_g, carbohydrates_g, and fat_g per 100 g so portion scaling is one multiplication. Micronutrients, when present, arrive in a structured nutrients array.',
          'Calorie estimation is not the same as labeled barcode data. Estimation means you matched a food (or several recipe lines) and scaled a baseline. Photo models estimate from pixels; this nutrition API does not. If you already have ingredient names and grams, resolve each ingredient once, cache the IDs, and aggregate. That pattern is the calorie estimation API most meal-planning backends actually need.',
          'Use verified_only when estimates feed coaching or targets. Manufacturer labels can be incomplete. Verified foods keep the four macros populated so a missing carb field cannot silently under-count a meal.',
        ],
      },
      {
        title: 'Barcode food API for packaged products',
        paragraphs: [
          'A barcode food API turns a scanner into a logged item. Pass UPC or EAN digits; separators are stripped. The lookup checks the local catalog first, then Open Food Facts, and returns the same JSON shape either way. If neither source knows the code, you get a clean 404 instead of a fuzzy near-miss.',
          'That last point is the usual failure mode on USDA FoodData Central. Branded FDC records include gtinUpc, but there is no dedicated barcode endpoint. Searching the GTIN as text is fuzzy: you must confirm the returned code matches, after stripping leading zeros, or you will attach the wrong product. A dedicated barcode food API exists so logging apps do not ship that bug.',
          'Commercial grocery and retail apps typically combine barcode lookup with brand filters and allergen fields when the source provides them. Development stays on the free tier; a monetized app needs Plus or Enterprise and the X-API-Usage-Type: commercial header.',
        ],
      },
      {
        title: 'How teams integrate a nutrition API',
        paragraphs: [
          'Create an account, generate an API key, and send it as X-API-Key. Try search in the playground without signing up. Framework walkthroughs cover React Native food tracking, Next.js apps, Flutter barcode scanning, Node search, and Python analysis. None of those guides require a vendor SDK; the surface is HTTP and JSON.',
          'Start with one user-visible flow. For a tracker, that is suggest plus details. For retail, that is barcode plus a 404 fallback. For analysis, that is verified search plus the nutrients array. Adding every endpoint on day one usually wastes quota on paths you will not ship in v1.',
          'When you compare providers, look at auth, barcode behavior, whether macros are named, rate-limit headers, and commercial terms. The comparison pages cover Nutritionix, Edamam, USDA FoodData Central, Spoonacular, FatSecret, and Open Food Facts with the same hedged claims used in the rest of the site.',
        ],
      },
      {
        title: 'USDA FoodData Central vs a commercial nutrition API',
        paragraphs: [
          'FoodData Central is free, authoritative for US generic foods, and the right default for research. A registered api.data.gov key is typically limited to about 1,000 requests per hour per IP. DEMO_KEY is much lower (30 per hour, 50 per day). Exceeding the cap returns HTTP 429 and a one-hour block.',
          'Consumer apps outgrow FDC at two moments: the 429, and the missing barcode-first endpoint. Autocomplete and ranked multi-word search for a logging UI are also on you to build. A commercial nutrition API is that productized layer: named macros, barcode lookup, suggest, dashboards, and a published plan quota. Curated generics in this catalog stay consistent with USDA reference data; verified_only surfaces that tier.',
          'You do not have to pick one forever. A common architecture keeps FDC for citation-grade reference lookups and uses Calorie API on the interactive path. The USDA blog post is written for the developer who just hit the limit and needs the next step, not a bait-and-switch away from the government docs.',
        ],
      },
    ],
    faqs: [
      {
        q: 'What is a nutrition API?',
        a: 'A nutrition API returns calories, macros, and related food data over HTTP so apps can log meals and compute targets without maintaining a private food catalog. Calorie API is a REST nutrition API with search, barcode lookup, and per-100g named macros.',
      },
      {
        q: 'Is this a food API or a food nutrition API?',
        a: 'Both. Search, suggest, brands, and categories are the food API. Named calories, macros, and the nutrients array are the food nutrition API. One key and one JSON shape cover both.',
      },
      {
        q: 'Can I build a calorie counter or calorie tracking API integration with this?',
        a: 'Yes. Use suggest for typeahead, food details for per-100g macros, and barcode lookup for packaged foods. Store logs in your app with the stable food ID and the logged amount. The API does not store your users’ diaries.',
      },
      {
        q: 'Do you offer an API for food calories and calorie estimation from photos?',
        a: 'Calories are named fields on each food, which is the API for food calories most trackers need. There is no photo endpoint. Calorie estimation here means resolving foods and scaling per-100g values by grams, including recipe lines you already parsed.',
      },
      {
        q: 'How does the barcode food API behave on a miss?',
        a: 'Local catalog first, then Open Food Facts, same response shape. If neither source has the UPC or EAN, you get HTTP 404 so the app can offer text search. The API does not return an unrelated product for a code it has never seen.',
      },
      {
        q: 'How is this different from the USDA FoodData Central API?',
        a: 'FDC is a free research API with nutrient number arrays, roughly 1,000 requests per hour per IP on a registered key, and no dedicated barcode endpoint. This nutrition API adds named macros, suggest, barcode lookup, branded coverage, and plan quotas. Keep FDC for reference if that is all you need.',
      },
      {
        q: 'Which capability page should I read next?',
        a: 'Food database API for search and filters, barcode nutrition API for UPC/EAN, meal tracking API for the logging loop, or nutrition analysis API for macros and micronutrient arrays. This page is the hub; those pages are the deep dives.',
      },
      {
        q: 'Can I use the nutrition API in a commercial app?',
        a: 'Yes, on Plus or Enterprise with X-API-Usage-Type: commercial. The free tier is for development and personal projects. See pricing for current quotas and rate limits.',
      },
    ],
    related: [
      { label: 'Food database API overview', href: '/food-database-api' },
      { label: 'Barcode nutrition API overview', href: '/barcode-nutrition-api' },
      { label: 'Meal tracking API overview', href: '/meal-tracking-api' },
      { label: 'Nutrition analysis API overview', href: '/nutrition-analysis-api' },
      { label: 'API documentation', href: '/docs' },
      { label: 'Compare nutrition APIs', href: '/compare' },
    ],
    summary: `REST nutrition API: search, barcode, and per-100g macros over ${FOOD_DATABASE_SIZE_LABEL}.`,
    dateModified: '2026-09-09',
  },
  {
    slug: 'barcode-nutrition-api',
    h1: 'Barcode Nutrition API',
    metaTitle: 'Barcode Nutrition API: UPC & EAN Food Lookup',
    description:
      'Resolve UPC and EAN barcodes to nutrition data with one REST call: product details, per-100g macros, serving sizes, and automatic Open Food Facts fallback.',
    keywords: [
      'barcode nutrition API',
      'UPC food lookup API',
      'barcode scanner food API',
      'EAN nutrition lookup',
      'barcode food database',
    ],
    heroBadge: 'Barcode lookup',
    heroCopy: [
      'A barcode nutrition API turns a UPC or EAN scan into a logged meal in one request. The local catalog is checked first, then Open Food Facts, and both return the same response shape.',
      'Every response is trimmed to what logging apps actually need: product name and brand, ingredients and allergens, serving metadata, macros per 100 g and per serving when available, and micronutrients when present.',
    ],
    stats: [
      { value: FOOD_DATABASE_SIZE_LABEL, label: 'foods in catalog' },
      { value: 'UPC + EAN', label: 'barcode formats' },
      { value: '2 sources', label: 'local + Open Food Facts' },
      { value: '1 request', label: 'scan to nutrition' },
    ],
    codeSample: {
      title: 'GET /api/v1/search/barcode/{upc}',
      code: `curl "${API_BASE}/api/v1/search/barcode/3017620422003" \\\n  -H "X-API-Key: your_api_key_here"`,
    },
    features: [
      {
        icon: 'scan',
        title: 'Scanner-agnostic',
        description: 'Works with any scanner library that yields raw digits; dashes are stripped automatically.',
      },
      {
        icon: 'database',
        title: 'Two-source coverage',
        description: 'Verified local catalog first, automatic Open Food Facts fallback for the long tail of products.',
      },
      {
        icon: 'zap',
        title: 'Logging-ready payloads',
        description: 'No thousand-field raw dumps: only product, serving, and nutrition fields your app logs.',
      },
      {
        icon: 'shield',
        title: 'Allergen data',
        description: 'Ingredients text and allergen lists when the source provides them, for safety-aware apps.',
      },
      {
        icon: 'chart',
        title: 'Per-100g normalization',
        description: 'Macros are normalized per 100 g (and per serving when labeled), so portion math stays simple.',
      },
      {
        icon: 'code',
        title: 'Graceful misses',
        description: 'Unknown barcodes return a clean 404 so your app can fall back to text search.',
      },
    ],
    faqs: [
      {
        q: 'Which barcode formats does the API support?',
        a: 'UPC and EAN barcodes. Pass the digits in the URL path; dashes are stripped automatically, so scanner output works as-is.',
      },
      {
        q: 'What happens when a product is not in the catalog?',
        a: 'The API automatically falls back to Open Food Facts with the same normalized response shape. If neither source knows the code, you get a 404 and can offer manual search.',
      },
      {
        q: 'Is the response shape different for fallback products?',
        a: 'No, local-catalog and Open Food Facts products return identical structures, so your client code never branches on data source.',
      },
      {
        q: 'Can I use barcode lookup in a commercial app?',
        a: 'Yes, on the Plus or Enterprise plan with the X-API-Usage-Type: commercial header. Development and personal projects can use the free tier.',
      },
    ],
    related: [
      { label: 'Nutrition API overview', href: '/nutrition-api' },
      { label: 'Barcode Lookup API reference', href: '/docs/barcode-lookup' },
      { label: 'Flutter barcode scanning guide', href: '/docs/guides/flutter-barcode-scanning' },
      { label: 'Solutions for grocery & retail apps', href: '/solutions/grocery-retail' },
      { label: 'Compare nutrition APIs', href: '/compare' },
    ],
    summary: 'UPC/EAN barcode-to-nutrition lookup with Open Food Facts fallback.',
    dateModified: '2026-07-03',
  },
  {
    slug: 'food-database-api',
    h1: 'Food Database API',
    metaTitle: 'Food Database API: Search Millions of Foods',
    description:
      `Search a food database of ${FOOD_DATABASE_SIZE_LABEL} over REST: multi-word matching, brand filters, verified foods, autocomplete, and complete per-100g nutrition data.`,
    keywords: [
      'food database API',
      'food search API',
      'food data API JSON',
      'nutrition database API',
      'food catalog API',
    ],
    heroBadge: 'Food database',
    heroCopy: [
      `A food database API covers ${FOOD_DATABASE_SIZE_LABEL}: generic foods, branded products, and restaurant items over REST. Multi-word search, brand and category filters, and a verified-only mode are on the same endpoint.`,
      'Every food returns complete nutrition data: per-100g macros, a structured nutrients array with micronutrients when available, and serving metadata that maps cleanly to meal-logging data models.',
    ],
    stats: [
      { value: FOOD_DATABASE_SIZE_LABEL, label: 'searchable foods' },
      { value: '100', label: 'results per page (max)' },
      { value: 'any / all', label: 'word match modes' },
      { value: '20', label: 'autocomplete suggestions' },
    ],
    codeSample: {
      title: 'GET /api/v1/search/foods',
      code: `curl "${API_BASE}/api/v1/search/foods?q=greek+yogurt&verified_only=true" \\\n  -H "X-API-Key: your_api_key_here"`,
    },
    features: [
      {
        icon: 'search',
        title: 'Multi-word ranking',
        description: 'Exact phrases rank first, then all-word and any-word matches, word order independent.',
      },
      {
        icon: 'shield',
        title: 'Verified foods filter',
        description: 'verified_only=true restricts results to curated entries with complete, quality-checked macros.',
      },
      {
        icon: 'zap',
        title: 'Autocomplete suggest',
        description: 'A lightweight suggest endpoint returns id, name, and brand for fast typeahead UIs.',
      },
      {
        icon: 'database',
        title: 'Brands & categories',
        description: 'Filter search by brand and browse brand, category, and nutrient reference endpoints.',
      },
      {
        icon: 'chart',
        title: 'Complete macro data',
        description: 'Only foods with complete macro data are returned, no null-riddled results to clean up.',
      },
      {
        icon: 'code',
        title: 'Predictable envelope',
        description: 'Paginated JSON (data, total, skip, limit) with stable food IDs you can cache aggressively.',
      },
    ],
    faqs: [
      {
        q: 'How large is the food database?',
        a: `The catalog covers ${FOOD_DATABASE_SIZE_LABEL} across generic, branded, and restaurant foods, with barcode lookup extending coverage through Open Food Facts.`,
      },
      {
        q: 'Can I download the database in bulk?',
        a: 'No. Query and cache the foods your users actually log; IDs are stable. Bulk catalog scraping is not permitted.',
      },
      {
        q: 'How fresh is the data?',
        a: 'The catalog is continuously updated, and the Open Food Facts fallback covers newly released products before they land in the local database.',
      },
      {
        q: 'Does search return micronutrients?',
        a: 'Search results include per-100g macros; the food details endpoint adds the full nutrients array with vitamins and minerals when available.',
      },
    ],
    related: [
      { label: 'Nutrition API overview', href: '/nutrition-api' },
      { label: 'Food Search API reference', href: '/docs/food-search' },
      { label: 'Node.js food search guide', href: '/docs/guides/nodejs-food-search' },
      { label: 'Next.js nutrition app guide', href: '/docs/guides/nextjs-nutrition-app' },
      { label: 'Compare nutrition APIs', href: '/compare' },
    ],
    summary: `REST search over ${FOOD_DATABASE_SIZE_LABEL} with filters, ranking, and autocomplete.`,
    dateModified: '2026-07-03',
  },
  {
    slug: 'meal-tracking-api',
    h1: 'Meal Tracking API',
    metaTitle: 'Meal Tracking API: Food Logging for Apps',
    description:
      'The API backbone for meal tracking apps: autocomplete food search, stable food IDs, per-100g macros for portion math, and barcode scanning in one REST API.',
    keywords: [
      'meal tracking API',
      'meal logging API',
      'food diary API',
      'food logging API',
      'calorie tracking API',
    ],
    heroBadge: 'Meal tracking',
    heroCopy: [
      'A meal tracking API is the logging flow: type a few letters, pick a food, adjust the portion. Suggest returns the short list, food details return macros per 100 g, and barcode lookup covers packaged foods.',
      'Stable food IDs make re-logging favorites instant, and per-100g normalized macros keep portion math consistent across generic foods, branded products, and scanned items.',
    ],
    stats: [
      { value: '3', label: 'endpoints for a full log flow' },
      { value: '250ms', label: 'typical debounce budget' },
      { value: 'stable', label: 'food IDs for favorites' },
      { value: 'per 100g', label: 'normalized macros' },
    ],
    codeSample: {
      title: 'Typeahead → details flow',
      code: `# 1. Typeahead while the user types\ncurl "${API_BASE}/api/v1/search/suggest?q=oatm&limit=10" \\\n  -H "X-API-Key: your_api_key_here"\n\n# 2. Full nutrition when they pick a result\ncurl "${API_BASE}/api/v1/foods/8172" \\\n  -H "X-API-Key: your_api_key_here"`,
    },
    features: [
      {
        icon: 'zap',
        title: 'Typeahead-first design',
        description: 'Suggest returns lightweight id/name/brand payloads sized for keystroke-level latency.',
      },
      {
        icon: 'utensils',
        title: 'Serving metadata',
        description: 'Foods carry serving information so users can log “1 cup” instead of grams.',
      },
      {
        icon: 'scan',
        title: 'Barcode logging',
        description: 'Packaged foods log in one scan via UPC/EAN lookup with Open Food Facts fallback.',
      },
      {
        icon: 'database',
        title: 'Favorites-friendly IDs',
        description: 'Stable IDs let you cache details and rebuild recent/favorite lists without re-searching.',
      },
      {
        icon: 'chart',
        title: 'Macro math that adds up',
        description: 'Per-100g normalization means portion scaling is one multiplication, for every food.',
      },
      {
        icon: 'shield',
        title: 'Per-account rate limits',
        description: 'Limits apply per account, not per IP, safe for mobile fleets behind NAT.',
      },
    ],
    faqs: [
      {
        q: 'Does the API store my users’ meal logs?',
        a: 'No, you own your users’ data. The API provides food search and nutrition data; your app stores logs with the stable food ID and the logged amount.',
      },
      {
        q: 'How do I keep quota usage low in a tracking app?',
        a: 'Debounce suggest calls, cache food details by ID (favorites and recents then cost zero requests), and batch any analytics server-side.',
      },
      {
        q: 'Can users log foods that are not in the database?',
        a: 'Barcode misses return 404 so you can fall back to search, and your app can always support custom user foods alongside API-sourced ones.',
      },
      {
        q: 'Which plan do I need for a consumer meal tracker?',
        a: 'Development fits the free tier. A monetized app is commercial use and needs Plus or Enterprise with the X-API-Usage-Type: commercial header.',
      },
    ],
    related: [
      { label: 'Nutrition API overview', href: '/nutrition-api' },
      { label: 'React Native food tracking guide', href: '/docs/guides/react-native-food-tracking' },
      { label: 'Food Details API reference', href: '/docs/food-details' },
      { label: 'Solutions for fitness apps', href: '/solutions/fitness-apps' },
      { label: 'Solutions for meal planning apps', href: '/solutions/meal-planning-apps' },
    ],
    summary: 'Suggest → details → barcode flow for food logging apps, with stable IDs.',
    dateModified: '2026-07-03',
  },
  {
    slug: 'nutrition-analysis-api',
    h1: 'Nutrition Analysis API',
    metaTitle: 'Nutrition Analysis API: Macros & Nutrient Data',
    description:
      'Analyze foods programmatically: per-100g calories, protein, carbs, and fat, structured micronutrient arrays, and verified data for meal plans and health features.',
    keywords: [
      'nutrition analysis API',
      'macro tracking API',
      'calorie counting API',
      'nutrient data API',
      'macro calculator API',
    ],
    heroBadge: 'Nutrition analysis',
    heroCopy: [
      'A nutrition analysis API returns calories, protein, carbohydrates, and fat per 100 g, plus a nutrients array when micronutrients are present. Meal-plan and calculator code scales those values by grams.',
      'The verified-only search mode restricts analysis to curated foods with complete, quality-checked macro data, the right default for anything that computes recommendations from the numbers.',
    ],
    stats: [
      { value: '4+', label: 'guaranteed macros per food' },
      { value: 'per 100g', label: 'normalized baseline' },
      { value: 'verified', label: 'curated data mode' },
      { value: 'JSON', label: 'structured nutrients array' },
    ],
    codeSample: {
      title: 'Verified foods for analysis',
      code: `curl "${API_BASE}/api/v1/search/foods?q=lentils&verified_only=true&limit=50" \\\n  -H "X-API-Key: your_api_key_here"`,
    },
    features: [
      {
        icon: 'chart',
        title: 'Consistent macro baseline',
        description: 'Per-100g values across every food make cross-food comparisons and scoring trivial.',
      },
      {
        icon: 'shield',
        title: 'Verified data mode',
        description: 'verified_only=true limits results to curated entries, no cleaning noisy label data.',
      },
      {
        icon: 'database',
        title: 'Micronutrient arrays',
        description: 'Vitamins and minerals arrive as structured entries with names, amounts, and units.',
      },
      {
        icon: 'heart',
        title: 'Health-feature ready',
        description: 'Power protein targets, macro splits, and dietary scoring from one data source.',
      },
      {
        icon: 'code',
        title: 'Analysis-friendly JSON',
        description: 'Flat macro fields load straight into pandas or your analytics pipeline.',
      },
      {
        icon: 'zap',
        title: 'Reference taxonomies',
        description: 'Nutrient, brand, and category endpoints expose the taxonomy behind the numbers.',
      },
    ],
    faqs: [
      {
        q: 'Can the API analyze a full recipe I send it?',
        a: 'There is no recipe-ingestion endpoint. The pattern is to resolve each ingredient with food search, fetch per-100g macros, and aggregate by your recipe quantities, the Python guide shows the building blocks.',
      },
      {
        q: 'Are macros guaranteed on every food?',
        a: 'Yes, search only returns foods with complete macro data (calories, protein, carbs, fat per 100 g). Micronutrients appear when the source provides them.',
      },
      {
        q: 'Is the data suitable for medical use?',
        a: 'The data supports wellness and nutrition features. For regulated medical decisions, apply your own clinical validation on top, see the healthcare solutions page for patterns.',
      },
      {
        q: 'How do I analyze large food sets without hitting limits?',
        a: 'Paginate with skip/limit (up to 100 per page), cache by stable food ID between runs, and analyze the foods your product actually uses rather than bulk-exporting the catalog.',
      },
    ],
    related: [
      { label: 'Nutrition API overview', href: '/nutrition-api' },
      { label: 'Python nutrition data guide', href: '/docs/guides/python-nutrition-data' },
      { label: 'Nutrients, Brands & Categories reference', href: '/docs/reference-data' },
      { label: 'Solutions for healthcare', href: '/solutions/healthcare' },
      { label: 'Solutions for wellness SaaS', href: '/solutions/wellness-saas' },
    ],
    summary: 'Per-100g macros and structured nutrients for calculators and meal plans.',
    dateModified: '2026-07-03',
  },
]

export function getCapabilityPage(slug: string): CapabilityPage | undefined {
  return CAPABILITY_PAGES.find((p) => p.slug === slug)
}

export function capabilityPath(slug: string): string {
  return `/${slug}`
}
