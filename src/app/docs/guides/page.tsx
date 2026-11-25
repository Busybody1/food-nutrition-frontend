import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Code2, Globe, GraduationCap, Layers, Smartphone, Terminal } from 'lucide-react'
import { buildPageMetadata } from '@/lib/metadata'
import { JsonLdScript } from '@/components/seo/structured-data'
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from '@/lib/seo-jsonld'
import { DocsShell } from '@/components/docs/docs-shell'
import { DocsCta } from '@/components/docs/docs-cta'
import { Reveal } from '@/components/marketing/reveal'
import { MarketingIconDisc, discToneAt } from '@/components/marketing/marketing-shell'
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

const GUIDE_ICONS: Record<string, typeof Code2> = {
  'React Native': Smartphone,
  'Next.js': Globe,
  Flutter: Layers,
  'Node.js': Terminal,
  Python: Code2,
}

const CARD_LINK_CLASS =
  'marketing-card group flex h-full min-w-0 flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2'

const BREADCRUMB_LINK_CLASS =
  'rounded text-brand-strong underline decoration-brand/40 underline-offset-2 hover:decoration-brand-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand'

export default function GuidesIndexPage() {
  return (
    <div className="marketing-page min-h-screen">
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
        <div className="mb-8 border-b border-mk-hair pb-6 md:pb-8">
          <nav aria-label="Breadcrumb" className="mb-4 text-sm text-mk-muted">
            <ol className="flex flex-wrap items-center gap-1">
              <li>
                <Link href="/docs" className={BREADCRUMB_LINK_CLASS}>
                  Docs
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li aria-current="page">Guides</li>
            </ol>
          </nav>

          <header>
            <MarketingIconDisc icon={GraduationCap} tone="violet" className="mb-4" />
            <h1 className="font-sans text-3xl md:text-[2.5rem] font-bold leading-[1.1] tracking-[-0.03em] text-mk-ink text-balance mb-3">Integration Guides</h1>
            <p className="text-mk-body leading-relaxed max-w-3xl">
              Working code for common nutrition features, one framework at a time. Every guide uses
              real endpoints and keeps your API key server-side.
            </p>
          </header>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          {GUIDES.map((guide, index) => {
            const Icon = GUIDE_ICONS[guide.framework] ?? Code2
            const featured = index === 0
            return (
              <Reveal
                key={guide.slug}
                delay={Math.min(index, 6) * 80}
                className={featured ? 'h-full min-w-0 md:col-span-2' : 'h-full min-w-0'}
              >
                <Link
                  href={guidePath(guide.slug)}
                  className={featured ? `${CARD_LINK_CLASS} p-6` : CARD_LINK_CLASS}
                >
                  <div className="mb-3 flex items-center gap-2.5">
                    <MarketingIconDisc icon={Icon} tone={discToneAt(index)} />
                    <p className="marketing-section-label">{guide.framework}</p>
                  </div>
                  <h2 className="text-xl font-semibold tracking-[-0.01em] text-mk-ink mb-2 group-hover:text-brand-strong transition-colors duration-200">
                    {guide.title}
                  </h2>
                  <p className="text-sm text-mk-muted leading-relaxed">{guide.summary}</p>
                  <span className="mt-auto pt-4 inline-flex items-center gap-1 text-sm font-medium text-mk-ink">
                    Read guide{' '}
                    <ArrowRight
                      className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </span>
                </Link>
              </Reveal>
            )
          })}
        </div>

        <DocsCta />
      </DocsShell>
    </div>
  )
}
