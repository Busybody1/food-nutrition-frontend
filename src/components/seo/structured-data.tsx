import { buildPricingProductJsonLd } from '@/lib/seo-jsonld'
import {
  SITE_URL,
  SITE_NAME,
  SITE_DESCRIPTION,
  SUPPORT_EMAIL,
  LEGAL_NAME,
  ORG_SAMEAS,
  ORG_FOUNDING_DATE,
  ORGANIZATION_ID,
  WEBSITE_ID,
  SOFTWARE_ID,
  WEBAPI_ID,
  absoluteUrl,
} from '@/lib/site'

interface StructuredDataProps {
  type: 'organization' | 'website' | 'api' | 'webapi' | 'product'
  data?: Record<string, unknown>
}

function jsonLdHtml(data: unknown): string {
  const serialized = JSON.stringify(data ?? {}) ?? '{}'
  return serialized.replace(/</g, '\\u003c')
}

function getStructuredData(type: StructuredDataProps['type'], data?: Record<string, unknown>) {
  switch (type) {
    case 'organization':
      return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        '@id': ORGANIZATION_ID,
        name: SITE_NAME,
        legalName: LEGAL_NAME,
        url: SITE_URL,
        logo: absoluteUrl('/logos/busybody-logo.png'),
        description: SITE_DESCRIPTION,
        email: SUPPORT_EMAIL,
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'technical support',
          email: SUPPORT_EMAIL,
          url: absoluteUrl('/contact'),
        },
        ...(ORG_FOUNDING_DATE ? { foundingDate: ORG_FOUNDING_DATE } : {}),
        ...(ORG_SAMEAS.length > 0 ? { sameAs: ORG_SAMEAS } : {}),
      }

    case 'website':
      return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': WEBSITE_ID,
        name: SITE_NAME,
        url: SITE_URL,
        description: SITE_DESCRIPTION,
        publisher: { '@id': ORGANIZATION_ID },
      }

    case 'api':
      return {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        '@id': SOFTWARE_ID,
        name: SITE_NAME,
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Any',
        description: SITE_DESCRIPTION,
        url: SITE_URL,
        provider: { '@id': ORGANIZATION_ID },
        softwareHelp: absoluteUrl('/docs'),
        termsOfService: absoluteUrl('/terms'),
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
          description: 'Free developer tier with monthly API quota',
        },
        featureList: [
          'Food search with match_mode and verified_only',
          'Autocomplete suggest endpoint',
          'Barcode lookup',
          'REST JSON API',
          'API key authentication',
        ],
      }

    case 'webapi':
      return {
        '@context': 'https://schema.org',
        '@type': 'WebAPI',
        '@id': WEBAPI_ID,
        name: `${SITE_NAME} REST API`,
        description: SITE_DESCRIPTION,
        url: SITE_URL,
        documentation: absoluteUrl('/docs'),
        termsOfService: absoluteUrl('/terms'),
        provider: { '@id': ORGANIZATION_ID },
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
          description: 'Free developer tier with monthly API quota',
        },
      }

    case 'product':
      return buildPricingProductJsonLd()

    default:
      return data || {}
  }
}

/** Inline JSON-LD in SSR HTML (not next/script, avoids extra client JS and blocking). */
function JsonLdInline({ id, __html }: { id: string; __html: string }) {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html }}
    />
  )
}

export function StructuredData({ type, data }: StructuredDataProps) {
  const __html = jsonLdHtml(getStructuredData(type, data))
  return <JsonLdInline id={`structured-data-${type}`} __html={__html} />
}

export function JsonLdScript({ id, data }: { id: string; data: unknown }) {
  const __html = jsonLdHtml(data)
  return <JsonLdInline id={id} __html={__html} />
}
