import { MarketingSectionHeader, marketingCardClass } from '@/components/marketing/marketing-shell'
import { TESTIMONIALS } from '@/lib/testimonials-data'

/** Renders nothing until real customer quotes exist in testimonials-data.ts. */
export function Testimonials() {
  if (TESTIMONIALS.length === 0) return null
  return (
    <section className="section-pad bg-white border-t border-surface-border/60" aria-label="Customer testimonials">
      <div className="container-narrow">
        <MarketingSectionHeader label="Developers" title="What teams ship with the API" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {TESTIMONIALS.map((t) => (
            <figure key={t.quote.slice(0, 40)} className={`${marketingCardClass} p-6`}>
              <blockquote className="text-sm text-ink-muted leading-relaxed mb-4">
                “{t.quote}”
              </blockquote>
              <figcaption className="text-sm">
                <span className="font-semibold text-ink">{t.author}</span>
                <span className="text-ink-muted">
                  {' '}
                  — {t.role}
                  {t.company ? `, ${t.company}` : ''}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
