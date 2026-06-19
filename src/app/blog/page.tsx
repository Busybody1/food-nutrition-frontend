import type { Metadata } from 'next'
import { buildPublicPageMetadata } from '@/lib/build-public-metadata'
import { PublicPageSchema } from '@/components/seo/public-page-schema'
import { BLOG_PAGE_SIZE, getBlogPostsPage } from '@/lib/api/blog'
import { BlogSeoContent } from '@/components/seo/public-page-seo-content'
import { buildBlogItemListJsonLd } from '@/lib/seo-jsonld'
import { absoluteUrl } from '@/lib/site'
import { BlogIndex } from '@/components/blog/blog-index'
import { MarketingCtaBand } from '@/components/marketing/marketing-shell'

const blogMetadata = buildPublicPageMetadata('/blog')

export const metadata: Metadata = {
  ...blogMetadata,
  alternates: {
    ...blogMetadata.alternates,
    types: {
      'application/rss+xml': [{ url: absoluteUrl('/blog/feed.xml'), title: 'Calorie API Blog RSS' }],
    },
  },
}

export const revalidate = 300

type PageProps = {
  searchParams: Promise<{ page?: string; q?: string }>
}

function parsePage(value?: string): number {
  const n = parseInt(value ?? '1', 10)
  return Number.isFinite(n) && n > 0 ? n : 1
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

      <MarketingCtaBand
        title="Ready to integrate?"
        description="Get your free API key and start building food search, barcode lookup, and macro logging in minutes."
        primaryHref="/auth/register"
        primaryLabel="Get API key free"
        secondaryHref="/docs"
        secondaryLabel="View documentation"
      />

      <BlogSeoContent />
    </div>
  )
}
