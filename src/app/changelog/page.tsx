import type { Metadata } from 'next'
import { MarketingSheet, MarketingSheetHero } from '@/components/marketing/marketing-sheet'
import { MarketingCtaBand } from '@/components/marketing/marketing-shell'
import { Reveal } from '@/components/marketing/reveal'
import { buildPublicPageMetadata } from '@/lib/build-public-metadata'
import { PublicPageSchema } from '@/components/seo/public-page-schema'
import { ChangelogSeoContent } from '@/components/seo/public-page-seo-content'
import { CHANGELOG_ENTRIES } from '@/content/changelog'

export const metadata: Metadata = buildPublicPageMetadata('/changelog')

export default function ChangelogPage() {
  return (
    <div className="marketing-page">
      <PublicPageSchema path="/changelog" pageName="Changelog" />
      <MarketingSheetHero title="Changelog" lead="Product updates, API changes, and platform improvements." />
      <MarketingSheet>
        <div className="container-prose">
          <div className="relative">
            <span
              className="pointer-events-none absolute bottom-3 left-[9px] top-3 w-px bg-mk-line"
              aria-hidden
            />
            <ol className="relative space-y-10">
              {CHANGELOG_ENTRIES.map((entry, i) => (
                <Reveal as="li" key={entry.id} delay={Math.min(i, 6) * 60}>
                  <div
                    id={entry.id}
                    className="relative scroll-mt-[calc(var(--site-header-offset)+2rem)] pl-8"
                  >
                    <span
                      className="absolute left-0 top-0.5 flex h-[19px] w-[19px] items-center justify-center rounded-full border border-mk-line bg-white"
                      aria-hidden
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                    </span>
                    <div>
                      <p className="mb-1.5 text-[13px] font-medium text-mk-muted">
                        <time dateTime={entry.date}>{entry.date}</time>
                      </p>
                      <h2 className="text-lg font-semibold tracking-[-0.01em] text-mk-ink">{entry.title}</h2>
                      <p className="marketing-body mt-2">{entry.body}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </MarketingSheet>

      <MarketingCtaBand
        title="Ready to build?"
        description="Create a free account, grab an API key, and make your first search in minutes."
        primaryHref="/auth/register"
        primaryLabel="Get started free"
        secondaryHref="/docs"
        secondaryLabel="Read the docs"
      />

      <ChangelogSeoContent />
    </div>
  )
}
