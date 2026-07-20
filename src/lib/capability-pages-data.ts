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
  /** Top-level URL segment, e.g. 'barcode-nutrition-api' → /barcode-nutrition-api */
  slug: string
  /** Primary query, used as h1 */
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
  /** One-line summary for hubs and llms.txt */
  summary: string
  /** ISO date, update when content materially changes */
  dateModified: string
}

export const CAPABILITY_PAGES: CapabilityPage[] = [
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
      'Turn a barcode scan into a logged meal with a single request. The barcode nutrition API resolves UPC and EAN codes against a verified local catalog first, then falls back to Open Food Facts automatically, with one normalized response shape either way.',
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
      `Query ${FOOD_DATABASE_SIZE_LABEL} (generic foods, branded products, and restaurant items) through one REST food database API. Multi-word search with relevance ranking, brand and category filters, and a verified-only mode when data quality matters most.`,
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
      'A meal tracker lives or dies by its logging flow: type a few letters, pick a food, adjust the portion, done. The meal tracking API is built around that flow, a fast suggest endpoint for typeahead, full nutrition on selection, and barcode scanning for packaged foods.',
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
      'Build macro calculators, meal-plan generators, and health analytics on structured nutrition data instead of scraped labels. Every food exposes calories, protein, carbohydrates, and fat per 100 g, plus a nutrients array covering micronutrients when available.',
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
