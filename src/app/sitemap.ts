import { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'
import { getBlogSlugs } from '@/lib/api/blog'
import { DOCS_SECTIONS, docsSectionPath } from '@/lib/docs/registry'
import { GUIDES, guidePath } from '@/lib/docs/guides-data'
import { CAPABILITY_PAGES, capabilityPath } from '@/lib/capability-pages-data'
import { SOLUTION_PAGES, solutionPath } from '@/lib/solutions-data'
import { COMPARISON_PAGES, comparisonPath } from '@/lib/comparisons-data'

/** Revalidated sitemap so newly published blog posts get indexed. */
export const revalidate = 300

/**
 * Per-page content dates — bump when a page materially changes.
 * A fixed date is an honest freshness signal; `new Date()` on every crawl is not.
 */
const STATIC_PAGE_DATES: Record<string, string> = {
  '/': '2026-07-03',
  '/docs': '2026-07-03',
  '/docs/guides': '2026-07-03',
  '/playground': '2026-07-03',
  '/pricing': '2026-07-03',
  '/faq': '2026-07-03',
  '/blog': '2026-07-03',
  '/solutions': '2026-07-03',
  '/compare': '2026-07-03',
  '/about': '2026-07-03',
  '/contact': '2026-07-03',
  '/privacy': '2026-07-03',
  '/terms': '2026-07-03',
  '/cookies': '2026-07-03',
  '/api-status': '2026-07-03',
  '/changelog': '2026-07-03',
}

type StaticEntry = {
  path: string
  priority: number
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>
  lastModified?: string
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE_URL

  const corePages: StaticEntry[] = [
    { path: '', priority: 1, changeFrequency: 'weekly' },
    { path: '/docs', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/docs/guides', priority: 0.85, changeFrequency: 'monthly' },
    { path: '/playground', priority: 0.88, changeFrequency: 'weekly' },
    { path: '/pricing', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/faq', priority: 0.85, changeFrequency: 'monthly' },
    { path: '/blog', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/solutions', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/compare', priority: 0.85, changeFrequency: 'monthly' },
    { path: '/about', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/contact', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/privacy', priority: 0.4, changeFrequency: 'yearly' },
    { path: '/terms', priority: 0.4, changeFrequency: 'yearly' },
    { path: '/cookies', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/api-status', priority: 0.6, changeFrequency: 'daily' },
    { path: '/changelog', priority: 0.5, changeFrequency: 'weekly' },
  ]

  const registryPages: StaticEntry[] = [
    ...DOCS_SECTIONS.map((section) => ({
      path: docsSectionPath(section.slug),
      priority: 0.85,
      changeFrequency: 'monthly' as const,
      lastModified: section.dateModified,
    })),
    ...GUIDES.map((guide) => ({
      path: guidePath(guide.slug),
      priority: 0.8,
      changeFrequency: 'monthly' as const,
      lastModified: guide.dateModified,
    })),
    ...CAPABILITY_PAGES.map((page) => ({
      path: capabilityPath(page.slug),
      priority: 0.9,
      changeFrequency: 'monthly' as const,
      lastModified: page.dateModified,
    })),
    ...SOLUTION_PAGES.map((page) => ({
      path: solutionPath(page.slug),
      priority: 0.8,
      changeFrequency: 'monthly' as const,
      lastModified: page.dateModified,
    })),
    ...COMPARISON_PAGES.map((page) => ({
      path: comparisonPath(page.slug),
      priority: 0.85,
      changeFrequency: 'monthly' as const,
      lastModified: page.dateModified,
    })),
  ]

  const staticEntries: MetadataRoute.Sitemap = [...corePages, ...registryPages].map(
    ({ path, priority, changeFrequency, lastModified }) => ({
      url: path ? `${base}${path}` : `${base}/`,
      lastModified: new Date(
        lastModified ?? STATIC_PAGE_DATES[path || '/'] ?? STATIC_PAGE_DATES['/']
      ),
      changeFrequency,
      priority,
    })
  )

  let blogEntries: MetadataRoute.Sitemap = []
  try {
    const blogSlugs = await getBlogSlugs()
    blogEntries = blogSlugs.map((post) => ({
      url: `${base}/blog/${post.slug}`,
      lastModified: post.updated_at ? new Date(post.updated_at) : new Date(STATIC_PAGE_DATES['/']),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))
  } catch {
    // Keep static URLs in the sitemap when the blog API is unavailable.
  }

  return [...staticEntries, ...blogEntries]
}
