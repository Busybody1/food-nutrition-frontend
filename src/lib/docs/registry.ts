import type { DocsSectionContent, DocsSectionMeta } from '@/lib/docs/types'
import { AUTHENTICATION_CONTENT } from '@/lib/docs/content/authentication'
import { FOOD_SEARCH_CONTENT } from '@/lib/docs/content/food-search'
import { BARCODE_LOOKUP_CONTENT } from '@/lib/docs/content/barcode-lookup-section'
import { FOOD_DETAILS_CONTENT } from '@/lib/docs/content/food-details'
import { REFERENCE_DATA_CONTENT } from '@/lib/docs/content/reference-data'
import { RATE_LIMITS_CONTENT } from '@/lib/docs/content/rate-limits'
import { ERRORS_CONTENT } from '@/lib/docs/content/errors'

/** Ordered registry, order drives sidebar, hub cards, and prev/next links. */
export const DOCS_SECTIONS: DocsSectionMeta[] = [
  {
    slug: 'authentication',
    title: 'Authentication',
    metaTitle: 'API Authentication',
    description:
      'Authenticate Calorie API requests with API keys: the X-API-Key header, key management, security best practices, and auth error responses.',
    keywords: [
      'nutrition API authentication',
      'food API key',
      'X-API-Key header',
      'REST API authentication',
    ],
    summary: 'API keys, the X-API-Key header, and key security.',
    dateModified: '2026-07-03',
    group: 'Endpoints',
  },
  {
    slug: 'food-search',
    title: 'Food Search',
    metaTitle: 'Food Search API',
    description:
      'Search the food database by name, brand, category, and nutrients: multi-word matching, match_mode, verified_only, pagination, catalog meta endpoints, and the autocomplete suggest endpoint.',
    keywords: [
      'food search API',
      'food database search',
      'autocomplete food API',
      'search foods endpoint',
    ],
    summary: 'Multi-word food search, ranking, filters, and autocomplete suggest.',
    dateModified: '2026-07-03',
    group: 'Endpoints',
  },
  {
    slug: 'barcode-lookup',
    title: 'Barcode Lookup',
    metaTitle: 'Barcode Lookup API',
    description:
      'Resolve UPC and EAN barcodes to product and nutrition data with automatic Open Food Facts fallback, serving sizes, and per-100g macros.',
    keywords: [
      'barcode lookup API',
      'UPC nutrition API',
      'EAN food barcode API',
      'barcode scanner API',
    ],
    summary: 'UPC/EAN lookup with Open Food Facts fallback.',
    dateModified: '2026-07-03',
    group: 'Endpoints',
  },
  {
    slug: 'food-details',
    title: 'Food Details',
    metaTitle: 'Food Details API',
    description:
      'Fetch complete nutrition data for a single food by ID: per-100g macros, the full nutrients array, and serving metadata.',
    keywords: [
      'food details API',
      'nutrition data endpoint',
      'food by id API',
      'macro data API',
    ],
    summary: 'Full nutrition payload for a single food by ID.',
    dateModified: '2026-07-03',
    group: 'Endpoints',
  },
  {
    slug: 'reference-data',
    title: 'Nutrients, Brands & Categories',
    metaTitle: 'Nutrients, Brands & Categories API',
    description:
      'Paginated reference endpoints for nutrients, brands, and food categories for building filter UIs and mapping nutrition taxonomies.',
    keywords: [
      'nutrients API',
      'food brands API',
      'food categories API',
      'nutrition reference data',
    ],
    summary: 'Reference endpoints for nutrients, brands, and categories.',
    dateModified: '2026-07-03',
    group: 'Endpoints',
  },
  {
    slug: 'rate-limits',
    title: 'Rate Limits & Quotas',
    metaTitle: 'Rate Limits & Quotas',
    description:
      'Per-plan rate limits, monthly quotas, commercial-use flag, response caching, and rate-limit headers.',
    keywords: [
      'API rate limits',
      'nutrition API quota',
      'commercial API use',
      'X-RateLimit headers',
    ],
    summary: 'Plan limits, quotas, and commercial use.',
    dateModified: '2026-07-03',
    group: 'Advanced',
  },
  {
    slug: 'errors',
    title: 'Error Handling',
    metaTitle: 'API Error Handling',
    description:
      'Calorie API error responses: status codes, error payload format, and retry guidance for 429 rate limits and 402 quota errors.',
    keywords: [
      'API error handling',
      'HTTP status codes',
      'API retry strategy',
      '429 rate limit',
    ],
    summary: 'Status codes, error payloads, and retry guidance.',
    dateModified: '2026-07-03',
    group: 'Advanced',
  },
]

const CONTENT_BY_SLUG: Record<string, DocsSectionContent> = {
  authentication: AUTHENTICATION_CONTENT,
  'food-search': FOOD_SEARCH_CONTENT,
  'barcode-lookup': BARCODE_LOOKUP_CONTENT,
  'food-details': FOOD_DETAILS_CONTENT,
  'reference-data': REFERENCE_DATA_CONTENT,
  'rate-limits': RATE_LIMITS_CONTENT,
  errors: ERRORS_CONTENT,
}

export function getDocsSectionMeta(slug: string): DocsSectionMeta | undefined {
  return DOCS_SECTIONS.find((s) => s.slug === slug)
}

export function getDocsSectionContent(slug: string): DocsSectionContent | undefined {
  return CONTENT_BY_SLUG[slug]
}

export function docsSectionPath(slug: string): string {
  return `/docs/${slug}`
}

/** Previous/next sections in registry order, for pagination links. */
export function getDocsSectionNeighbors(slug: string): {
  prev?: DocsSectionMeta
  next?: DocsSectionMeta
} {
  const index = DOCS_SECTIONS.findIndex((s) => s.slug === slug)
  if (index === -1) return {}
  return {
    prev: DOCS_SECTIONS[index - 1],
    next: DOCS_SECTIONS[index + 1],
  }
}
