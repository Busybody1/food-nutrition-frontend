import type { Metadata } from 'next'
import Link from 'next/link'
import { MarketingHero } from '@/components/marketing/marketing-hero'
import { buildPublicPageMetadata } from '@/lib/build-public-metadata'
import { PublicPageSchema } from '@/components/seo/public-page-schema'
import { getBlogPosts } from '@/lib/api/blog'
import { BlogSeoContent } from '@/components/seo/public-page-seo-content'

export const metadata: Metadata = buildPublicPageMetadata('/blog')

export const revalidate = 300

function formatDate(value?: string | null): string | null {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default async function BlogIndexPage() {
  const posts = await getBlogPosts()

  return (
    <div className="marketing-page">
      <PublicPageSchema path="/blog" pageName="Blog" />
      <MarketingHero
        title="Calorie API Blog"
        subtitle="Developer guides on nutrition data, calorie APIs, macros, and building food-powered apps."
        compact
      />

      <section className="pb-20 md:pb-28 -mt-4">
        <div className="container-narrow max-w-3xl">
          {posts.length === 0 ? (
            <p className="text-center text-ink-muted py-12">
              No articles published yet. Check back soon.
            </p>
          ) : (
            <ul className="space-y-4">
              {posts.map((post) => {
                const published = formatDate(post.published_at)
                return (
                  <li key={post.slug}>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="marketing-card block hover:border-brand/30 transition-all duration-200"
                      prefetch={false}
                    >
                      {published && (
                        <p className="text-xs font-semibold uppercase tracking-wide text-brand-strong mb-2">
                          {published}
                        </p>
                      )}
                      <h2 className="text-lg font-semibold text-ink">{post.title}</h2>
                      {post.excerpt && (
                        <p className="text-sm text-ink-muted mt-2 leading-relaxed">{post.excerpt}</p>
                      )}
                      <span className="mt-3 inline-flex text-sm font-medium text-brand-strong">
                        Read article →
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </section>

      <BlogSeoContent />
    </div>
  )
}
