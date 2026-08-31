import { NextResponse } from 'next/server'
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  SUPPORT_EMAIL,
  absoluteUrl,
} from '@/lib/site'
import { loadPublicOpenApiDocument } from '@/lib/public-openapi'

export const revalidate = 3600

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://calorieapiadmin.com').replace(
  /\/$/,
  ''
)

export async function GET() {
  try {
    const document = await loadPublicOpenApiDocument({
      siteName: SITE_NAME,
      siteDescription: SITE_DESCRIPTION,
      siteUrl: SITE_URL,
      supportEmail: SUPPORT_EMAIL,
      apiBaseUrl: API_BASE_URL,
      docsUrl: absoluteUrl('/docs'),
      termsUrl: absoluteUrl('/terms'),
      licenseUrl: absoluteUrl('/commercial-license'),
    })

    return NextResponse.json(document, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch {
    return NextResponse.json(
      { error: 'OpenAPI specification unavailable' },
      { status: 502, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}
