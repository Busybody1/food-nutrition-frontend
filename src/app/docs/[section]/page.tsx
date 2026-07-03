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
import { DocsCta } from '@/components/docs/docs-cta'
import { DocsToc } from '@/components/docs/docs-toc'
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

const BREADCRUMB_LINK_CLASS =
  'rounded text-brand-strong underline decoration-brand/40 underline-offset-2 hover:decoration-brand-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50'

const PAGINATION_CARD_CLASS =
  'marketing-card group flex h-full items-center p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2'

export default async function DocsSectionPage({ params }: PageProps) {
  const { section } = await params
  const meta = getDocsSectionMeta(section)
  const content = getDocsSectionContent(section)
  if (!meta || !content) notFound()

  const path = docsSectionPath(meta.slug)
  const { prev, next } = getDocsSectionNeighbors(meta.slug)
  const tocItems = content.blocks.flatMap((block) =>
    block.kind === 'h2' && block.id ? [{ id: block.id, text: block.text }] : []
  )

  return (
    <div className="marketing-page min-h-screen">
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
        <article>
          <div className="relative mb-8 overflow-hidden rounded-brand border border-brand/10 bg-gradient-to-br from-brand-muted/60 via-white to-white p-5 sm:p-6 md:p-8">
            <div
              className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-brand/10 blur-3xl"
              aria-hidden
            />
            <nav aria-label="Breadcrumb" className="relative mb-5 text-sm text-ink-muted">
              <ol className="flex flex-wrap items-center gap-1">
                <li>
                  <Link href="/docs" className={BREADCRUMB_LINK_CLASS}>
                    Docs
                  </Link>
                </li>
                <li aria-hidden>/</li>
                <li aria-current="page">{meta.title}</li>
              </ol>
            </nav>

            <header className="relative">
              <p className="marketing-section-label mb-2 block">
                {meta.group === 'Endpoints' ? 'API Reference' : 'Advanced'}
              </p>
              <h1 className="font-display text-3xl md:text-4xl tracking-tight text-ink mb-3">
                {meta.title}
              </h1>
              <div
                className="h-1 w-16 rounded-full bg-gradient-to-r from-brand to-brand-strong"
                aria-hidden
              />
            </header>
          </div>

          <div className="xl:grid xl:max-w-5xl xl:grid-cols-[minmax(0,1fr)_13rem] xl:items-start xl:gap-12">
            <div className="min-w-0">
              <DocsBlockRenderer blocks={content.blocks} />
              <DocsFaqBlock faqs={content.faqs} />
            </div>
            <aside className="hidden xl:sticky xl:top-[calc(var(--site-header-offset)+1.5rem)] xl:block xl:max-h-[calc(100vh-var(--site-header-offset)-3rem)] xl:overflow-y-auto">
              <DocsToc items={tocItems} />
            </aside>
          </div>
        </article>

        <DocsCta />

        <nav aria-label="Documentation pagination" className="mt-8 grid gap-3 sm:grid-cols-2">
          {prev ? (
            <Link href={docsSectionPath(prev.slug)} className={PAGINATION_CARD_CLASS}>
              <span className="inline-flex items-center gap-2 text-sm font-medium text-brand-strong">
                <ArrowLeft
                  className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5"
                  aria-hidden
                />
                {prev.title}
              </span>
            </Link>
          ) : (
            <Link href="/docs" className={PAGINATION_CARD_CLASS}>
              <span className="inline-flex items-center gap-2 text-sm font-medium text-brand-strong">
                <ArrowLeft
                  className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5"
                  aria-hidden
                />
                Overview &amp; Quickstart
              </span>
            </Link>
          )}
          {next && (
            <Link
              href={docsSectionPath(next.slug)}
              className={`${PAGINATION_CARD_CLASS} justify-end text-right`}
            >
              <span className="inline-flex items-center gap-2 text-sm font-medium text-brand-strong">
                {next.title}
                <ArrowRight
                  className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
                  aria-hidden
                />
              </span>
            </Link>
          )}
        </nav>
      </DocsShell>
    </div>
  )
}
