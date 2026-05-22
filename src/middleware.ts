import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/** Enforce canonical host + HTTPS from NEXT_PUBLIC_SITE_URL (e.g. https://www.calorieapi.com). */
export function middleware(request: NextRequest) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()
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

  if (target.hostname !== preferred.hostname) {
    target.hostname = preferred.hostname
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
