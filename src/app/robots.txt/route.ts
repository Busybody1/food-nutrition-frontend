import { buildRobotsTxt } from '@/lib/robots-txt'
import { SITE_URL } from '@/lib/site'

export const dynamic = 'force-static'

export function GET() {
  const body = buildRobotsTxt(SITE_URL)

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
    },
  })
}
