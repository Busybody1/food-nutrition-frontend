import type { Metadata } from 'next'
import { MarketingHero } from '@/components/marketing/marketing-hero'
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
      <MarketingHero title="Changelog" subtitle="Product updates, API changes, and platform improvements." compact />
      <section className="bg-white section-pad-sm">
        <div className="container-prose">
          <div className="relative">
            <span
              className="pointer-events-none absolute left-[9px] top-3 bottom-3 w-px bg-gradient-to-b from-brand/40 via-surface-border to-transparent"
              aria-hidden
            />
            <ol className="relative space-y-5">
              {CHANGELOG_ENTRIES.map((entry, i) => (
                <Reveal as="li" key={entry.id} delay={Math.min(i, 6) * 60}>
                  <div
                    id={entry.id}
                    className="relative scroll-mt-[calc(var(--site-header-offset)+2rem)] pl-8"
                  >
                    <span
                      className="absolute left-0 top-1.5 flex h-[19px] w-[19px] items-center justify-center rounded-full border-2 border-white bg-brand shadow-glow"
                      aria-hidden
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                    </span>
                    <div className="marketing-card">
                      <p className="text-xs font-semibold uppercase tracking-wide text-brand-strong mb-2">
                        <time dateTime={entry.date}>{entry.date}</time>
                      </p>
                      <h2 className="text-lg font-semibold text-ink">{entry.title}</h2>
                      <p className="text-sm text-ink-muted mt-2 leading-relaxed">{entry.body}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </section>

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
