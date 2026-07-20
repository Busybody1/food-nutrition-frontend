export type BlogDiscoveryPost = {
  slug: string
  title: string
  excerpt?: string | null
  meta_description?: string | null
  keywords?: string | null
  published_at?: string | null
  updated_at?: string | null
}

export type BlogDiscoveryPricingPlan = {
  name: string
  monthly_price: number
  monthly_quota: number
  rate_limit_per_minute: number
}

export type BlogDiscoverySite = {
  siteName: string
  siteDescription: string
  siteUrl: string
  supportEmail: string
  apiBaseUrl: string
  blogUrl: string
  feedUrl: string
  blogPostUrl: (slug: string) => string
}

export type DiscoveryCatalogEntry = {
  url: string
  title: string
  summary: string
}

/** Registry-derived page catalog so llms.txt lists every public surface without drift. */
export type DiscoveryCatalog = {
  docs: DiscoveryCatalogEntry[]
  guides: DiscoveryCatalogEntry[]
  capabilities: DiscoveryCatalogEntry[]
  solutions: DiscoveryCatalogEntry[]
  comparisons: DiscoveryCatalogEntry[]
}

function catalogLines(entries: DiscoveryCatalogEntry[]): string {
  return entries.map((e) => `- [${e.title}](${e.url}): ${e.summary}`).join('\n')
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function postSummary(post: BlogDiscoveryPost): string {
  return post.meta_description || post.excerpt || post.title
}

function postKeywords(post: BlogDiscoveryPost): string | null {
  const keywords = post.keywords?.trim()
  return keywords || null
}

export function buildBlogRssXmlFromInput(
  posts: BlogDiscoveryPost[],
  site: BlogDiscoverySite
): string {
  const latest = posts[0]?.updated_at || posts[0]?.published_at
  const lastBuildDate = latest ? new Date(latest).toUTCString() : new Date().toUTCString()

  const items = posts
    .map((post) => {
      const link = site.blogPostUrl(post.slug)
      const pubDate = post.published_at
        ? new Date(post.published_at).toUTCString()
        : lastBuildDate
      const description = escapeXml(postSummary(post))
      const categories = (post.keywords || '')
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean)
        .slice(0, 5)
        .map((cat) => `<category>${escapeXml(cat)}</category>`)
        .join('\n      ')

      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${description}</description>
      ${categories}
    </item>`
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(`${site.siteName} Blog`)}</title>
    <link>${site.blogUrl}</link>
    <description>${escapeXml(`Developer guides on nutrition &amp; food APIs from ${site.siteName}.`)}</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${site.feedUrl}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`
}

function formatDiscoveryPlanPrice(plan: BlogDiscoveryPricingPlan): string {
  const tier = plan.name.toLowerCase()
  if (tier === 'enterprise' || tier === 'custom') return 'Custom'
  return `$${plan.monthly_price}`
}

function formatDiscoveryQuota(quota: number): string {
  if (quota <= 0) return 'See pricing page'
  return quota.toLocaleString('en-US')
}

function formatDiscoveryRateLimit(rpm: number): string {
  if (rpm <= 0) return 'Custom'
  return `${rpm}/min`
}

function commercialUseLabel(name: string): string {
  const tier = name.toLowerCase()
  if (tier === 'free') return 'No (dev & personal only)'
  if (tier === 'plus') return 'Yes - production apps'
  if (tier === 'enterprise' || tier === 'custom') return 'Yes - SLA, phone support'
  return 'No'
}

const FALLBACK_PRICING_ROWS: BlogDiscoveryPricingPlan[] = [
  { name: 'Free', monthly_price: 0, monthly_quota: 1000, rate_limit_per_minute: 10 },
  { name: 'Basic', monthly_price: 29, monthly_quota: 100_000, rate_limit_per_minute: 200 },
  { name: 'Core', monthly_price: 99, monthly_quota: 750_000, rate_limit_per_minute: 500 },
  { name: 'Plus', monthly_price: 299, monthly_quota: 0, rate_limit_per_minute: 5000 },
  { name: 'Enterprise', monthly_price: 0, monthly_quota: 0, rate_limit_per_minute: 0 },
]

function buildPricingTableRows(plans?: BlogDiscoveryPricingPlan[]): string {
  const rows = plans?.length ? plans : FALLBACK_PRICING_ROWS
  return rows
    .map(
      (plan) =>
        `| ${plan.name} | ${formatDiscoveryPlanPrice(plan)} | ${formatDiscoveryQuota(plan.monthly_quota)} | ${formatDiscoveryRateLimit(plan.rate_limit_per_minute)} | ${commercialUseLabel(plan.name)} |`
    )
    .join('\n')
}

export function buildLlmsTxtFromInput(
  posts: BlogDiscoveryPost[],
  site: BlogDiscoverySite,
  pricingPlans?: BlogDiscoveryPricingPlan[],
  catalog?: DiscoveryCatalog
): string {
  const blogLines =
    posts.length > 0
      ? posts
          .map((post) => {
            const url = site.blogPostUrl(post.slug)
            const summary = postSummary(post)
            const keywords = postKeywords(post)
            const keywordSuffix = keywords ? ` | keywords: ${keywords}` : ''
            return `- [${post.title}](${url}): ${summary}${keywordSuffix}`
          })
          .join('\n')
      : '- No articles published yet.'

  return `# ${site.siteName}

> ${site.siteDescription}

## Overview
${site.siteName} is a REST API for nutrition and food data. Developers use API keys (X-API-Key header) or JWT from the dashboard to power meal logging, macro tracking, barcode scanning, and autocomplete in health and fitness apps.

## Food database
- Approximately 4 million food records spanning global cuisines and regional products - not limited to Western or US-only catalogs.
- Coverage includes packaged goods, branded items, restaurant-style entries, and culturally diverse ingredients across markets worldwide.
- Barcode (UPC/EAN) lookup for retail products; text search and suggest for common and regional food names.
- Verified foods filter for higher-confidence nutrition values.

## Nutrition & serving sizes
- Every food includes standardized macro and micronutrient values per 100g for consistent comparison and calculation.
- Multiple real-world serving sizes - not just 100g. Each record may include serving_size (grams), serving_unit (e.g. cup, slice, piece), and serving (human-readable label such as "1 medium apple" or "1 tbsp").
- Search and food-detail responses expose per-serving calculated values alongside per_100g nutrient arrays, so logging apps can display portions users actually eat without manual conversion.
- Full nutrient payloads (calories, protein, carbs, fat, vitamins, minerals) suitable for diet tracking and wellness products.

## Pricing (USD, monthly)
All plans include search, suggest, and barcode endpoints. Rate limits apply per account (user id), not per IP. Live quotas: ${site.siteUrl}/pricing

| Plan | Price | API calls / month | Rate limit | Commercial use |
|------|-------|-------------------|------------|----------------|
${buildPricingTableRows(pricingPlans)}

Notes:
- Commercial production use requires Plus or Enterprise. Send header X-API-Usage-Type: commercial when applicable.
- Plus and Enterprise include Redis response caching (5 min) on GET search and food endpoints.
- Enterprise: custom volume, image-to-calorie API, credits-based usage, 99.99% SLA, white-label, on-premise options - contact sales at ${site.siteUrl}/contact?inquiry=enterprise

## Base URL
- API: configured per deployment (see developer docs)
- Website: [${site.siteName}](${site.siteUrl})

## Key endpoints
- GET /api/v1/search/foods - search with q, limit, skip, brand, brand_id, category, category_id, nutrient_id, min/max_amount, min/max macros, match_mode, verified_only
- GET /api/v1/search/suggest - autocomplete (q, limit)
- GET /api/v1/search/barcode/{upc} - barcode lookup
- GET /api/v1/foods/{id} - food details with nutrients, verified_portions, default_portion, and barcodes
- Search hits include default_portion + portions_count; portion_nutrients/meal scale with default grams (nutrients/*_100g stay per 100g)
- GET /api/v1/catalog/foods - food metadata only (no nutrients), higher limit (max 100), same filters
- GET /api/v1/catalog/foods/{id} - food metadata by ID (no nutrients)
- GET /api/v1/catalog/brands|categories|nutrients - taxonomy for filter pickers
- GET /api/v1/public/search/foods - IP-rate-limited public demo with the same filters (limit max 10)
- GET /api/v1/public/catalog/* - public meta/taxonomy demos (aligned filters, lower limits)

## Authentication
- Header: X-API-Key: <your_key>
- Or: Authorization: Bearer <jwt>

## Documentation
- [Documentation hub](${site.siteUrl}/docs): API reference, quickstart, and integration guides
- [llms-full.txt](${site.siteUrl}/llms-full.txt): full plain-text documentation for LLMs
${catalog ? `\n### API reference pages\n${catalogLines(catalog.docs)}\n\n### Integration guides\n${catalogLines(catalog.guides)}\n` : ''}
${catalog ? `## Product pages\n${catalogLines(catalog.capabilities)}\n\n## Solutions\n${catalogLines(catalog.solutions)}\n\n## Nutrition API comparisons\n${catalogLines(catalog.comparisons)}\n` : ''}
## Blog (developer guides)
- [Blog index](${site.blogUrl}): developer guides on calorie APIs, nutrition data, and integrations
- [RSS feed](${site.feedUrl}): subscribe to new articles

### Published articles
${blogLines}

## Blog JSON API
Machine-readable blog content for integrations, search, and AI crawlers:
- [Published posts JSON](${site.apiBaseUrl}/api/v1/public/blog): list published posts (title, excerpt, keywords, dates)
- [Slug list JSON](${site.apiBaseUrl}/api/v1/public/blog/slugs): slug list with updated_at for sitemaps
- GET ${site.apiBaseUrl}/api/v1/public/blog/{slug} - full article markdown, FAQ, and metadata (per-slug template)

## Public pages
- [Pricing](${site.siteUrl}/pricing): API plans, quotas, and enterprise
- [Blog](${site.siteUrl}/blog): developer guides on calorie APIs, nutrition data, and integrations
- [FAQ](${site.siteUrl}/faq): authentication, search, commercial use, serving data
- [Solutions](${site.siteUrl}/solutions): use cases - fitness, meal planning, healthcare, grocery, wellness
- [Compare](${site.siteUrl}/compare): honest nutrition API comparisons (Nutritionix, Edamam, USDA, Spoonacular, FatSecret, Open Food Facts)
- [Playground](${site.siteUrl}/playground): try endpoints live without an API key
- [About](${site.siteUrl}/about): mission and platform overview
- [Contact](${site.siteUrl}/contact): support and sales
- [API status](${site.siteUrl}/api-status): service health
- [Changelog](${site.siteUrl}/changelog): release notes

## Support
- [Email support](mailto:${site.supportEmail}): ${site.supportEmail}

## Legal
- [Privacy Policy](${site.siteUrl}/privacy)
- [Terms of Service](${site.siteUrl}/terms)
- [Cookie Policy](${site.siteUrl}/cookies)
`
}
