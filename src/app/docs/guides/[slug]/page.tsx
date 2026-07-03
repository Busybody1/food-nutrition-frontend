import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight, Code2, Globe, Layers, Smartphone, Terminal } from 'lucide-react'
import { buildPageMetadata } from '@/lib/metadata'
import { JsonLdScript } from '@/components/seo/structured-data'
import { buildBreadcrumbJsonLd, buildTechArticleJsonLd } from '@/lib/seo-jsonld'
import { buildFaqPageJsonLd } from '@/lib/faq-data'
import { DocsShell } from '@/components/docs/docs-shell'
import { DocsBlockRenderer, DocsFaqBlock } from '@/components/docs/docs-blocks'
import { DocsCta } from '@/components/docs/docs-cta'
import { DocsToc } from '@/components/docs/docs-toc'
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

/** Decorative per-framework icons (aria-hidden; icons carry no copy). */
const GUIDE_ICONS: Record<string, typeof Code2> = {
  'React Native': Smartphone,
  'Next.js': Globe,
  Flutter: Layers,
  'Node.js': Terminal,
  Python: Code2,
}

const BREADCRUMB_LINK_CLASS =
  'rounded text-brand-strong underline decoration-brand/40 underline-offset-2 hover:decoration-brand-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50'

const PAGINATION_CARD_CLASS =
  'marketing-card group flex h-full items-center p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2'

export default async function GuidePage({ params }: PageProps) {
  const { slug } = await params
  const guide = getGuide(slug)
  if (!guide) notFound()

  const path = guidePath(guide.slug)
  const FrameworkIcon = GUIDE_ICONS[guide.framework] ?? Code2
  const guideIndex = GUIDES.findIndex((g) => g.slug === guide.slug)
  const prevGuide = guideIndex > 0 ? GUIDES[guideIndex - 1] : null
  const nextGuide =
    guideIndex >= 0 && guideIndex < GUIDES.length - 1 ? GUIDES[guideIndex + 1] : null
  const tocItems = guide.blocks.flatMap((block) =>
    block.kind === 'h2' && block.id ? [{ id: block.id, text: block.text }] : []
  )

  return (
    <div className="marketing-page min-h-screen">
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
                <li>
                  <Link href="/docs/guides" className={BREADCRUMB_LINK_CLASS}>
                    Guides
                  </Link>
                </li>
                <li aria-hidden>/</li>
                <li aria-current="page">{guide.framework}</li>
              </ol>
            </nav>

            <header className="relative">
              <div className="mb-3 flex items-center gap-2.5">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-brand bg-brand-muted"
                  aria-hidden
                >
                  <FrameworkIcon className="h-4 w-4 text-brand-strong" />
                </span>
                <p className="marketing-section-label">{guide.framework} guide</p>
              </div>
              <h1 className="font-display text-3xl md:text-4xl tracking-tight text-ink mb-3">
                {guide.title}
              </h1>
              <div
                className="h-1 w-16 rounded-full bg-gradient-to-r from-brand to-brand-strong"
                aria-hidden
              />
            </header>
          </div>

          <div className="xl:grid xl:max-w-5xl xl:grid-cols-[minmax(0,1fr)_13rem] xl:items-start xl:gap-12">
            <div className="min-w-0">
              <DocsBlockRenderer blocks={guide.blocks} />
              <DocsFaqBlock faqs={guide.faqs} />
            </div>
            <aside className="hidden xl:sticky xl:top-[calc(var(--site-header-offset)+1.5rem)] xl:block xl:max-h-[calc(100vh-var(--site-header-offset)-3rem)] xl:overflow-y-auto">
              <DocsToc items={tocItems} />
            </aside>
          </div>
        </article>

        <DocsCta />

        {guide.related.length > 0 && (
          <section aria-label="Related resources" className="mt-12">
            <h2 className="font-display text-2xl md:text-3xl tracking-tight text-ink mb-4">
              Related resources
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {guide.related.map((link) => (
                <li key={link.href} className="min-w-0">
                  <Link
                    href={link.href}
                    prefetch={false}
                    className="marketing-card group flex h-full items-center gap-2.5 p-4 text-sm font-medium text-brand-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2"
                  >
                    <ArrowRight
                      className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
                      aria-hidden
                    />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {(prevGuide || nextGuide) && (
          <nav aria-label="Guides pagination" className="mt-8 grid gap-3 sm:grid-cols-2">
            {prevGuide && (
              <Link href={guidePath(prevGuide.slug)} className={PAGINATION_CARD_CLASS}>
                <span className="inline-flex items-center gap-2 text-sm font-medium text-brand-strong">
                  <ArrowLeft
                    className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5"
                    aria-hidden
                  />
                  {prevGuide.title}
                </span>
              </Link>
            )}
            {nextGuide && (
              <Link
                href={guidePath(nextGuide.slug)}
                className={
                  prevGuide
                    ? `${PAGINATION_CARD_CLASS} justify-end text-right`
                    : `${PAGINATION_CARD_CLASS} justify-end text-right sm:col-start-2`
                }
              >
                <span className="inline-flex items-center gap-2 text-sm font-medium text-brand-strong">
                  {nextGuide.title}
                  <ArrowRight
                    className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </span>
              </Link>
            )}
          </nav>
        )}
      </DocsShell>
    </div>
  )
}
