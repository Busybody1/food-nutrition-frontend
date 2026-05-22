import { SITE_NAME, SITE_URL, absoluteUrl } from '@/lib/site'

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
