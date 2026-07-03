import { buildPricingProductJsonLdFromInput } from '@/lib/pricing-product-jsonld'
import { fetchPublicPlans } from '@/lib/pricing/fetch-plans'
import { isEnterprisePlan } from '@/lib/pricing/plan-display'
import {
  OG_IMAGE_URL,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  ORGANIZATION_ID,
  WEBSITE_ID,
  WEBAPI_ID,
  absoluteUrl,
} from '@/lib/site'
import {
  buildBlogItemListJsonLdFromInput,
  buildBlogPostingJsonLdFromInput,
} from '@/lib/blog-jsonld-format'

const FALLBACK_PRICING_PLANS = [
  { name: 'Free', price: '0' },
  { name: 'Basic', price: '29' },
  { name: 'Core', price: '99' },
  { name: 'Plus', price: '299' },
] as const

function plansToJsonLdOffers(
  plans: Array<{ name: string; monthly_price: number }>
): Array<{ name: string; price: string }> {
  return plans
    .filter((plan) => plan.monthly_price === 0 || !isEnterprisePlan(plan.name))
    .map((plan) => ({
      name: plan.name,
      price: plan.monthly_price === 0 ? '0' : String(plan.monthly_price),
    }))
}

function buildPricingJsonLdInput(
  plans: readonly { name: string; price: string }[]
) {
  return {
    siteName: SITE_NAME,
    siteUrl: SITE_URL,
    siteDescription: SITE_DESCRIPTION,
    imageUrl: OG_IMAGE_URL,
    pricingUrl: absoluteUrl('/pricing'),
    termsUrl: absoluteUrl('/terms'),
    plans,
    priceValidUntil: `${new Date().getFullYear() + 1}-12-31`,
  }
}

/** Product JSON-LD for pricing pages, satisfies Google Product/Offer required fields. */
export function buildPricingProductJsonLd() {
  return buildPricingProductJsonLdFromInput(
    buildPricingJsonLdInput(FALLBACK_PRICING_PLANS)
  )
}

/** Server-side JSON-LD built from live plan prices in the database. */
export async function buildPricingProductJsonLdAsync() {
  try {
    const plans = await fetchPublicPlans()
    const offers = plansToJsonLdOffers(plans)
    if (offers.length > 0) {
      return buildPricingProductJsonLdFromInput(buildPricingJsonLdInput(offers))
    }
  } catch {
    // fall back to static offers when API is unavailable
  }
  return buildPricingProductJsonLd()
}

export type BreadcrumbItem = { name: string; path: string }

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

export function buildWebPageJsonLd({
  name,
  description,
  path,
}: {
  name: string
  description: string
  path: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name,
    description,
    url: absoluteUrl(path),
    isPartOf: {
      '@type': 'WebSite',
      '@id': WEBSITE_ID,
      name: SITE_NAME,
      url: SITE_URL,
    },
  }
}

/** TechArticle JSON-LD for docs pages and framework guides. */
export function buildTechArticleJsonLd({
  headline,
  description,
  path,
  dateModified,
  proficiencyLevel = 'Beginner',
  keywords,
}: {
  headline: string
  description: string
  path: string
  /** ISO date (YYYY-MM-DD), update when the article content materially changes. */
  dateModified: string
  proficiencyLevel?: 'Beginner' | 'Expert'
  keywords?: string[]
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline,
    description,
    url: absoluteUrl(path),
    dateModified,
    proficiencyLevel,
    ...(keywords?.length ? { keywords: keywords.join(', ') } : {}),
    isPartOf: { '@type': 'WebSite', '@id': WEBSITE_ID },
    about: { '@type': 'WebAPI', '@id': WEBAPI_ID },
    author: { '@type': 'Organization', '@id': ORGANIZATION_ID, name: SITE_NAME },
    publisher: { '@type': 'Organization', '@id': ORGANIZATION_ID, name: SITE_NAME },
  }
}

export function buildBlogPostingJsonLd(
  args: Parameters<typeof buildBlogPostingJsonLdFromInput>[1]
) {
  return buildBlogPostingJsonLdFromInput(
    {
      siteName: SITE_NAME,
      siteUrl: SITE_URL,
      logoUrl: absoluteUrl('/logos/busybody-logo.png'),
      absoluteUrl,
    },
    args
  )
}

/** @deprecated Use buildBlogPostingJsonLd */
export function buildArticleJsonLd(args: Parameters<typeof buildBlogPostingJsonLd>[0]) {
  return buildBlogPostingJsonLd(args)
}

export function buildBlogItemListJsonLd(posts: { slug: string; title: string }[]) {
  return buildBlogItemListJsonLdFromInput(
    {
      siteName: SITE_NAME,
      siteUrl: SITE_URL,
      logoUrl: absoluteUrl('/logos/busybody-logo.png'),
      absoluteUrl,
    },
    posts
  )
}

export function buildFaqJsonLd(items: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }
}

export function buildContactPageJsonLd(description: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: `Contact ${SITE_NAME}`,
    description,
    url: absoluteUrl('/contact'),
  }
}

export function buildAboutPageJsonLd(description: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: `About ${SITE_NAME}`,
    description,
    url: absoluteUrl('/about'),
  }
}
