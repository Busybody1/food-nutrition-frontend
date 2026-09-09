import { SITE_URL } from '@/lib/site'

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
