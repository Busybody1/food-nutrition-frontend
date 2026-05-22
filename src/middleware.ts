import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Enforces canonical URL from NEXT_PUBLIC_SITE_URL (production: https://calorieapi.com).
 * - HTTP → HTTPS
 * - www.calorieapi.com → calorieapi.com
 * - Any other host → hostname from SITE_URL
 */
export function middleware(request: NextRequest) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, '')
  if (!siteUrl) return NextResponse.next()

  let preferred: URL
  try {
    preferred = new URL(siteUrl)
  } catch {
    return NextResponse.next()
  }

  const target = request.nextUrl.clone()
  let changed = false

  if (preferred.protocol === 'https:' && target.protocol !== 'https:') {
    target.protocol = 'https:'
    changed = true
  }

  const canonicalHost = preferred.hostname

  if (target.hostname !== canonicalHost) {
    target.hostname = canonicalHost
    changed = true
  }

  if (changed) {
    return NextResponse.redirect(target, 301)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images|logos|opengraph-image|robots.txt|sitemap.xml|llms.txt).*)',
  ],
}
