import Image from 'next/image'
import { Quote } from 'lucide-react'
import { MarketingSectionHeader, marketingCardClass } from '@/components/marketing/marketing-shell'
import { Reveal, RevealGroup } from '@/components/marketing/reveal'
import { getPublicTestimonials } from '@/lib/api/testimonials'

/** Deterministic, count-aware grid so DB-driven quote counts never leave orphan cells. */
function gridClassFor(count: number): string {
  if (count === 1) return 'grid grid-cols-1 max-w-xl mx-auto gap-4 md:gap-5'
  if (count === 2 || count === 4) return 'grid sm:grid-cols-2 max-w-4xl mx-auto gap-4 md:gap-5'
  return 'grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5'
}

/**
 * Customer quotes managed in the admin dashboard (DB-driven, avatars on S3).
 * Renders nothing while no testimonials are published.
 */
export async function Testimonials() {
  const testimonials = await getPublicTestimonials()
  if (testimonials.length === 0) return null

  return (
    <section className="section-pad bg-surface-elevated" aria-label="Customer testimonials">
      <div className="container-narrow">
        <Reveal>
          <MarketingSectionHeader label="Developers" title="What teams ship with the API" />
        </Reveal>
        <RevealGroup className={gridClassFor(testimonials.length)} itemClassName="h-full min-w-0">
          {testimonials.map((t) => (
            <figure
              key={`${t.author_name}-${t.quote.slice(0, 24)}`}
              className={`${marketingCardClass} relative p-6 flex flex-col h-full`}
            >
              <Quote
                className="absolute right-5 top-5 h-7 w-7 text-brand/15 rotate-180"
                aria-hidden
              />
              <blockquote className="text-[15px] text-ink-muted leading-relaxed mb-4 flex-1 pr-8">
                “{t.quote}”
              </blockquote>
              <figcaption className="flex items-center gap-3 text-sm">
                {t.avatar_url ? (
                  <span className="relative block h-10 w-10 shrink-0 overflow-hidden rounded-full ring-2 ring-brand/20">
                    <Image
                      src={t.avatar_url}
                      alt={`${t.author_name} portrait`}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </span>
                ) : (
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-muted ring-2 ring-brand/20 text-brand-strong font-semibold"
                    aria-hidden
                  >
                    {t.author_name.charAt(0).toUpperCase()}
                  </span>
                )}
                <span className="min-w-0">
                  <span className="block font-semibold text-ink truncate">{t.author_name}</span>
                  {(t.author_role || t.company) && (
                    <span className="block text-xs text-ink-muted truncate">
                      {t.author_role}
                      {t.author_role && t.company ? ', ' : ''}
                      {t.company}
                    </span>
                  )}
                </span>
              </figcaption>
            </figure>
          ))}
        </RevealGroup>
      </div>
    </section>
  )
}
