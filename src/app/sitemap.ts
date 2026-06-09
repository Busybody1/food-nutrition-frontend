import { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'
import { getBlogSlugs } from '@/lib/api/blog'

/** Revalidated sitemap so newly published blog posts get indexed. */
export const revalidate = 300

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE_URL
  const now = new Date()
  const publicPaths = [
    { path: '', priority: 1, changeFrequency: 'weekly' as const },
    { path: '/docs', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/pricing', priority: 0.9, changeFrequency: 'monthly' as const },
    { path: '/faq', priority: 0.85, changeFrequency: 'monthly' as const },
    { path: '/blog', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/about', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/contact', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/privacy', priority: 0.4, changeFrequency: 'yearly' as const },
    { path: '/terms', priority: 0.4, changeFrequency: 'yearly' as const },
    { path: '/cookies', priority: 0.3, changeFrequency: 'yearly' as const },
    { path: '/api-status', priority: 0.6, changeFrequency: 'daily' as const },
    { path: '/changelog', priority: 0.5, changeFrequency: 'weekly' as const },
  ]

  const staticEntries: MetadataRoute.Sitemap = publicPaths.map(
    ({ path, priority, changeFrequency }) => ({
      url: path ? `${base}${path}` : `${base}/`,
      lastModified: now,
      changeFrequency,
      priority,
    })
  )

  let blogEntries: MetadataRoute.Sitemap = []
  try {
    const blogSlugs = await getBlogSlugs()
    blogEntries = blogSlugs.map((post) => ({
      url: `${base}/blog/${post.slug}`,
      lastModified: post.updated_at ? new Date(post.updated_at) : now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))
  } catch {
    // Keep static URLs in the sitemap when the blog API is unavailable.
  }

  return [...staticEntries, ...blogEntries]
}
