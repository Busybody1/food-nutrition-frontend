import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { buildPageMetadata } from '@/lib/metadata'
import { JsonLdScript } from '@/components/seo/structured-data'
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from '@/lib/seo-jsonld'
import { DocsShell } from '@/components/docs/docs-shell'
import { GUIDES, guidePath } from '@/lib/docs/guides-data'

const DESCRIPTION =
  'Framework-specific integration guides for the Calorie API: React Native food tracking, Next.js nutrition apps, Flutter barcode scanning, Node.js food search, and Python data analysis.'

export const metadata: Metadata = buildPageMetadata({
  title: 'Integration Guides',
  description: DESCRIPTION,
  keywords: [
    'nutrition API tutorial',
    'food API integration guide',
    'react native nutrition API',
    'flutter food API',
    'next.js nutrition app',
  ],
  path: '/docs/guides',
})

export default function GuidesIndexPage() {
  return (
    <div className="marketing-page docs-page min-h-screen">
      <JsonLdScript
        id="webpage-docs-guides"
        data={buildWebPageJsonLd({
          name: 'Integration Guides',
          description: DESCRIPTION,
          path: '/docs/guides',
        })}
      />
      <JsonLdScript
        id="breadcrumb-docs-guides"
        data={buildBreadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Documentation', path: '/docs' },
          { name: 'Integration Guides', path: '/docs/guides' },
        ])}
      />

      <DocsShell>
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-ink-muted">
          <ol className="flex flex-wrap items-center gap-1">
            <li>
              <Link href="/docs" className="text-brand-strong hover:underline">
                Docs
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li aria-current="page">Guides</li>
          </ol>
        </nav>

        <header className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl text-ink mb-3">Integration Guides</h1>
          <p className="text-ink-muted leading-relaxed max-w-3xl">
            Working code for common nutrition features, one framework at a time. Every guide uses
            real endpoints and keeps your API key server-side.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {GUIDES.map((guide) => (
            <Link
              key={guide.slug}
              href={guidePath(guide.slug)}
              className="group rounded-brand border border-surface-border p-5 hover:border-brand transition-colors"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-strong mb-1">
                {guide.framework}
              </p>
              <h2 className="text-lg font-semibold text-ink mb-1 group-hover:text-brand-strong">
                {guide.title}
              </h2>
              <p className="text-sm text-ink-muted leading-relaxed">{guide.summary}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand-strong">
                Read guide <ArrowRight className="w-4 h-4" aria-hidden />
              </span>
            </Link>
          ))}
        </div>
      </DocsShell>
    </div>
  )
}
