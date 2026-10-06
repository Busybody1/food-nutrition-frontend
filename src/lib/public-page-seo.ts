import { FOOD_DATABASE_SIZE_LABEL, FREE_TIER_LABEL, SITE_NAME } from '@/lib/site'
import { MCP_MONTHLY_USD } from '@/lib/mcp/catalog'

export type PublicPagePath =
  | '/'
  | '/pricing'
  | '/docs'
  | '/playground'
  | '/faq'
  | '/about'
  | '/contact'
  | '/api-status'
  | '/changelog'
  | '/blog'
  | '/privacy'
  | '/terms'
  | '/cookies'
  | '/commercial-license'

export type PageSeoConfig = {
  title?: string
  description: string
  keywords: string[]
}

export const PUBLIC_PAGE_SEO: Record<PublicPagePath, PageSeoConfig> = {
  '/': {
    title: 'Food calorie API for developers',
    description:
      `Food calorie API: REST search, barcode lookup, and macros per 100 g across ${FOOD_DATABASE_SIZE_LABEL}. ${FREE_TIER_LABEL}.`,
    keywords: [
      'food calorie api',
      'food API',
      'nutrition API',
      'food database API',
      'calorie API',
      'nutrition database API',
      'food search API',
      'barcode nutrition API',
      'macro API',
      'meal tracking API',
    ],
  },
  '/pricing': {
    title: 'Nutrition API pricing',
    description:
      `Nutrition API pricing starts with ${FREE_TIER_LABEL}. Paid plans raise quotas and rate limits. Commercial apps need Plus or Enterprise.`,
    keywords: [
      'nutrition API pricing',
      'food API plans',
      'calorie API cost',
      'API rate limits',
      'enterprise nutrition API',
    ],
  },
  '/docs': {
    title: 'Nutrition API documentation',
    description:
      `Nutrition API documentation for search, barcode lookup, and food details. Send an X-API-Key header. The catalog covers ${FOOD_DATABASE_SIZE_LABEL}.`,
    keywords: [
      'nutrition API documentation',
      'food API reference',
      'REST API guide',
      'barcode lookup API',
      'food search API docs',
    ],
  },
  '/playground': {
    title: 'Nutrition API playground',
    description:
      'Nutrition API playground for food search, suggest, barcode lookup, and food details. The public demo is rate limited and needs no API key.',
    keywords: [
      'nutrition API playground',
      'food API demo',
      'barcode API test',
      'try food API',
      'REST API sandbox',
    ],
  },
  '/faq': {
    title: 'Nutrition API FAQ',
    description:
      'Nutrition API FAQ: API keys use the X-API-Key header, the free tier is for development, and commercial apps need Plus or Enterprise.',
    keywords: [
      'nutrition API FAQ',
      'food API questions',
      'API authentication help',
      'commercial API license',
    ],
  },
  '/about': {
    title: `About ${SITE_NAME}`,
    description:
      `About ${SITE_NAME}: a REST food calorie API over ${FOOD_DATABASE_SIZE_LABEL} for meal tracking, macros per 100 g, and barcode lookup.`,
    keywords: [
      'about Calorie API',
      'nutrition data platform',
      'food database for developers',
    ],
  },
  '/contact': {
    title: `Contact ${SITE_NAME}`,
    description:
      `Contact ${SITE_NAME} for technical support, sales, and enterprise plans. We respond within one business day.`,
    keywords: [
      'Calorie API support',
      'nutrition API sales',
      'enterprise API contact',
    ],
  },
  '/api-status': {
    title: 'API Status',
    description:
      'Live status for Calorie API search, suggest, barcode, and authentication services. Uptime and maintenance information.',
    keywords: ['API status', 'nutrition API uptime', 'service health'],
  },
  '/changelog': {
    title: 'Changelog',
    description:
      'Release notes for Calorie API: search features, rate limits, dashboard updates, and platform improvements.',
    keywords: ['API changelog', 'nutrition API updates', 'release notes'],
  },
  '/blog': {
    title: 'Calorie API blog',
    description:
      `Calorie API blog: guides on food search, barcode lookup, and a calorie MCP at $${MCP_MONTHLY_USD} a month for personal use.`,
    keywords: [
      'calorie API blog',
      'nutrition & food API guides',
      'food API guides',
      'how to get calorie data from api',
      'nutrition API tutorials',
      'food data api json',
    ],
  },
  '/privacy': {
    title: 'Privacy Policy',
    description:
      'How Calorie API collects, uses, stores, and protects personal data for developers and dashboard users.',
    keywords: ['privacy policy', 'API data protection', 'GDPR nutrition API'],
  },
  '/terms': {
    title: 'Terms of Service',
    description:
      'Terms of service for using the Calorie API, developer portal, billing, and acceptable use of nutrition data.',
    keywords: ['terms of service', 'API terms', 'acceptable use'],
  },
  '/cookies': {
    title: 'Cookie Policy',
    description:
      'Cookie and tracking technologies used on the Calorie API marketing site and developer dashboard.',
    keywords: ['cookie policy', 'website cookies', 'tracking disclosure'],
  },
  '/commercial-license': {
    title: 'Commercial API License Agreement',
    description:
      'Commercial API License Agreement for the Calorie API: license grant, permitted use, restrictions, fees, and terms for commercial use on Plus plans and higher.',
    keywords: [
      'commercial API license',
      'API license agreement',
      'nutrition API commercial use',
      'food API license',
      'Plus plan license',
    ],
  },
}

export function getPublicPageSeo(path: PublicPagePath): PageSeoConfig {
  return PUBLIC_PAGE_SEO[path]
}
