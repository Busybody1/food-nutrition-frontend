export type PricingPlanOffer = { name: string; price: string }

export type PricingProductJsonLdInput = {
  siteName: string
  siteUrl: string
  siteDescription: string
  imageUrl: string
  pricingUrl: string
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
    '@type': 'SoftwareApplication',
    name: `${input.siteName} - Nutrition & Food Database API`,
    description: input.siteDescription,
    url: input.pricingUrl,
    image: [input.imageUrl],
    brand: { '@type': 'Brand', name: input.siteName },
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any',
    offers: input.plans.map(({ name, price }) => buildDigitalProductOffer(input, name, price)),
  }
}
