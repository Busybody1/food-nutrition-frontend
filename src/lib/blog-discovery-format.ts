export type BlogDiscoveryPost = {
  slug: string
  title: string
  excerpt?: string | null
  meta_description?: string | null
  keywords?: string | null
  published_at?: string | null
  updated_at?: string | null
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

export function buildLlmsTxtFromInput(
  posts: BlogDiscoveryPost[],
  site: BlogDiscoverySite
): string {
  const blogLines =
    posts.length > 0
      ? posts
          .map((post) => {
            const url = site.blogPostUrl(post.slug)
            const summary = postSummary(post)
            const keywords = postKeywords(post)
            const keywordSuffix = keywords ? ` | keywords: ${keywords}` : ''
            return `- ${url} — ${post.title}: ${summary}${keywordSuffix}`
          })
          .join('\n')
      : '- No articles published yet.'

  return `# ${site.siteName}

> ${site.siteDescription}

## Overview
${site.siteName} is a REST API for nutrition and food data. Developers use API keys (X-API-Key header) or JWT from the dashboard to power meal logging, macro tracking, barcode scanning, and autocomplete in health and fitness apps.

## Food database
- Approximately 4 million food records spanning global cuisines and regional products — not limited to Western or US-only catalogs.
- Coverage includes packaged goods, branded items, restaurant-style entries, and culturally diverse ingredients across markets worldwide.
- Barcode (UPC/EAN) lookup for retail products; text search and suggest for common and regional food names.
- Verified foods filter for higher-confidence nutrition values.

## Nutrition & serving sizes
- Every food includes standardized macro and micronutrient values per 100g for consistent comparison and calculation.
- Multiple real-world serving sizes — not just 100g. Each record may include serving_size (grams), serving_unit (e.g. cup, slice, piece), and serving (human-readable label such as "1 medium apple" or "1 tbsp").
- Search and food-detail responses expose per-serving calculated values alongside per_100g nutrient arrays, so logging apps can display portions users actually eat without manual conversion.
- Full nutrient payloads (calories, protein, carbs, fat, vitamins, minerals) suitable for diet tracking and wellness products.

## Pricing (USD, monthly)
All plans include search, suggest, and barcode endpoints. Rate limits apply per account (user id), not per IP. Each plan may access at most 5% of distinct foods in the database per calendar month (anti-scrape). Live quotas: ${site.siteUrl}/pricing

| Plan | Price | API calls / month | Rate limit | Commercial use |
|------|-------|-------------------|------------|----------------|
| Free | $0 | 1,000 | 10/min | No (dev & personal only) |
| Basic | $29 | 100,000 | 200/min | No |
| Core | $99 | 750,000 | 500/min | No |
| Plus | $299 | See pricing page | 5,000/min | Yes — production apps |
| Enterprise | Custom | Negotiated | Custom | Yes — SLA, phone support |

Notes:
- Commercial production use requires Plus or Enterprise. Send header X-API-Usage-Type: commercial when applicable.
- Plus and Enterprise include Redis response caching (5 min) on GET search and food endpoints.
- Enterprise: custom volume, 99.99% SLA, white-label, on-premise options — contact sales at ${site.siteUrl}/contact?inquiry=enterprise

## Base URL
- API: configured per deployment (see developer docs)
- Website: ${site.siteUrl}

## Key endpoints
- GET /api/v1/search/foods — search with q, limit, skip, match_mode (any|all), verified_only
- GET /api/v1/search/suggest — autocomplete (q, limit)
- GET /api/v1/search/barcode/{upc} — barcode lookup
- GET /api/v1/foods/{id} — food details with nutrients, serving metadata, and barcodes
- GET /api/v1/public/search/foods — IP-rate-limited public demo (no API key)

## Authentication
- Header: X-API-Key: <your_key>
- Or: Authorization: Bearer <jwt>

## Documentation
${site.siteUrl}/docs

## Blog (developer guides)
Index: ${site.blogUrl}
RSS: ${site.feedUrl}

### Published articles
${blogLines}

## Blog JSON API
Machine-readable blog content for integrations, search, and AI crawlers:
- GET ${site.apiBaseUrl}/api/v1/public/blog — list published posts (title, excerpt, keywords, dates)
- GET ${site.apiBaseUrl}/api/v1/public/blog/{slug} — full article markdown, FAQ, and metadata
- GET ${site.apiBaseUrl}/api/v1/public/blog/slugs — slug list with updated_at for sitemaps

## Public pages
- ${site.siteUrl}/pricing — API plans, quotas, and enterprise
- ${site.siteUrl}/blog — developer guides on calorie APIs, nutrition data, and integrations
- ${site.siteUrl}/faq — authentication, search, commercial use, serving data
- ${site.siteUrl}/about — mission and platform overview
- ${site.siteUrl}/contact — support and sales
- ${site.siteUrl}/api-status — service health
- ${site.siteUrl}/changelog — release notes

## Support
${site.supportEmail}

## Legal
${site.siteUrl}/privacy
${site.siteUrl}/terms
${site.siteUrl}/cookies
`
}
