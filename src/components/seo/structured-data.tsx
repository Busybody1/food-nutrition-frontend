import Script from 'next/script'

interface StructuredDataProps {
  type: 'organization' | 'website' | 'api' | 'product'
  data?: Record<string, unknown>
}

export function StructuredData({ type, data }: StructuredDataProps) {
  const getStructuredData = () => {
    switch (type) {
      case 'organization':
        return {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Busybody",
          "url": "https://busybody.com",
          "logo": "https://busybody.com/logos/busybody-logo.png",
          "description": "Comprehensive food and nutrition database API for developers building health and fitness applications",
          "foundingDate": "2024",
          "founders": [
            {
              "@type": "Person",
              "name": "Sarah Chen"
            },
            {
              "@type": "Person", 
              "name": "Marcus Rodriguez"
            }
          ],
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+1-555-123-4567",
            "contactType": "customer service",
            "email": "support@foodapi.com"
          },
          "sameAs": [
            "https://twitter.com/foodapi",
            "https://github.com/foodapi",
            "https://linkedin.com/company/foodapi"
          ]
        }

      case 'website':
        return {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Busybody",
          "url": "https://busybody.com",
          "description": "Comprehensive food and nutrition database API for developers",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://busybody.com/search?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        }

      case 'api':
        return {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "Busybody",
          "applicationCategory": "DeveloperApplication",
          "operatingSystem": "Any",
          "description": "Comprehensive food and nutrition database API with 900K+ food items and 28 nutrients",
          "url": "https://busybody.com",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD",
            "description": "Free tier with 1,000 requests per month"
          },
          "featureList": [
            "900K+ food items",
            "28 nutrients per food",
            "615K+ UPC codes",
            "Advanced search capabilities",
            "RESTful API",
            "99.9% uptime"
          ]
        }

      case 'product':
        return {
          "@context": "https://schema.org",
          "@type": "Product",
          "name": "Busybody - Nutrition Database API",
          "description": "Comprehensive food and nutrition database API for developers",
          "brand": {
            "@type": "Brand",
            "name": "Busybody"
          },
          "offers": [
            {
              "@type": "Offer",
              "name": "Free Plan",
              "price": "0",
              "priceCurrency": "USD",
              "description": "1,000 requests per month"
            },
            {
              "@type": "Offer",
              "name": "Core Plan",
              "price": "99",
              "priceCurrency": "USD",
              "description": "750,000 requests per month"
            },
            {
              "@type": "Offer",
              "name": "Plus Plan",
              "price": "299",
              "priceCurrency": "USD",
              "description": "3,000,000 requests per month"
            }
          ]
        }

      default:
        return data || {}
    }
  }

  return (
    <Script
      id={`structured-data-${type}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(getStructuredData(), null, 2)
      }}
    />
  )
}

