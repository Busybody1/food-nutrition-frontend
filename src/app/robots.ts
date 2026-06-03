import { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

function canonicalHost(): string {
  try {
    return new URL(SITE_URL).hostname
  } catch {
    return 'calorieapi.com'
  }
}

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/admin/', '/checkout', '/api/'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: canonicalHost(),
  }
}
