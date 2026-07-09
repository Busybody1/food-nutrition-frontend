import { SITE_NAME } from '@/lib/site'

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

/** Per-route SEO copy, unique titles/descriptions for crawlers and AI indexes. */
export const PUBLIC_PAGE_SEO: Record<PublicPagePath, PageSeoConfig> = {
  '/': {
    description:
      'Food calorie API for developers: REST search, barcode lookup, macros per 100g, and autocomplete across our food database API. Free tier for nutrition apps.',
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
    title: 'Pricing',
    description:
      'Nutrition API pricing: Free developer tier, Core and Plus plans with monthly quotas, rate limits, and enterprise custom volume.',
    keywords: [
      'nutrition API pricing',
      'food API plans',
      'calorie API cost',
      'API rate limits',
      'enterprise nutrition API',
    ],
  },
  '/docs': {
    title: 'API Documentation',
    description:
      'Integrate the Calorie API: authentication, food search, barcode lookup, suggest, rate limits, and code examples in curl, JavaScript, and Python.',
    keywords: [
      'nutrition API documentation',
      'food API reference',
      'REST API guide',
      'barcode lookup API',
      'food search API docs',
    ],
  },
  '/playground': {
    title: 'API Playground',
    description:
      'Try Calorie API endpoints live: food search, autocomplete suggest, barcode lookup, and food details. Rate-limited public demo, no API key required.',
    keywords: [
      'nutrition API playground',
      'food API demo',
      'barcode API test',
      'try food API',
      'REST API sandbox',
    ],
  },
  '/faq': {
    title: 'FAQ',
    description:
      'Answers about Calorie API authentication, food search, pricing tiers, commercial use, rate limits, and integration for health apps.',
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
      'Learn how Calorie API helps developers ship meal tracking, macro logging, and barcode features with reliable nutrition data.',
    keywords: [
      'about Calorie API',
      'nutrition data platform',
      'food database for developers',
    ],
  },
  '/contact': {
    title: 'Contact',
    description:
      'Contact Calorie API for technical support, sales, and enterprise plans. We respond within one business day.',
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
    title: 'Blog',
    description:
      'Developer guides on the nutrition & food API: calorie data, macros, barcode lookup, integrations, and how to build calorie tracker apps.',
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
