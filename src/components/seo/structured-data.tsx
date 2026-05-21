import Script from 'next/script'
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, SUPPORT_EMAIL, absoluteUrl } from '@/lib/site'

interface StructuredDataProps {
  type: 'organization' | 'website' | 'api' | 'product'
  data?: Record<string, unknown>
}

export function StructuredData({ type, data }: StructuredDataProps) {
  const getStructuredData = () => {
    switch (type) {
      case 'organization':
        return {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: SITE_NAME,
          url: SITE_URL,
          logo: absoluteUrl('/logos/busybody-logo.png'),
          description: SITE_DESCRIPTION,
          email: SUPPORT_EMAIL,
          sameAs: [],
        }

      case 'website':
        return {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: SITE_NAME,
          url: SITE_URL,
          description: SITE_DESCRIPTION,
        }

      case 'api':
        return {
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: SITE_NAME,
          applicationCategory: 'DeveloperApplication',
          operatingSystem: 'Any',
          description: SITE_DESCRIPTION,
          url: SITE_URL,
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

      case 'product':
        return {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: `${SITE_NAME} — Nutrition Database API`,
          description: SITE_DESCRIPTION,
          brand: { '@type': 'Brand', name: SITE_NAME },
          offers: [
            { '@type': 'Offer', name: 'Free', price: '0', priceCurrency: 'USD' },
            { '@type': 'Offer', name: 'Core', price: '99', priceCurrency: 'USD' },
            { '@type': 'Offer', name: 'Plus', price: '299', priceCurrency: 'USD' },
          ],
        }

      default:
        return data || {}
    }
  }

  return (
    <Script
      id={`structured-data-${type}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(getStructuredData()) }}
    />
  )
}
