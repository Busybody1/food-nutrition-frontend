import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, CalendarDays } from 'lucide-react'
import { buildPageMetadata } from '@/lib/metadata'
import { JsonLdScript } from '@/components/seo/structured-data'
import {
  buildBlogPostingJsonLd,
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
} from '@/lib/seo-jsonld'
import { OG_IMAGE_URL, FOOD_DATABASE_SIZE_LABEL } from '@/lib/site'
import { MarkdownContent } from '@/components/blog/markdown-content'
import { ReadingProgress } from '@/components/blog/reading-progress'
import { MarketingCtaBand } from '@/components/marketing/marketing-shell'
import { Reveal } from '@/components/marketing/reveal'
import { FaqList } from '@/components/marketing/faq-section'
import { getBlogPost, getBlogSlugs } from '@/lib/api/blog'
import { getRelatedLinksForText } from '@/lib/topic-clusters'

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
    hasDedicatedOgImage: true,
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
  const image = OG_IMAGE_URL

  const articleJsonLd = buildBlogPostingJsonLd({
    title: post.title,
    description: post.meta_description || post.excerpt || post.title,
    path,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    image,
    keywords: splitKeywords(post.keywords),
    wordCount: post.content.trim().split(/\s+/).filter(Boolean).length,
  })
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Blog', path: '/blog' },
    { name: post.title, path },
  ])
  const faqJsonLd = post.faq.length ? buildFaqJsonLd(post.faq) : null
  const relatedLinks = getRelatedLinksForText(`${post.title} ${post.keywords ?? ''}`, {
    excludeHref: path,
  })

  return (
    <div className="marketing-page">
      <JsonLdScript id={`article-${post.slug}`} data={articleJsonLd} />
      <JsonLdScript id={`breadcrumb-blog-${post.slug}`} data={breadcrumbJsonLd} />
      {faqJsonLd && <JsonLdScript id={`faq-${post.slug}`} data={faqJsonLd} />}

      <article>
        <ReadingProgress />
        <header data-sheet-hero="" className="marketing-hero-wrap">
          <div className="marketing-sheet marketing-sheet--hero">
            <div className="container-prose pb-12 pt-10 md:pb-16 md:pt-14">
              <nav
                className="mb-8 flex items-center gap-2 text-sm text-mk-muted animate-rise"
                aria-label="Breadcrumb"
              >
                <Link
                  href="/blog"
                  className="shrink-0 rounded-sm transition-colors duration-200 hover:text-mk-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                  prefetch={false}
                >
                  Blog
                </Link>
                <span className="text-mk-line" aria-hidden>
                  /
                </span>
                <span className="min-w-0 truncate text-mk-ink" title={post.title} aria-current="page">
                  {post.title}
                </span>
              </nav>
              <h1 className="marketing-display-sm animate-rise stagger-2">{post.title}</h1>
              {published && (
                <p className="mt-5 flex items-center gap-2 text-sm text-mk-muted animate-rise stagger-3">
                  <CalendarDays className="h-4 w-4 shrink-0" aria-hidden />
                  Published {published}
                </p>
              )}
            </div>
          </div>
        </header>

        <div className="marketing-sheet-wrap">
          <div className="marketing-sheet marketing-sheet-pad">
            <div className="container-prose">
              <MarkdownContent content={post.content} />

              {post.faq.length > 0 && (
                <Reveal as="section" className="mt-12 md:mt-16">
                  <h2 className="marketing-h3 mb-6">Frequently Asked Questions</h2>
                  <FaqList
                    items={post.faq.map((item) => ({ q: item.question, a: item.answer }))}
                    openFirst={false}
                  />
                </Reveal>
              )}

              <section
                className="mt-12 border-t border-mk-hair pt-8 md:mt-16"
                aria-label="Related resources"
              >
                <Reveal>
                  <h2 className="marketing-h3 mb-5">Related resources</h2>
                  <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {relatedLinks.map((link) => (
                      <li key={link.href} className="min-w-0">
                        <Link
                          href={link.href}
                          prefetch={false}
                          className="marketing-card group flex h-full cursor-pointer items-start gap-3 p-4 text-[15px] font-medium text-mk-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                        >
                          <ArrowRight
                            className="mt-1 h-4 w-4 shrink-0 text-mk-muted transition-transform duration-200 motion-safe:group-hover:translate-x-0.5"
                            aria-hidden
                          />
                          <span className="min-w-0">{link.label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </Reveal>
              </section>

              <p className="mt-12 text-sm">
                <Link
                  href="/blog"
                  className="inline-flex min-h-10 items-center gap-1.5 rounded-sm font-medium text-mk-ink transition-colors duration-200 hover:text-brand-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                  prefetch={false}
                >
                  ← Back to all articles
                </Link>
              </p>
            </div>
          </div>
        </div>
      </article>

      <MarketingCtaBand
        title="Start building with the Calorie API"
        description={`Get a free API key and access ${FOOD_DATABASE_SIZE_LABEL} with search, barcode lookup, and full macro data.`}
        primaryHref="/auth/register"
        primaryLabel="Get your free API key"
        secondaryHref="/docs"
        secondaryLabel="Read the docs"
      />
    </div>
  )
}
