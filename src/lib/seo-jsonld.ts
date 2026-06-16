import {
  OG_IMAGE_URL,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
} from './site.ts'
import { buildPricingProductJsonLdFromInput } from './pricing-product-jsonld.ts'

const PRICING_PLANS = [
  { name: 'Free', price: '0' },
  { name: 'Basic', price: '29' },
  { name: 'Core', price: '99' },
  { name: 'Plus', price: '299' },
] as const

/** Product JSON-LD for pricing pages — satisfies Google Product/Offer required fields. */
export function buildPricingProductJsonLd() {
  return buildPricingProductJsonLdFromInput({
    siteName: SITE_NAME,
    siteUrl: SITE_URL,
    siteDescription: SITE_DESCRIPTION,
    imageUrl: OG_IMAGE_URL,
    pricingUrl: absoluteUrl('/pricing'),
    termsUrl: absoluteUrl('/terms'),
    plans: PRICING_PLANS,
    priceValidUntil: `${new Date().getFullYear() + 1}-12-31`,
  })
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
      name: SITE_NAME,
      url: SITE_URL,
    },
  }
}

export function buildBlogPostingJsonLd({
  title,
  description,
  path,
  datePublished,
  dateModified,
  image,
  keywords,
  wordCount,
}: {
  title: string
  description: string
  path: string
  datePublished?: string | null
  dateModified?: string | null
  image?: string | null
  keywords?: string[] | null
  wordCount?: number
}) {
  const url = absoluteUrl(path)
  const keywordText =
    keywords?.filter(Boolean).join(', ') ||
    undefined

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': url,
    headline: title,
    description,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    url,
    inLanguage: 'en-US',
    isAccessibleForFree: true,
    articleSection: 'Developer guides',
    ...(datePublished ? { datePublished } : {}),
    dateModified: dateModified || datePublished || undefined,
    author: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: absoluteUrl('/logos/busybody-logo.png') },
    },
    ...(image ? { image: [image] } : {}),
    ...(keywordText ? { keywords: keywordText } : {}),
    ...(wordCount && wordCount > 0 ? { wordCount } : {}),
  }
}

/** @deprecated Use buildBlogPostingJsonLd */
export function buildArticleJsonLd(args: Parameters<typeof buildBlogPostingJsonLd>[0]) {
  return buildBlogPostingJsonLd(args)
}

export function buildBlogItemListJsonLd(
  posts: { slug: string; title: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${SITE_NAME} Blog`,
    itemListOrder: 'https://schema.org/ItemListOrderDescending',
    numberOfItems: posts.length,
    itemListElement: posts.map((post, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: post.title,
      url: absoluteUrl(`/blog/${post.slug}`),
    })),
  }
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
