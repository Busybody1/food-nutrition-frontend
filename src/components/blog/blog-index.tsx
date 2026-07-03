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
import { FOOD_DATABASE_SIZE_LABEL } from '@/lib/site'
import { BlogSearchForm } from '@/components/blog/blog-search-form'
import { BlogPagination } from '@/components/blog/blog-pagination'
import { Reveal } from '@/components/marketing/reveal'

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

/** Deterministic decorative icon per post so the text-only grid gets visual variety. */
const CARD_ICONS = [Code2, ScanBarcode, Database, Utensils, LineChart, Salad] as const

function slugHash(slug: string): number {
  let hash = 0
  for (let i = 0; i < slug.length; i++) {
    hash = (hash * 31 + slug.charCodeAt(i)) % 997
  }
  return hash
}

const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2'

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
  const accented = !featured && hash % 4 === 3

  return (
    <Link
      href={`/blog/${post.slug}`}
      className={
        featured
          ? `blog-post-card blog-post-card--featured group cursor-pointer motion-safe:hover:-translate-y-0.5 ${FOCUS_RING}`
          : `blog-post-card group cursor-pointer motion-safe:hover:-translate-y-0.5 ${FOCUS_RING}`
      }
      prefetch={false}
    >
      <span
        className={
          featured
            ? 'mb-4 flex h-11 w-11 items-center justify-center rounded-brand bg-brand-muted text-brand-strong transition-transform duration-200 motion-safe:group-hover:scale-105'
            : accented
              ? 'mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-accent-orange/10 text-accent-orange transition-transform duration-200 motion-safe:group-hover:scale-105'
              : 'mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-brand-muted text-brand-strong transition-transform duration-200 motion-safe:group-hover:scale-105'
        }
        aria-hidden
      >
        <Icon className={featured ? 'h-5 w-5' : 'h-4 w-4'} />
      </span>
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
        <div className="blog-post-card__meta text-ink-muted">
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
      <div className="blog-index-sidebar__card card-hairline">
        <div className="blog-index-sidebar__icon" aria-hidden>
          <Sparkles className="h-5 w-5 text-brand-strong" />
        </div>
        <Heading className="blog-index-sidebar__title">Build with {FOOD_DATABASE_SIZE_LABEL}</Heading>
        <p className="blog-index-sidebar__text">
          Free API key, no credit card. Search, barcode lookup, and macros per 100g in one REST API.
        </p>
        <Link href="/auth/register" className="btn-brand mt-5 w-full" prefetch={false}>
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
        <Key className="h-4 w-4 shrink-0 text-brand-strong" aria-hidden />
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

/** Below-lg duplicate of the sidebar conversion card so mobile users see it in the reading flow. */
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
      <header className="blog-index-hero pb-16 md:pb-20">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 right-[-6%] h-72 w-72 rounded-full bg-brand/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-28 right-[16%] h-56 w-56 rounded-full bg-accent-orange/10 blur-3xl"
        />
        <div className="container-narrow relative">
          <div className="max-w-3xl">
            <p className="marketing-hero-badge mb-5 animate-rise">Developer guides</p>
            <h1 className="blog-index-hero__title md:text-5xl md:leading-[1.1] animate-rise stagger-2">
              Calorie API <span className="text-gradient-brand">Blog</span>
            </h1>
            <p className="blog-index-hero__subtitle animate-rise stagger-3">
              Practical guides on nutrition APIs, food search, barcode integration, and shipping
              production health apps.
            </p>
            <div className="blog-index-hero__actions animate-rise stagger-4">
              <Link href="/auth/register" className="btn-brand" prefetch={false}>
                Get API key free
              </Link>
              <Link href="/playground" className="btn-brand-outline" prefetch={false}>
                Open playground
              </Link>
            </div>
            {total > 0 && (
              <p className="blog-index-hero__count text-ink-muted animate-rise stagger-5">
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
          </div>
        </div>
      </header>

      <section className="blog-index-body py-16 md:py-24">
        <div className="container-narrow">
          {posts.length === 0 ? (
            <>
              <BlogSearchForm defaultQuery={query ?? ''} />
              <div className="blog-index-empty">
                <div className="mx-auto max-w-md rounded-brand border border-dashed border-surface-border bg-surface-elevated/60 px-6 py-10">
                  <p className="text-ink-muted">
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
                    <p className="marketing-section-label mb-4">Latest</p>
                    <BlogPostCard post={featured} featured />
                  </Reveal>
                )}

                {featured && <BlogMobileSignup className="mb-8 md:mb-10" />}

                {gridPosts.length > 0 && (
                  <>
                    <Reveal>
                      <p className="marketing-section-label mb-4 md:mb-5">
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
