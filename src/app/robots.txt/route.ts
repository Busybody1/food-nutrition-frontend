import { SITE_URL } from '@/lib/site'

/**
 * Custom robots.txt served as a Route Handler instead of the metadata
 * `robots.ts` helper, which has no field for `Content-Signal`.
 *
 * `Content-Signal` (contentsignals.org) is an advisory AI content-usage
 * preference and is INDEPENDENT of Allow/Disallow — every crawler, GPTBot
 * included, stays allowed. Here we declare: OK to index for search and to use
 * as AI-answer input, but not for model training (ai-train=no).
 */
export const dynamic = 'force-static'

const DISALLOW = [
  '/dashboard/',
  '/admin/',
  '/auth/',
  '/checkout',
  '/feedback/',
  '/api/',
]

export function GET() {
  const body = [
    'User-agent: *',
    'Content-Signal: search=yes, ai-input=yes, ai-train=no',
    'Allow: /',
    ...DISALLOW.map((path) => `Disallow: ${path}`),
    '',
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    '',
  ].join('\n')

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
    },
  })
}
