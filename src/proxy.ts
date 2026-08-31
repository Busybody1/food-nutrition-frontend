import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getCanonicalRedirectUrl } from '@/lib/canonical-redirect';

export function proxy(request: NextRequest) {
  const redirectUrl = getCanonicalRedirectUrl({
    pathname: request.nextUrl.pathname,
    search: request.nextUrl.search,
    protocol: request.nextUrl.protocol,
    host: request.headers.get('host'),
    forwardedProto: request.headers.get('x-forwarded-proto'),
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
  });

  if (!redirectUrl) {
    return NextResponse.next();
  }

  return NextResponse.redirect(redirectUrl, 301);
}

export const config = {
  matcher: [
    /*
     * Skip SEO/crawler files, no canonical redirects; avoids GSC fetch edge cases.
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|openapi.json|llms.txt|llms-full.txt|blog/feed.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
