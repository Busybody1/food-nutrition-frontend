import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { buildPageMetadata } from '@/lib/metadata'
import { JsonLdScript } from '@/components/seo/structured-data'
import {
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
} from '@/lib/seo-jsonld'
import { absoluteUrl, OG_IMAGE_URL } from '@/lib/site'
import { MarkdownContent } from '@/components/blog/markdown-content'
import { getBlogPost, getBlogSlugs } from '@/lib/api/blog'

export const revalidate = 300
export const dynamicParams = true

type PageProps = { params: Promise<{ slug: string }> }

function splitKeywords(keywords?: string | null): string[] | undefined {
  if (!keywords) return undefined
  const list = keywords
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean)
  return list.length ? list : undefined
}

function formatDate(value?: string | null): string | null {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export async function generateStaticParams() {
  const slugs = await getBlogSlugs()
  return slugs.map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getBlogPost(slug)
  if (!post) {
    return buildPageMetadata({
      title: 'Article not found',
      description: 'The requested blog article could not be found.',
      path: `/blog/${slug}`,
      noIndex: true,
    })
  }

  return buildPageMetadata({
    title: post.meta_title || post.title,
    description: post.meta_description || post.excerpt || undefined,
    keywords: splitKeywords(post.keywords),
    path: `/blog/${post.slug}`,
  })
}

export default async function BlogArticlePage({ params }: PageProps) {
  const { slug } = await params
  const post = await getBlogPost(slug)
  if (!post) {
    notFound()
  }

  const path = `/blog/${post.slug}`
  const published = formatDate(post.published_at)
  const image = post.cover_image_url || OG_IMAGE_URL

  const articleJsonLd = buildArticleJsonLd({
    title: post.meta_title || post.title,
    description: post.meta_description || post.excerpt || post.title,
    path,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    image,
  })
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Blog', path: '/blog' },
    { name: post.title, path },
  ])
  const faqJsonLd = post.faq.length ? buildFaqJsonLd(post.faq) : null

  return (
    <div className="marketing-page">
      <JsonLdScript id={`article-${post.slug}`} data={articleJsonLd} />
      <JsonLdScript id={`breadcrumb-blog-${post.slug}`} data={breadcrumbJsonLd} />
      {faqJsonLd && <JsonLdScript id={`faq-${post.slug}`} data={faqJsonLd} />}

      <article className="section-pad">
        <div className="container-narrow max-w-3xl">
          <nav className="mb-6 text-sm text-ink-muted" aria-label="Breadcrumb">
            <Link href="/blog" className="hover:text-ink" prefetch={false}>
              Blog
            </Link>
            <span className="mx-2 text-ink-dim">/</span>
            <span className="text-ink">{post.title}</span>
          </nav>

          <header className="mb-8">
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-ink mb-4 tracking-tight leading-[1.1]">
              {post.title}
            </h1>
            {published && (
              <p className="text-sm text-ink-muted">Published {published}</p>
            )}
          </header>

          <MarkdownContent content={post.content} />

          {post.faq.length > 0 && (
            <section className="mt-12 pt-8 border-t border-surface-border/70">
              <h2 className="font-display text-2xl md:text-3xl text-ink mb-6 tracking-tight">
                Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                {post.faq.map((item, i) => (
                  <details key={i} className="marketing-card group">
                    <summary className="cursor-pointer font-medium text-ink list-none flex items-center justify-between gap-4">
                      {item.question}
                      <span className="text-brand-strong transition-transform group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <p className="text-sm text-ink-muted mt-3 leading-relaxed">{item.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          )}

          <div className="marketing-callout mt-12">
            <h2 className="text-lg font-semibold text-ink mb-2">Start building with the Calorie API</h2>
            <p className="text-sm text-ink-muted mb-4">
              Get a free API key and access 1M+ foods with search, barcode lookup, and full macro data.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/auth/register" className="site-header-cta" prefetch={false}>
                Get your free API key
              </Link>
              <Link
                href="/docs"
                className="inline-flex h-9 items-center justify-center rounded-full border border-surface-border bg-white px-5 text-sm font-medium text-ink hover:border-brand/30"
                prefetch={false}
              >
                Read the docs
              </Link>
            </div>
          </div>

          <p className="mt-10 text-sm">
            <Link href="/blog" className="text-brand-strong font-medium hover:text-brand" prefetch={false}>
              ← Back to all articles
            </Link>
          </p>
        </div>
      </article>
    </div>
  )
}
