import type { BlogListItem } from './api/blog.ts'
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  SUPPORT_EMAIL,
  absoluteUrl,
} from './site.ts'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function stripMarkdownForRss(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^#+\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
}

function postSummary(post: BlogListItem): string {
  return post.meta_description || post.excerpt || post.title
}

function postKeywords(post: BlogListItem): string | null {
  const keywords = post.keywords?.trim()
  return keywords || null
}

/** RSS 2.0 feed for blog syndication and LLM/crawler discovery. */
export function buildBlogRssXml(posts: BlogListItem[]): string {
  const channelLink = absoluteUrl('/blog')
  const feedUrl = absoluteUrl('/blog/feed.xml')
  const latest = posts[0]?.updated_at || posts[0]?.published_at
  const lastBuildDate = latest ? new Date(latest).toUTCString() : new Date().toUTCString()

  const items = posts
    .map((post) => {
      const link = absoluteUrl(`/blog/${post.slug}`)
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
    <title>${escapeXml(`${SITE_NAME} Blog`)}</title>
    <link>${channelLink}</link>
    <description>${escapeXml(`Developer guides on nutrition &amp; food APIs from ${SITE_NAME}.`)}</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`
}

/** llms.txt body with a dynamic catalog of published blog posts. */
export function buildLlmsTxt(posts: BlogListItem[]): string {
  const blogLines =
    posts.length > 0
      ? posts
          .map((post) => {
            const url = absoluteUrl(`/blog/${post.slug}`)
            const summary = postSummary(post)
            const keywords = postKeywords(post)
            const keywordSuffix = keywords ? ` | keywords: ${keywords}` : ''
            return `- ${url} — ${post.title}: ${summary}${keywordSuffix}`
          })
          .join('\n')
      : '- No articles published yet.'

  return `# ${SITE_NAME}

> ${SITE_DESCRIPTION}

## Overview
${SITE_NAME} is a REST API for nutrition and food data. Developers use API keys (X-API-Key header) or JWT from the dashboard to power meal logging, macro tracking, barcode scanning, and autocomplete in health and fitness apps.

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
All plans include search, suggest, and barcode endpoints. Rate limits apply per account (user id), not per IP. Each plan may access at most 5% of distinct foods in the database per calendar month (anti-scrape). Live quotas: ${SITE_URL}/pricing

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
- Enterprise: custom volume, 99.99% SLA, white-label, on-premise options — contact sales at ${SITE_URL}/contact?inquiry=enterprise

## Base URL
- API: configured per deployment (see developer docs)
- Website: ${SITE_URL}

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
${SITE_URL}/docs

## Blog (developer guides)
Index: ${SITE_URL}/blog
RSS: ${absoluteUrl('/blog/feed.xml')}

### Published articles
${blogLines}

## Blog JSON API
Machine-readable blog content for integrations, search, and AI crawlers:
- GET ${API_BASE_URL}/api/v1/public/blog — list published posts (title, excerpt, keywords, dates)
- GET ${API_BASE_URL}/api/v1/public/blog/{slug} — full article markdown, FAQ, and metadata
- GET ${API_BASE_URL}/api/v1/public/blog/slugs — slug list with updated_at for sitemaps

## Public pages
- ${SITE_URL}/pricing — API plans, quotas, and enterprise
- ${SITE_URL}/blog — developer guides on calorie APIs, nutrition data, and integrations
- ${SITE_URL}/faq — authentication, search, commercial use, serving data
- ${SITE_URL}/about — mission and platform overview
- ${SITE_URL}/contact — support and sales
- ${SITE_URL}/api-status — service health
- ${SITE_URL}/changelog — release notes

## Support
${SUPPORT_EMAIL}

## Legal
${SITE_URL}/privacy
${SITE_URL}/terms
${SITE_URL}/cookies
`
}

export { stripMarkdownForRss }
