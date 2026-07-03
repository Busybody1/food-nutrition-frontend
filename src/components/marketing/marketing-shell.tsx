import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { TrackedCtaLink } from '@/components/analytics/tracked-cta-link'
import { CountUp } from '@/components/marketing/count-up'

/**
 * Single source of truth for card chrome is the `.marketing-card` CSS class
 * (border, radius, p-5, shadow + hover lift). This constant exists for
 * consumers that compose the class string; keep it a pure alias.
 */
export const marketingCardClass = 'marketing-card'

export function MarketingSectionHeader({
  label,
  title,
  description,
  className,
  id,
}: {
  label?: string
  title: React.ReactNode
  description?: string
  className?: string
  /** Optional id on the h2 so sections can reference it via aria-labelledby. */
  id?: string
}) {
  return (
    <div className={cn('text-center max-w-3xl mx-auto mb-12 md:mb-14', className)}>
      {label && <p className="marketing-section-label mb-3">{label}</p>}
      <h2 id={id} className="font-display text-3xl md:text-4xl tracking-tight text-ink text-balance">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-ink-muted text-base md:text-lg leading-relaxed">{description}</p>
      )}
    </div>
  )
}

export function MarketingTrustPills({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-medium text-ink-muted">
      {items.map((item) => (
        <li key={item} className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-brand shrink-0" aria-hidden />
          {item}
        </li>
      ))}
    </ul>
  )
}

export function MarketingFeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon
  title: string
  description: string
}) {
  return (
    <div className="marketing-feature-card group h-full">
      <div className="marketing-feature-icon transition-all duration-200 motion-safe:group-hover:scale-105">
        <Icon className="h-6 w-6 text-brand-strong" aria-hidden />
      </div>
      <h3 className="text-lg font-semibold text-ink mb-2">{title}</h3>
      <p className="text-sm text-ink-muted leading-relaxed">{description}</p>
    </div>
  )
}

export function MarketingCtaBand({
  title,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  footnote,
  children,
}: {
  title: string
  description: string
  primaryHref: string
  primaryLabel: string
  secondaryHref?: string
  secondaryLabel?: string
  /** Optional trust/risk-reducer slot rendered under the CTA row (e.g. MarketingTrustPills). */
  footnote?: React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <section className="marketing-cta-band">
      <div className="container-narrow relative z-10">
        <div className="glass-panel card-hairline mx-auto max-w-3xl px-6 py-10 text-center shadow-glass-lg sm:px-10 md:px-14 md:py-14">
          <h2 className="font-display text-3xl md:text-4xl tracking-tight text-ink mb-4 text-balance">
            {title}
          </h2>
          <p className="text-ink-muted max-w-lg mx-auto mb-8 leading-relaxed">{description}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <TrackedCtaLink
              href={primaryHref}
              eventLabel={primaryLabel}
              className="btn-brand h-12 px-8 text-base w-full sm:w-auto"
            >
              {primaryLabel}
            </TrackedCtaLink>
            {secondaryHref && secondaryLabel && (
              <TrackedCtaLink
                href={secondaryHref}
                eventLabel={secondaryLabel}
                className="btn-brand-outline h-12 px-8 text-base w-full sm:w-auto"
              >
                {secondaryLabel}
              </TrackedCtaLink>
            )}
          </div>
          {footnote && <div className="mt-6 text-sm text-ink-muted">{footnote}</div>}
          {children && <div className="mt-6">{children}</div>}
        </div>
      </div>
    </section>
  )
}

/** Brand gradient with a genuine solid-ink fallback where bg-clip:text is unsupported. */
const STAT_VALUE_CLASS =
  'font-display text-3xl md:text-4xl tracking-tight whitespace-nowrap text-ink ' +
  'supports-[background-clip:text]:bg-gradient-to-r supports-[background-clip:text]:from-brand-strong ' +
  'supports-[background-clip:text]:via-brand supports-[background-clip:text]:to-brand-soft ' +
  'supports-[background-clip:text]:bg-clip-text supports-[background-clip:text]:text-transparent'

const STAT_GRID_CLASS: Record<number, string> = {
  1: 'grid-cols-1 max-w-xs mx-auto',
  2: 'grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto sm:divide-x sm:divide-surface-border/70',
  3: 'grid-cols-1 sm:grid-cols-3 sm:divide-x sm:divide-surface-border/70',
  4: 'grid-cols-2 md:grid-cols-4 md:divide-x md:divide-surface-border/70',
}

export function MarketingStatStrip({
  stats,
}: {
  stats: { value: string; label: string; icon?: LucideIcon }[]
}) {
  const gridClass = STAT_GRID_CLASS[stats.length] ?? STAT_GRID_CLASS[4]
  return (
    <div className={cn('grid gap-y-6', gridClass)}>
      {stats.map(({ value, label, icon: Icon }) => (
        <div key={label} className="text-center px-4 md:px-6">
          {Icon && <Icon className="h-7 w-7 text-brand mx-auto mb-3 opacity-90" aria-hidden />}
          <div>
            {/\d/.test(value) ? (
              <CountUp value={value} className={STAT_VALUE_CLASS} />
            ) : (
              <span className={cn(STAT_VALUE_CLASS, 'tabular-nums')}>{value}</span>
            )}
          </div>
          <div className="text-xs md:text-sm text-ink-muted mt-1">{label}</div>
        </div>
      ))}
    </div>
  )
}

export function MarketingPageLoading({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="marketing-page min-h-[50vh] flex flex-col items-center justify-center gap-4">
      <div className="marketing-spinner" role="status" aria-label={message} />
      <p className="text-sm text-ink-muted">{message}</p>
    </div>
  )
}
