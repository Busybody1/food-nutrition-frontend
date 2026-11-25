import Link from 'next/link'
import {
  ArrowRight,
  BookOpen,
  Code2,
  Database,
  Key,
  LineChart,
  Play,
  Rss,
  Salad,
  ScanBarcode,
  Sparkles,
  Utensils,
} from 'lucide-react'
import type { BlogListItem } from '@/lib/api/blog'
import { BlogPagination } from '@/components/blog/blog-pagination'
import { BlogSearchForm } from '@/components/blog/blog-search-form'
import { Reveal } from '@/components/marketing/reveal'
import { MarketingIconDisc, discToneAt } from '@/components/marketing/marketing-shell'
import { MarketingSheetHero } from '@/components/marketing/marketing-sheet'
import { getPublicPageSeo } from '@/lib/public-page-seo'
import { FOOD_DATABASE_SIZE_LABEL } from '@/lib/site'

const BLOG_SEO = getPublicPageSeo('/blog')

function formatDate(value?: string | null): string | null {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

function readingMinutes(excerpt?: string | null): number {
  const words = (excerpt ?? '').trim().split(/\s+/).filter(Boolean).length
  return Math.max(3, Math.min(12, Math.round(words / 40) + 4))
}

const CARD_ICONS = [Code2, ScanBarcode, Database, Utensils, LineChart, Salad] as const

function slugHash(slug: string): number {
  let hash = 0
  for (let i = 0; i < slug.length; i++) {
    hash = (hash * 31 + slug.charCodeAt(i)) % 997
  }
  return hash
}

const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2'

function BlogPostCard({
  post,
  featured = false,
}: {
  post: BlogListItem
  featured?: boolean
}) {
  const published = formatDate(post.published_at)
  const minutes = readingMinutes(post.excerpt)
  const hash = slugHash(post.slug)
  const Icon = CARD_ICONS[hash % CARD_ICONS.length]

  return (
    <Link
      href={`/blog/${post.slug}`}
      className={
        featured
          ? `blog-post-card blog-post-card--featured group cursor-pointer ${FOCUS_RING}`
          : `blog-post-card group cursor-pointer ${FOCUS_RING}`
      }
      prefetch={false}
    >
      <MarketingIconDisc icon={Icon} tone={discToneAt(hash)} className="mb-4" />
      <h2 className={featured ? 'blog-post-card__title blog-post-card__title--featured' : 'blog-post-card__title'}>
        {post.title}
      </h2>
      {post.excerpt && (
        <p className={featured ? 'blog-post-card__excerpt blog-post-card__excerpt--featured' : 'blog-post-card__excerpt'}>
          {post.excerpt}
        </p>
      )}
      <div className="blog-post-card__footer">
        <span className="blog-post-card__cta">
          Read article
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </span>
        <div className="blog-post-card__meta">
          {published && <time dateTime={post.published_at ?? undefined}>{published}</time>}
          <span className="blog-post-card__read">{minutes} min read</span>
        </div>
      </div>
    </Link>
  )
}

function BlogSidebarInner({ headingAs: Heading = 'h2' }: { headingAs?: 'h2' | 'p' }) {
  return (
    <>
      <div className="blog-index-sidebar__card">
        <div className="blog-index-sidebar__icon bg-mk-violet-soft text-mk-violet" aria-hidden>
          <Sparkles className="h-[18px] w-[18px]" strokeWidth={1.9} />
        </div>
        <Heading className="blog-index-sidebar__title">Build with {FOOD_DATABASE_SIZE_LABEL}</Heading>
        <p className="blog-index-sidebar__text">
          Free API key, no credit card. Search, barcode lookup, and macros per 100g in one REST API.
        </p>
        <Link href="/auth/register" className="btn-brand w-full" prefetch={false}>
          Get your free API key
        </Link>
        <ul className="blog-index-sidebar__links">
          <li>
            <Link href="/playground" prefetch={false} className={FOCUS_RING}>
              <Play className="h-4 w-4" aria-hidden />
              Try the playground
            </Link>
          </li>
          <li>
            <Link href="/docs" prefetch={false} className={FOCUS_RING}>
              <BookOpen className="h-4 w-4" aria-hidden />
              Read the docs
            </Link>
          </li>
          <li>
            <Link href="/blog/feed.xml" prefetch={false} className={FOCUS_RING}>
              <Rss className="h-4 w-4" aria-hidden />
              RSS feed
            </Link>
          </li>
        </ul>
      </div>

      <div className="blog-index-sidebar__note">
        <Key className="mt-px h-4 w-4 shrink-0 text-mk-muted" aria-hidden />
        <p>1,000 free requests/month. Upgrade when you launch.</p>
      </div>
    </>
  )
}

function BlogSidebar() {
  return (
    <aside className="blog-index-sidebar hidden lg:flex" aria-label="Get started">
      <Reveal delay={120} className="flex flex-col gap-4">
        <BlogSidebarInner headingAs="h2" />
      </Reveal>
    </aside>
  )
}

function BlogMobileSignup({ className }: { className?: string }) {
  return (
    <aside className={`flex flex-col gap-4 lg:hidden ${className ?? ''}`} aria-label="Get started">
      <BlogSidebarInner headingAs="p" />
    </aside>
  )
}

export function BlogIndex({
  posts,
  total,
  page,
  pageSize,
  query,
}: {
  posts: BlogListItem[]
  total: number
  page: number
  pageSize: number
  query?: string
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const showFeatured = page === 1 && !query && posts.length > 0
  const featured = showFeatured ? posts[0] : null
  const gridPosts = showFeatured ? posts.slice(1) : posts
  const isSearch = Boolean(query?.trim())

  return (
    <>
      <MarketingSheetHero
        badge="Developer guides"
        title={BLOG_SEO.title}
        lead={BLOG_SEO.description}
        leadClassName="aeo-answer"
        actions={
          <>
            <Link href="/auth/register" className="btn-brand" prefetch={false}>
              Get API key free
            </Link>
            <Link href="/playground" className="btn-brand-outline" prefetch={false}>
              Open playground
            </Link>
          </>
        }
      >
        {total > 0 && (
          <p className="blog-index-hero__count">
            {total} {total === 1 ? 'article' : 'articles'}
            {isSearch && query ? (
              <>
                <span className="blog-index-hero__dot" aria-hidden />
                matching &ldquo;{query}&rdquo;
              </>
            ) : null}
            <span className="blog-index-hero__dot" aria-hidden />
            <Link
              href="/blog/feed.xml"
              className={`blog-index-hero__rss rounded-sm ${FOCUS_RING}`}
              prefetch={false}
            >
              RSS
            </Link>
          </p>
        )}
      </MarketingSheetHero>

      <section className="blog-index-body">
        <div className="container-narrow">
          {posts.length === 0 ? (
            <>
              <BlogSearchForm defaultQuery={query ?? ''} />
              <div className="blog-index-empty">
                <div className="mx-auto max-w-md rounded-[20px] border border-dashed border-mk-line bg-white px-6 py-10">
                  <p className="marketing-body">
                    {isSearch
                      ? `No articles found for "${query}". Try a different keyword.`
                      : 'No articles published yet. Check back soon.'}
                  </p>
                  {isSearch && (
                    <Link
                      href="/blog"
                      className={`mt-3 inline-block rounded-sm font-medium text-brand-strong underline decoration-brand/40 underline-offset-2 hover:decoration-brand-strong ${FOCUS_RING}`}
                    >
                      View all articles
                    </Link>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="blog-index-layout">
              <div className="blog-index-main">
                <BlogSearchForm defaultQuery={query ?? ''} className="max-w-none" />

                {featured && (
                  <Reveal className="mb-8 md:mb-10">
                    <p className="mb-4 text-sm font-medium text-mk-muted">Latest</p>
                    <BlogPostCard post={featured} featured />
                  </Reveal>
                )}

                {featured && <BlogMobileSignup className="mb-8 md:mb-10" />}

                {gridPosts.length > 0 && (
                  <>
                    <Reveal>
                      <p className="mb-4 text-sm font-medium text-mk-muted md:mb-5">
                        {isSearch ? 'Search results' : featured ? 'More articles' : 'All articles'}
                      </p>
                    </Reveal>
                    <ul className="blog-index-grid">
                      {gridPosts.map((post, index) => (
                        <li key={post.slug} className="min-w-0">
                          <Reveal delay={Math.min(index, 6) * 80} className="h-full">
                            <BlogPostCard post={post} />
                          </Reveal>
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                <BlogPagination
                  page={page}
                  totalPages={totalPages}
                  total={total}
                  pageSize={pageSize}
                  query={query}
                />

                {!featured && <BlogMobileSignup className="mt-10" />}
              </div>

              <BlogSidebar />
            </div>
          )}
        </div>
      </section>
    </>
  )
}
