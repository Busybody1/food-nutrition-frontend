import { NextResponse } from 'next/server'
import { absoluteUrl, SITE_NAME } from '@/lib/site'

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
            href: absoluteUrl('/openapi.json'),
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
