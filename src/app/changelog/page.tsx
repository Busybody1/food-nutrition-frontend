import type { Metadata } from 'next'
import { MarketingHero } from '@/components/marketing/marketing-hero'
import { buildPublicPageMetadata } from '@/lib/build-public-metadata'
import { PublicPageSchema } from '@/components/seo/public-page-schema'
import { ChangelogSeoContent } from '@/components/seo/public-page-seo-content'
import { CHANGELOG_ENTRIES } from '@/content/changelog'

export const metadata: Metadata = buildPublicPageMetadata('/changelog')

export default function ChangelogPage() {
  return (
    <div className="marketing-page">
      <PublicPageSchema path="/changelog" pageName="Changelog" />
      <MarketingHero title="Changelog" subtitle="Product updates, API changes, and platform improvements." compact />
      <section className="pb-20 md:pb-28 -mt-4">
        <div className="container-narrow max-w-2xl">
          <ul className="space-y-4">
            {CHANGELOG_ENTRIES.map((entry) => (
              <li key={entry.id} id={entry.id} className="marketing-card scroll-mt-24">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-strong mb-2">
                  <time dateTime={entry.date}>{entry.date}</time>
                </p>
                <h2 className="text-lg font-semibold text-ink">{entry.title}</h2>
                <p className="text-sm text-ink-muted mt-2 leading-relaxed">{entry.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <ChangelogSeoContent />
    </div>
  )
}
