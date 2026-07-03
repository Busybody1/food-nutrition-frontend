import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { buildPageMetadata } from '@/lib/metadata'
import { JsonLdScript } from '@/components/seo/structured-data'
import { buildBreadcrumbJsonLd, buildTechArticleJsonLd } from '@/lib/seo-jsonld'
import { buildFaqPageJsonLd } from '@/lib/faq-data'
import { DocsShell } from '@/components/docs/docs-shell'
import { DocsBlockRenderer, DocsFaqBlock } from '@/components/docs/docs-blocks'
import { GUIDES, getGuide, guidePath } from '@/lib/docs/guides-data'

export const dynamicParams = false

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }))
}

type PageProps = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const guide = getGuide(slug)
  if (!guide) return {}
  return buildPageMetadata({
    title: guide.metaTitle,
    description: guide.description,
    keywords: guide.keywords,
    path: guidePath(guide.slug),
    hasDedicatedOgImage: true,
  })
}

export default async function GuidePage({ params }: PageProps) {
  const { slug } = await params
  const guide = getGuide(slug)
  if (!guide) notFound()

  const path = guidePath(guide.slug)

  return (
    <div className="marketing-page docs-page min-h-screen">
      <JsonLdScript
        id={`techarticle-guide-${guide.slug}`}
        data={buildTechArticleJsonLd({
          headline: guide.title,
          description: guide.description,
          path,
          dateModified: guide.dateModified,
          keywords: guide.keywords,
        })}
      />
      <JsonLdScript
        id={`breadcrumb-guide-${guide.slug}`}
        data={buildBreadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Documentation', path: '/docs' },
          { name: 'Integration Guides', path: '/docs/guides' },
          { name: guide.framework, path },
        ])}
      />
      {guide.faqs.length > 0 && (
        <JsonLdScript id={`faq-guide-${guide.slug}`} data={buildFaqPageJsonLd(guide.faqs)} />
      )}

      <DocsShell>
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-ink-muted">
          <ol className="flex flex-wrap items-center gap-1">
            <li>
              <Link href="/docs" className="text-brand-strong hover:underline">
                Docs
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link href="/docs/guides" className="text-brand-strong hover:underline">
                Guides
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li aria-current="page">{guide.framework}</li>
          </ol>
        </nav>

        <article>
          <header className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-strong mb-2">
              {guide.framework} guide
            </p>
            <h1 className="font-display text-3xl md:text-4xl text-ink mb-3">{guide.title}</h1>
          </header>

          <DocsBlockRenderer blocks={guide.blocks} />
          <DocsFaqBlock faqs={guide.faqs} />
        </article>

        {guide.related.length > 0 && (
          <section
            aria-label="Related resources"
            className="mt-12 border-t border-surface-border/60 pt-6"
          >
            <h2 className="text-xl font-semibold text-ink mb-4">Related resources</h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {guide.related.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    prefetch={false}
                    className="inline-flex items-center gap-2 text-sm font-medium text-brand-strong hover:underline"
                  >
                    <ArrowRight className="w-4 h-4" aria-hidden />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </DocsShell>
    </div>
  )
}
