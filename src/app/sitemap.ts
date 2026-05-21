import { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE_URL
  const now = new Date()
  const publicPaths = [
    { path: '', priority: 1, changeFrequency: 'weekly' as const },
    { path: '/docs', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/pricing', priority: 0.9, changeFrequency: 'monthly' as const },
    { path: '/faq', priority: 0.85, changeFrequency: 'monthly' as const },
    { path: '/about', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/contact', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/privacy', priority: 0.4, changeFrequency: 'yearly' as const },
    { path: '/terms', priority: 0.4, changeFrequency: 'yearly' as const },
    { path: '/cookies', priority: 0.3, changeFrequency: 'yearly' as const },
    { path: '/api-status', priority: 0.6, changeFrequency: 'daily' as const },
    { path: '/changelog', priority: 0.5, changeFrequency: 'weekly' as const },
  ]

  return publicPaths.map(({ path, priority, changeFrequency }) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }))
}
