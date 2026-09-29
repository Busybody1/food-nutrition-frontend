export type McpFaq = { q: string; a: string }

type McpOfferInput = {
  name: string
  price: number
  unitCode: 'MON' | 'ANN'
  description: string
  url: string
  priceValidUntil: string
  sellerName: string
  sellerUrl: string
  organizationId: string
}

function mcpOffer(input: McpOfferInput) {
  return {
    '@type': 'Offer',
    name: input.name,
    price: String(input.price),
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
    url: input.url,
    description: input.description,
    priceValidUntil: input.priceValidUntil,
    eligibleDuration: {
      '@type': 'QuantitativeValue',
      value: 1,
      unitCode: input.unitCode,
    },
    seller: {
      '@type': 'Organization',
      '@id': input.organizationId,
      name: input.sellerName,
      url: input.sellerUrl,
    },
  }
}

export function buildMcpLandingJsonLd(input: {
  pageUrl: string
  pageName: string
  siteName: string
  siteUrl: string
  organizationId: string
  description: string
  monthlyPrice: number
  annualPrice: number
  priceValidUntil: string
  faqs: readonly McpFaq[]
  steps: readonly { name: string; text: string }[]
  features: readonly string[]
}) {
  const appId = `${input.pageUrl}#nutrition-mcp-server`
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': input.pageUrl,
        url: input.pageUrl,
        name: input.pageName,
        description: input.description,
        inLanguage: 'en-US',
        isAccessibleForFree: true,
        speakable: {
          '@type': 'SpeakableSpecification',
          cssSelector: ['h1', '#mcp-answer'],
        },
        about: { '@id': appId },
        mainEntity: { '@id': appId },
      },
      {
        '@type': 'SoftwareApplication',
        '@id': appId,
        name: 'Nutrition MCP server',
        applicationCategory: 'HealthApplication',
        operatingSystem: 'Claude Code, Cursor',
        description: input.description,
        url: input.pageUrl,
        featureList: [...input.features],
        provider: { '@id': input.organizationId },
        offers: [
          mcpOffer({
            name: 'Nutrition MCP server monthly',
            price: input.monthlyPrice,
            unitCode: 'MON',
            description: `$${input.monthlyPrice} per month for personal use. MCP tools only.`,
            url: input.pageUrl,
            priceValidUntil: input.priceValidUntil,
            sellerName: input.siteName,
            sellerUrl: input.siteUrl,
            organizationId: input.organizationId,
          }),
          mcpOffer({
            name: 'Nutrition MCP server annual',
            price: input.annualPrice,
            unitCode: 'ANN',
            description: `$${input.annualPrice} billed once per year for personal use. MCP tools only.`,
            url: input.pageUrl,
            priceValidUntil: input.priceValidUntil,
            sellerName: input.siteName,
            sellerUrl: input.siteUrl,
            organizationId: input.organizationId,
          }),
        ],
      },
      {
        '@type': 'HowTo',
        '@id': `${input.pageUrl}#how-to-connect`,
        name: 'How to connect a nutrition MCP server',
        description: 'Connect Claude Code or Cursor to the nutrition MCP server with an API key.',
        step: input.steps.map((step, index) => ({
          '@type': 'HowToStep',
          position: index + 1,
          name: step.name,
          text: step.text,
        })),
      },
      {
        '@type': 'FAQPage',
        '@id': `${input.pageUrl}#faq`,
        mainEntity: input.faqs.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      },
    ],
  }
}

export function buildMcpPricingJsonLd(input: {
  pageUrl: string
  pageName: string
  siteName: string
  siteUrl: string
  organizationId: string
  description: string
  imageUrl: string
  monthlyPrice: number
  annualPrice: number
  priceValidUntil: string
  faqs: readonly McpFaq[]
}) {
  const appId = `${input.pageUrl}#nutrition-mcp-server`
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': input.pageUrl,
        url: input.pageUrl,
        name: input.pageName,
        description: input.description,
        inLanguage: 'en-US',
        isAccessibleForFree: true,
        speakable: {
          '@type': 'SpeakableSpecification',
          cssSelector: ['h1', '#mcp-pricing-answer'],
        },
        about: { '@id': appId },
        mainEntity: { '@id': appId },
      },
      {
        '@type': 'SoftwareApplication',
        '@id': appId,
        name: 'Nutrition MCP server',
        applicationCategory: 'HealthApplication',
        operatingSystem: 'Claude Code, Cursor',
        description: input.description,
        url: input.pageUrl,
        image: [input.imageUrl],
        provider: { '@id': input.organizationId },
        offers: [
          mcpOffer({
            name: 'Nutrition MCP server monthly',
            price: input.monthlyPrice,
            unitCode: 'MON',
            description: `$${input.monthlyPrice} per month. 7-day trial, card required. MCP tools only.`,
            url: input.pageUrl,
            priceValidUntil: input.priceValidUntil,
            sellerName: input.siteName,
            sellerUrl: input.siteUrl,
            organizationId: input.organizationId,
          }),
          mcpOffer({
            name: 'Nutrition MCP server annual',
            price: input.annualPrice,
            unitCode: 'ANN',
            description: `$${input.annualPrice} billed once per year. MCP tools only.`,
            url: input.pageUrl,
            priceValidUntil: input.priceValidUntil,
            sellerName: input.siteName,
            sellerUrl: input.siteUrl,
            organizationId: input.organizationId,
          }),
        ],
      },
      {
        '@type': 'FAQPage',
        '@id': `${input.pageUrl}#faq`,
        mainEntity: input.faqs.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      },
    ],
  }
}
