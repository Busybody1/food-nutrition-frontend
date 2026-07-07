import { NextResponse } from 'next/server'
import { absoluteUrl, SITE_NAME } from '@/lib/site'

/**
 * RFC 9727 API catalog served as an RFC 9264 linkset. Advertised from the
 * homepage `Link` header (rel="api-catalog") so agents can discover our
 * machine-readable spec, docs, and health endpoint without scraping the page.
 *
 * `anchor` is the API's base URL; service-desc/service-doc/status point at the
 * live OpenAPI spec, human docs, and health check respectively.
 */
export const dynamic = 'force-static'

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || 'https://calorieapiadmin.com'
).replace(/\/$/, '')

export function GET() {
  const linkset = {
    linkset: [
      {
        anchor: API_BASE_URL,
        'service-desc': [
          {
            href: `${API_BASE_URL}/openapi.json`,
            type: 'application/json',
            title: `${SITE_NAME} OpenAPI specification`,
          },
        ],
        'service-doc': [
          {
            href: absoluteUrl('/docs'),
            type: 'text/html',
            title: `${SITE_NAME} documentation`,
          },
        ],
        status: [
          {
            href: `${API_BASE_URL}/health`,
            type: 'application/json',
            title: `${SITE_NAME} health status`,
          },
        ],
        describedby: [
          {
            href: absoluteUrl('/llms.txt'),
            type: 'text/markdown',
            title: `${SITE_NAME} overview for LLMs`,
          },
        ],
      },
    ],
  }

  return new NextResponse(JSON.stringify(linkset, null, 2), {
    headers: {
      'Content-Type': 'application/linkset+json',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
