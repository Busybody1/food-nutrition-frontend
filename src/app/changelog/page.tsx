import type { Metadata } from 'next'
import { MarketingHero } from '@/components/marketing/marketing-hero'
import { buildPublicPageMetadata } from '@/lib/build-public-metadata'
import { PublicPageSchema } from '@/components/seo/public-page-schema'
import { ChangelogSeoContent } from '@/components/seo/public-page-seo-content'

export const metadata: Metadata = buildPublicPageMetadata('/changelog')

const entries = [
  {
    date: '2026-05',
    title: 'Search extensions',
    body: 'match_mode, verified_only, suggest, barcode, and public demo endpoint.',
  },
  {
    date: '2026-05',
    title: 'Platform fixes',
    body: 'Rate limiting paths, admin API alignment, and register→login flow.',
  },
  {
    date: '2026-05',
    title: 'Dashboard refresh',
    body: 'Updated developer dashboard and marketing site UI for clearer navigation and usage insights.',
  },
]

export default function ChangelogPage() {
  return (
    <div className="marketing-page">
      <PublicPageSchema path="/changelog" pageName="Changelog" />
      <MarketingHero title="Changelog" subtitle="Product updates, API changes, and platform improvements." compact />
      <section className="pb-20 md:pb-28 -mt-4">
        <div className="container-narrow max-w-2xl">
          <ul className="space-y-4">
            {entries.map((e) => (
              <li key={e.title} className="marketing-card">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-strong mb-2">
                  {e.date}
                </p>
                <h2 className="text-lg font-semibold text-ink">{e.title}</h2>
                <p className="text-sm text-ink-muted mt-2 leading-relaxed">{e.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <ChangelogSeoContent />
    </div>
  )
}
