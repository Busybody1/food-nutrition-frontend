import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { buildPageMetadata } from '@/lib/metadata'
import { JsonLdScript } from '@/components/seo/structured-data'
import {
  buildBreadcrumbJsonLd,
  buildTechArticleJsonLd,
} from '@/lib/seo-jsonld'
import { buildFaqPageJsonLd } from '@/lib/faq-data'
import { DocsShell } from '@/components/docs/docs-shell'
import { DocsBlockRenderer, DocsFaqBlock } from '@/components/docs/docs-blocks'
import {
  DOCS_SECTIONS,
  docsSectionPath,
  getDocsSectionContent,
  getDocsSectionMeta,
  getDocsSectionNeighbors,
} from '@/lib/docs/registry'

export const dynamicParams = false

export function generateStaticParams() {
  return DOCS_SECTIONS.map((s) => ({ section: s.slug }))
}

type PageProps = { params: Promise<{ section: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { section } = await params
  const meta = getDocsSectionMeta(section)
  if (!meta) return {}
  return buildPageMetadata({
    title: meta.metaTitle,
    description: meta.description,
    keywords: meta.keywords,
    path: docsSectionPath(meta.slug),
    hasDedicatedOgImage: true,
  })
}

export default async function DocsSectionPage({ params }: PageProps) {
  const { section } = await params
  const meta = getDocsSectionMeta(section)
  const content = getDocsSectionContent(section)
  if (!meta || !content) notFound()

  const path = docsSectionPath(meta.slug)
  const { prev, next } = getDocsSectionNeighbors(meta.slug)

  return (
    <div className="marketing-page docs-page min-h-screen">
      <JsonLdScript
        id={`techarticle-${meta.slug}`}
        data={buildTechArticleJsonLd({
          headline: meta.metaTitle,
          description: meta.description,
          path,
          dateModified: meta.dateModified,
          keywords: meta.keywords,
        })}
      />
      <JsonLdScript
        id={`breadcrumb-docs-${meta.slug}`}
        data={buildBreadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Documentation', path: '/docs' },
          { name: meta.title, path },
        ])}
      />
      {content.faqs.length > 0 && (
        <JsonLdScript
          id={`faq-docs-${meta.slug}`}
          data={buildFaqPageJsonLd(content.faqs)}
        />
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
            <li aria-current="page">{meta.title}</li>
          </ol>
        </nav>

        <article>
          <header className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-strong mb-2">
              {meta.group === 'Endpoints' ? 'API Reference' : 'Advanced'}
            </p>
            <h1 className="font-display text-3xl md:text-4xl text-ink mb-3">{meta.title}</h1>
          </header>

          <DocsBlockRenderer blocks={content.blocks} />
          <DocsFaqBlock faqs={content.faqs} />
        </article>

        <nav
          aria-label="Documentation pagination"
          className="mt-12 flex flex-col sm:flex-row gap-3 sm:justify-between border-t border-surface-border/60 pt-6"
        >
          {prev ? (
            <Link
              href={docsSectionPath(prev.slug)}
              className="inline-flex items-center gap-2 text-sm font-medium text-brand-strong hover:underline"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden />
              {prev.title}
            </Link>
          ) : (
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 text-sm font-medium text-brand-strong hover:underline"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden />
              Overview &amp; Quickstart
            </Link>
          )}
          {next && (
            <Link
              href={docsSectionPath(next.slug)}
              className="inline-flex items-center gap-2 text-sm font-medium text-brand-strong hover:underline sm:ml-auto"
            >
              {next.title}
              <ArrowRight className="w-4 h-4" aria-hidden />
            </Link>
          )}
        </nav>
      </DocsShell>
    </div>
  )
}
