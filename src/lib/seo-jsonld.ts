import {
  OG_IMAGE_URL,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
} from '@/lib/site'
import { buildPricingProductJsonLdFromInput } from '@/lib/pricing-product-jsonld'

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

export function buildArticleJsonLd({
  title,
  description,
  path,
  datePublished,
  dateModified,
  image,
}: {
  title: string
  description: string
  path: string
  datePublished?: string | null
  dateModified?: string | null
  image?: string | null
}) {
  const url = absoluteUrl(path)
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    url,
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
