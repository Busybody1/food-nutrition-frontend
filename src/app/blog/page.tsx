import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/metadata'
import { getPublicPageSeo } from '@/lib/public-page-seo'
import { PublicPageSchema } from '@/components/seo/public-page-schema'
import { BLOG_PAGE_SIZE, getBlogPostsPage } from '@/lib/api/blog'
import { BlogSeoContent } from '@/components/seo/public-page-seo-content'
import { buildBlogItemListJsonLd } from '@/lib/seo-jsonld'
import { absoluteUrl } from '@/lib/site'
import { BlogIndex } from '@/components/blog/blog-index'
import { MarketingCtaBand } from '@/components/marketing/marketing-shell'

export const revalidate = 300

type PageProps = {
  searchParams: Promise<{ page?: string; q?: string }>
}

function parsePage(value?: string): number {
  const n = parseInt(value ?? '1', 10)
  return Number.isFinite(n) && n > 0 ? n : 1
}

/**
 * Self-referencing canonicals per pagination page (canonical-to-page-1 hides
 * deep pages from crawlers); search-result variants are noindexed.
 */
export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { page: pageParam, q } = await searchParams
  const page = parsePage(pageParam)
  const isSearch = Boolean(q?.trim())
  const seo = getPublicPageSeo('/blog')

  const base = buildPageMetadata({
    title: page > 1 ? `${seo.title} - Page ${page}` : seo.title,
    description: seo.description,
    keywords: seo.keywords,
    path: page > 1 ? `/blog?page=${page}` : '/blog',
    noIndex: isSearch,
  })

  return {
    ...base,
    alternates: {
      ...base.alternates,
      types: {
        'application/rss+xml': [{ url: absoluteUrl('/blog/feed.xml'), title: 'Calorie API Blog RSS' }],
      },
    },
  }
}

export default async function BlogIndexPage({ searchParams }: PageProps) {
  const { page: pageParam, q: queryParam } = await searchParams
  const query = queryParam?.trim().slice(0, 100) || undefined
  const requestedPage = parsePage(pageParam)

  const firstPage = await getBlogPostsPage({
    limit: BLOG_PAGE_SIZE,
    skip: 0,
    q: query,
  })

  const totalPages = Math.max(1, Math.ceil(firstPage.total / BLOG_PAGE_SIZE))
  const page = Math.min(requestedPage, totalPages)
  const skip = (page - 1) * BLOG_PAGE_SIZE

  const listPage =
    page === 1 && skip === 0
      ? firstPage
      : await getBlogPostsPage({ limit: BLOG_PAGE_SIZE, skip, q: query })

  const blogItemListJsonLd = buildBlogItemListJsonLd(listPage.items)

  return (
    <div className="marketing-page">
      <PublicPageSchema
        path="/blog"
        pageName="Blog"
        extraJsonLd={[blogItemListJsonLd]}
      />

      <BlogIndex
        posts={listPage.items}
        total={listPage.total}
        page={page}
        pageSize={BLOG_PAGE_SIZE}
        query={query}
      />

      <BlogSeoContent />

      <MarketingCtaBand
        title="Ready to integrate?"
        description="Get your free API key and start building food search, barcode lookup, and macro logging in minutes."
        primaryHref="/auth/register"
        primaryLabel="Get API key free"
        secondaryHref="/docs"
        secondaryLabel="View documentation"
      />
    </div>
  )
}
