export type PricingPlanOffer = { name: string; price: string }

export type PricingProductJsonLdInput = {
  siteName: string
  siteUrl: string
  siteDescription: string
  imageUrl: string
  pricingUrl: string
  termsUrl: string
  plans: readonly PricingPlanOffer[]
  priceValidUntil: string
}

function pricingOfferUrl(pricingUrl: string, planName: string): string {
  return `${pricingUrl}#${planName.toLowerCase()}`
}

function buildDigitalProductOffer(
  input: PricingProductJsonLdInput,
  name: string,
  price: string
) {
  return {
    '@type': 'Offer',
    name,
    price,
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
    url: pricingOfferUrl(input.pricingUrl, name),
    priceValidUntil: input.priceValidUntil,
    eligibleDuration: {
      '@type': 'QuantitativeValue',
      value: 1,
      unitCode: 'MON',
    },
    shippingDetails: {
      '@type': 'OfferShippingDetails',
      shippingRate: {
        '@type': 'MonetaryAmount',
        value: '0',
        currency: 'USD',
      },
      deliveryTime: {
        '@type': 'ShippingDeliveryTime',
        handlingTime: {
          '@type': 'QuantitativeValue',
          minValue: 0,
          maxValue: 0,
          unitCode: 'DAY',
        },
        transitTime: {
          '@type': 'QuantitativeValue',
          minValue: 0,
          maxValue: 0,
          unitCode: 'DAY',
        },
      },
      shippingDestination: {
        '@type': 'DefinedRegion',
        addressCountry: 'US',
      },
    },
    hasMerchantReturnPolicy: {
      '@type': 'MerchantReturnPolicy',
      applicableCountry: 'US',
      returnPolicyCategory: 'https://schema.org/MerchantReturnNotPermitted',
      merchantReturnDays: 0,
      returnPolicyUrl: input.termsUrl,
    },
    seller: {
      '@type': 'Organization',
      name: input.siteName,
      url: input.siteUrl,
    },
    itemOffered: {
      '@type': 'Service',
      name: `${input.siteName} ${name} plan`,
      url: input.pricingUrl,
    },
  }
}

export function buildPricingProductJsonLdFromInput(input: PricingProductJsonLdInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${input.siteName} — Nutrition Database API`,
    description: input.siteDescription,
    url: input.pricingUrl,
    image: [input.imageUrl],
    brand: { '@type': 'Brand', name: input.siteName },
    category: 'DeveloperApplication',
    offers: input.plans.map(({ name, price }) => buildDigitalProductOffer(input, name, price)),
  }
}
