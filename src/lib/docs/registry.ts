import type { DocsSectionContent, DocsSectionMeta } from '@/lib/docs/types'
import { AUTHENTICATION_CONTENT } from '@/lib/docs/content/authentication'
import { FOOD_SEARCH_CONTENT } from '@/lib/docs/content/food-search'
import { BARCODE_LOOKUP_CONTENT } from '@/lib/docs/content/barcode-lookup-section'
import { FOOD_DETAILS_CONTENT } from '@/lib/docs/content/food-details'
import { REFERENCE_DATA_CONTENT } from '@/lib/docs/content/reference-data'
import { RATE_LIMITS_CONTENT } from '@/lib/docs/content/rate-limits'
import { ERRORS_CONTENT } from '@/lib/docs/content/errors'
import { MCP_CONTENT } from '@/lib/docs/content/mcp'
import { MCP_ANNUAL_USD, MCP_MONTHLY_USD } from '@/lib/mcp/catalog'

export const DOCS_SECTIONS: DocsSectionMeta[] = [
  {
    slug: 'mcp',
    title: 'Connect a calorie MCP server',
    metaTitle: 'Connect a calorie MCP server',
    description:
      `Connect a calorie MCP in Claude Code or Cursor with an X-API-Key header. Personal use is $${MCP_MONTHLY_USD} a month or $${MCP_ANNUAL_USD} a year.`,
    keywords: ['calorie mcp', 'connect a calorie mcp server', 'claude code mcp setup', 'mcp api key'],
    summary: 'API key header, eight tools, limits, and photo input.',
    dateModified: '2026-10-02',
    group: 'MCP',
  },
  {
    slug: 'authentication',
    title: 'Nutrition API authentication',
    metaTitle: 'Nutrition API authentication',
    description:
      'Nutrition API authentication is an API key in the X-API-Key header. Public demo routes need no key and are limited by IP.',
    keywords: [
      'nutrition API authentication',
      'food API key',
      'X-API-Key header',
      'REST API authentication',
    ],
    summary: 'API keys, the X-API-Key header, and key security.',
    dateModified: '2026-09-29',
    group: 'Endpoints',
  },
  {
    slug: 'food-search',
    title: 'Food search API',
    metaTitle: 'Food search API',
    description:
      'A food search API looks up foods by name or brand and returns macros per 100 g. An empty query returns common foods.',
    keywords: [
      'food search API',
      'food database search',
      'autocomplete food API',
      'search foods endpoint',
    ],
    summary: 'Multi-word food search, ranking, filters, and autocomplete suggest.',
    dateModified: '2026-09-29',
    group: 'Endpoints',
  },
  {
    slug: 'barcode-lookup',
    title: 'Barcode lookup API',
    metaTitle: 'Barcode lookup API',
    description:
      'A barcode lookup API resolves a UPC or EAN to nutrition. The local catalog is checked first, then Open Food Facts. A miss on both is HTTP 404.',
    keywords: [
      'barcode lookup API',
      'UPC nutrition API',
      'EAN food barcode API',
      'barcode scanner API',
    ],
    summary: 'UPC/EAN lookup with Open Food Facts fallback.',
    dateModified: '2026-09-29',
    group: 'Endpoints',
  },
  {
    slug: 'food-details',
    title: 'Food details API',
    metaTitle: 'Food details API',
    description:
      'A food details API returns one food by ID, including macros per 100 g and the nutrients array. The ID comes from search or suggest.',
    keywords: [
      'food details API',
      'nutrition data endpoint',
      'food by id API',
      'macro data API',
    ],
    summary: 'Full nutrition payload for a single food by ID.',
    dateModified: '2026-09-29',
    group: 'Endpoints',
  },
  {
    slug: 'reference-data',
    title: 'Nutrients, brands, and categories API',
    metaTitle: 'Nutrients, brands, and categories API',
    description:
      'A nutrients, brands, and categories API lists the taxonomy behind food search. Public catalog demos need no key and are limited by IP.',
    keywords: [
      'nutrients API',
      'food brands API',
      'food categories API',
      'nutrition reference data',
    ],
    summary: 'Reference endpoints for nutrients, brands, and categories.',
    dateModified: '2026-09-29',
    group: 'Endpoints',
  },
  {
    slug: 'rate-limits',
    title: 'API rate limits',
    metaTitle: 'API rate limits',
    description:
      'API rate limits apply per account, not per IP. The free plan is 10 requests a minute. Plus is 5,000 requests a minute.',
    keywords: [
      'API rate limits',
      'nutrition API quota',
      'commercial API use',
      'X-RateLimit headers',
    ],
    summary: 'Plan limits, quotas, and commercial use.',
    dateModified: '2026-09-29',
    group: 'Advanced',
  },
  {
    slug: 'errors',
    title: 'API error handling',
    metaTitle: 'API error handling',
    description:
      'API error handling uses HTTP status codes and a JSON detail string. A missing API key is 401. A monthly quota miss is 402.',
    keywords: [
      'API error handling',
      'HTTP status codes',
      'API retry strategy',
      '429 rate limit',
    ],
    summary: 'Status codes, error payloads, and retry guidance.',
    dateModified: '2026-09-29',
    group: 'Advanced',
  },
]

const CONTENT_BY_SLUG: Record<string, DocsSectionContent> = {
  mcp: MCP_CONTENT,
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
