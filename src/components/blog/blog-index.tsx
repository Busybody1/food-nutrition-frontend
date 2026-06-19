import Link from 'next/link'
import { ArrowRight, BookOpen, Key, Play, Rss, Sparkles } from 'lucide-react'
import type { BlogListItem } from '@/lib/api/blog'
import { FOOD_DATABASE_SIZE_LABEL } from '@/lib/site'

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

function topicLabel(keywords?: string | null): string | null {
  if (!keywords) return null
  const first = keywords.split(',')[0]?.trim()
  return first || null
}

function BlogPostCard({
  post,
  featured = false,
}: {
  post: BlogListItem
  featured?: boolean
}) {
  const published = formatDate(post.published_at)
  const topic = topicLabel(post.keywords)
  const minutes = readingMinutes(post.excerpt)

  return (
    <Link
      href={`/blog/${post.slug}`}
      className={featured ? 'blog-post-card blog-post-card--featured group' : 'blog-post-card group'}
      prefetch={false}
    >
      <div className="blog-post-card__meta">
        {topic && <span className="blog-post-card__topic">{topic}</span>}
        {published && <time dateTime={post.published_at ?? undefined}>{published}</time>}
        <span className="blog-post-card__read">{minutes} min read</span>
      </div>
      <h2 className={featured ? 'blog-post-card__title blog-post-card__title--featured' : 'blog-post-card__title'}>
        {post.title}
      </h2>
      {post.excerpt && (
        <p className={featured ? 'blog-post-card__excerpt blog-post-card__excerpt--featured' : 'blog-post-card__excerpt'}>
          {post.excerpt}
        </p>
      )}
      <span className="blog-post-card__cta">
        Read article
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
      </span>
    </Link>
  )
}

function BlogSidebar() {
  return (
    <aside className="blog-index-sidebar" aria-label="Get started">
      <div className="blog-index-sidebar__card">
        <div className="blog-index-sidebar__icon" aria-hidden>
          <Sparkles className="h-5 w-5 text-brand-strong" />
        </div>
        <h2 className="blog-index-sidebar__title">Build with {FOOD_DATABASE_SIZE_LABEL}</h2>
        <p className="blog-index-sidebar__text">
          Free API key, no credit card. Search, barcode lookup, and macros per 100g in one REST API.
        </p>
        <Link href="/auth/register" className="site-header-cta w-full justify-center" prefetch={false}>
          Get your free API key
        </Link>
        <ul className="blog-index-sidebar__links">
          <li>
            <Link href="/playground" prefetch={false}>
              <Play className="h-4 w-4" aria-hidden />
              Try the playground
            </Link>
          </li>
          <li>
            <Link href="/docs" prefetch={false}>
              <BookOpen className="h-4 w-4" aria-hidden />
              Read the docs
            </Link>
          </li>
          <li>
            <Link href="/blog/feed.xml" prefetch={false}>
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
    </aside>
  )
}

export function BlogIndex({ posts }: { posts: BlogListItem[] }) {
  const [featured, ...rest] = posts

  return (
    <>
      <header className="blog-index-hero">
        <div className="container-narrow blog-index-hero__inner">
          <p className="marketing-hero-badge mb-5">Developer guides</p>
          <h1 className="blog-index-hero__title">Calorie API Blog</h1>
          <p className="blog-index-hero__subtitle">
            Practical guides on nutrition APIs, food search, barcode integration, and shipping
            production health apps.
          </p>
          <div className="blog-index-hero__actions">
            <Link href="/auth/register" className="btn-brand" prefetch={false}>
              Get API key free
            </Link>
            <Link href="/playground" className="btn-brand-outline" prefetch={false}>
              Open playground
            </Link>
          </div>
          {posts.length > 0 && (
            <p className="blog-index-hero__count">
              {posts.length} articles
              <span className="blog-index-hero__dot" aria-hidden />
              <Link href="/blog/feed.xml" className="blog-index-hero__rss" prefetch={false}>
                RSS
              </Link>
            </p>
          )}
        </div>
      </header>

      <section className="blog-index-body">
        <div className="container-narrow">
          {posts.length === 0 ? (
            <p className="text-center text-ink-muted py-16">No articles published yet. Check back soon.</p>
          ) : (
            <div className="blog-index-layout">
              <div className="blog-index-main">
                {featured && (
                  <div className="mb-8 md:mb-10">
                    <p className="marketing-section-label mb-4">Latest</p>
                    <BlogPostCard post={featured} featured />
                  </div>
                )}

                {rest.length > 0 && (
                  <>
                    <p className="marketing-section-label mb-4 md:mb-5">All articles</p>
                    <ul className="blog-index-grid">
                      {rest.map((post) => (
                        <li key={post.slug}>
                          <BlogPostCard post={post} />
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>

              <BlogSidebar />
            </div>
          )}
        </div>
      </section>
    </>
  )
}
