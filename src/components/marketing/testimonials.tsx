import Image from 'next/image'
import { MessageSquareQuote } from 'lucide-react'
import { MarketingSectionHeader, marketingCardClass } from '@/components/marketing/marketing-shell'
import { getPublicTestimonials } from '@/lib/api/testimonials'

/**
 * Customer quotes managed in the admin dashboard (DB-driven, avatars on S3).
 * Renders nothing while no testimonials are published.
 */
export async function Testimonials() {
  const testimonials = await getPublicTestimonials()
  if (testimonials.length === 0) return null

  return (
    <section className="section-pad bg-white border-t border-surface-border/60" aria-label="Customer testimonials">
      <div className="container-narrow">
        <MarketingSectionHeader label="Developers" title="What teams ship with the API" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {testimonials.map((t) => (
            <figure key={`${t.author_name}-${t.quote.slice(0, 24)}`} className={`${marketingCardClass} p-6 flex flex-col`}>
              <blockquote className="text-sm text-ink-muted leading-relaxed mb-4 flex-1">
                “{t.quote}”
              </blockquote>
              <figcaption className="flex items-center gap-3 text-sm">
                {t.avatar_url ? (
                  <span className="relative block h-10 w-10 shrink-0 overflow-hidden rounded-full ring-1 ring-surface-border/60">
                    <Image
                      src={t.avatar_url}
                      alt={`${t.author_name} portrait`}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </span>
                ) : (
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-elevated text-brand-strong">
                    <MessageSquareQuote className="h-4 w-4" aria-hidden />
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
        </div>
      </div>
    </section>
  )
}
