import { FOOD_DATABASE_SIZE_LABEL } from '@/lib/site'

export type FaqItem = { q: string; a: string }

export const GENERAL_FAQS: readonly FaqItem[] = [
  {
    q: 'What is Calorie API?',
    a: 'Calorie API is a REST API for nutrition and food data: search, autocomplete, barcode lookup, and macro nutrients per 100g. It is designed for health, fitness, and meal-tracking applications.',
  },
  {
    q: 'How do I authenticate requests?',
    a: 'Send your API key in the X-API-Key header, or use a JWT from the developer dashboard after signing in. Public demo search on the homepage is IP-rate-limited and does not require a key.',
  },
  {
    q: 'What are the pricing tiers?',
    a: 'A free tier includes monthly request quotas for development. Paid plans increase rate limits and monthly quotas. See the pricing page for current limits.',
  },
  {
    q: 'How does search ranking work?',
    a: 'Search supports multi-word queries, match_mode (any/all), verified-only filters, and relevance ranking aligned with verified foods and complete macro data.',
  },
  {
    q: 'Can I use this for commercial apps?',
    a: 'Commercial production use requires a Plus or Enterprise plan. Send the header X-API-Usage-Type: commercial when your app is a commercial product. Free, Basic, and Core are for non-commercial development and personal use.',
  },
] as const

export const IMPLEMENTATION_FAQS: readonly FaqItem[] = [
  {
    q: 'How do I paginate food search results?',
    a: 'Use the skip and limit query parameters on GET /api/v1/search/foods. Responses are a JSON envelope with data, total, skip, and limit fields, so you can page through results. The limit accepts values up to 100 (default 30).',
  },
  {
    q: 'What happens when a barcode is not found?',
    a: 'Barcode lookup checks the local food database first and automatically falls back to Open Food Facts. If neither source has the product, the API returns HTTP 404 with a "Food not found for barcode" message. Handle this by offering manual food search in your app.',
  },
  {
    q: 'How should my app handle rate limit errors?',
    a: 'Per-minute rate limits return HTTP 429 with X-RateLimit-Limit, X-RateLimit-Remaining, and X-RateLimit-Reset headers. Retry after the reset time with exponential backoff. Exceeding your monthly quota returns HTTP 402, and commercial-use or food-coverage violations return HTTP 403.',
  },
  {
    q: 'How does the autocomplete suggest endpoint work?',
    a: 'GET /api/v1/search/suggest?q={prefix} returns lightweight results (id, name, brand_name) for typeahead UIs, up to 20 items per request. Debounce keystrokes in your client and fetch full nutrition data with the food details endpoint after selection.',
  },
  {
    q: 'Can I filter search results by brand?',
    a: 'Yes. Pass the brand query parameter on /api/v1/search/foods to restrict results to a brand, and use the brands, categories, and nutrients reference endpoints to build filter UIs.',
  },
  {
    q: 'What format are API responses in?',
    a: 'All endpoints return JSON. Food objects include per-100g macro values, a structured nutrients array, and serving metadata, so responses map directly to meal-logging data models.',
  },
] as const

export const PRICING_FAQS: readonly FaqItem[] = [
  {
    q: 'What happens if I exceed my monthly quota?',
    a: 'Requests beyond your plan’s monthly quota return HTTP 402 with a "Monthly API quota exceeded" message until the next billing cycle. You can upgrade your plan from the dashboard at any time to raise the quota immediately.',
  },
  {
    q: 'Can I change or cancel my plan at any time?',
    a: 'Yes. Plans are billed through Stripe and managed from the developer dashboard: upgrades, downgrades, and cancellations take effect without contacting support.',
  },
  {
    q: 'Is there a free tier for development?',
    a: 'Yes. The Free plan includes a monthly request quota intended for development, prototyping, and personal projects. Create an account, generate an API key, and start making requests.',
  },
  {
    q: 'What counts as commercial use?',
    a: 'If your product charges users, serves ads, or otherwise generates revenue, it is commercial use and requires a Plus or Enterprise plan with the X-API-Usage-Type: commercial header. Non-commercial development and personal tools can use Free, Basic, or Core.',
  },
] as const

export const DATA_FAQS: readonly FaqItem[] = [
  {
    q: 'How many foods are in the database?',
    a: `The food database covers ${FOOD_DATABASE_SIZE_LABEL} spanning generic foods, branded products, and restaurant items, with barcode lookup extending coverage through Open Food Facts.`,
  },
  {
    q: 'What is a verified food?',
    a: 'Verified foods are curated entries with complete, quality-checked macro data. Pass verified_only=true on search to restrict results to verified foods, useful when data accuracy matters more than coverage.',
  },
  {
    q: 'Are nutrition values normalized?',
    a: 'Yes. Every food returns macros normalized per 100g alongside a full nutrients array and serving metadata, so calorie and macro math is consistent across generic and branded foods.',
  },
  {
    q: 'Which barcode formats are supported?',
    a: 'UPC and EAN barcodes are supported via GET /api/v1/search/barcode/{upc}. Scans hit the local catalog first and fall back to Open Food Facts for broader product coverage.',
  },
  {
    q: 'Do you support micronutrients or only macros?',
    a: 'Foods include a structured nutrients array with micronutrients when available, in addition to the guaranteed per-100g macro set (calories, protein, carbohydrates, fat).',
  },
] as const

export type FaqGroup = { id: string; title: string; items: readonly FaqItem[] }

/** Grouped FAQ catalog, /faq renders every group; other pages render targeted subsets. */
export const FAQ_GROUPS: readonly FaqGroup[] = [
  { id: 'general', title: 'Getting started', items: GENERAL_FAQS },
  { id: 'implementation', title: 'Implementation', items: IMPLEMENTATION_FAQS },
  { id: 'pricing', title: 'Pricing & plans', items: PRICING_FAQS },
  { id: 'data', title: 'Nutrition data', items: DATA_FAQS },
] as const

export const ALL_FAQ_ITEMS: readonly FaqItem[] = FAQ_GROUPS.flatMap((g) => [...g.items])

/**
 * Home-page subset, intentionally distinct from the full /faq set so the two
 * URLs do not publish duplicate FAQPage JSON-LD.
 */
export const HOME_FAQ_ITEMS: readonly FaqItem[] = [
  GENERAL_FAQS[0],
  GENERAL_FAQS[1],
  IMPLEMENTATION_FAQS[1],
  IMPLEMENTATION_FAQS[3],
  DATA_FAQS[0],
  PRICING_FAQS[2],
]

export function buildFaqPageJsonLd(items: readonly FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  }
}
