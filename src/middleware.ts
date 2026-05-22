import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const APEX_HOST = 'calorieapi.com'

function isLocalHost(hostname: string): boolean {
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.endsWith('.localhost') ||
    hostname.includes('.herokuapp.com')
  )
}

function requestProtocol(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-proto')
  if (forwarded) return forwarded.split(',')[0].trim()
  return request.nextUrl.protocol.replace(':', '')
}

function requestHostname(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-host')
  if (forwarded) return forwarded.split(',')[0].trim().split(':')[0]
  return request.nextUrl.hostname
}

/**
 * Canonical: https://calorieapi.com (no www).
 * Uses x-forwarded-* headers so Cloudflare/Heroku SSL does not cause redirect loops.
 */
export function middleware(request: NextRequest) {
  const hostname = requestHostname(request)
  const protocol = requestProtocol(request)

  if (isLocalHost(hostname)) {
    return NextResponse.next()
  }

  const siteUrl = process.env.SITE_CANONICAL_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim()?.replace(/\/$/, '')

  let canonicalHost = APEX_HOST
  let requireHttps = true

  if (siteUrl) {
    try {
      const preferred = new URL(siteUrl)
      canonicalHost = preferred.hostname
      requireHttps = preferred.protocol === 'https:'
    } catch {
      // keep defaults
    }
  }

  const onCanonicalHost = hostname === canonicalHost
  const isHttps = protocol === 'https'

  if (onCanonicalHost && (!requireHttps || isHttps)) {
    return NextResponse.next()
  }

  const destination = new URL(request.nextUrl.pathname + request.nextUrl.search, 'https://')
  destination.hostname = canonicalHost
  if (requireHttps) {
    destination.protocol = 'https:'
  }

  return NextResponse.redirect(destination, 301)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images|logos|opengraph-image|robots.txt|sitemap.xml|llms.txt).*)',
  ],
}
