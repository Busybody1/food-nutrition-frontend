import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export const marketingCardClass =
  'bg-white border border-surface-border/80 rounded-brand text-ink shadow-glass hover:shadow-glass-lg transition-shadow duration-200'

export function MarketingSectionHeader({
  label,
  title,
  description,
  className,
}: {
  label?: string
  title: React.ReactNode
  description?: string
  className?: string
}) {
  return (
    <div className={cn('text-center max-w-3xl mx-auto mb-12 md:mb-14', className)}>
      {label && <p className="marketing-section-label mb-3">{label}</p>}
      <h2 className="font-display text-3xl md:text-4xl text-ink text-balance">{title}</h2>
      {description && (
        <p className="mt-4 text-ink-muted text-base md:text-lg leading-relaxed">{description}</p>
      )}
    </div>
  )
}

export function MarketingTrustPills({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-ink-dim">
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
    <div className="marketing-feature-card group">
      <div className="marketing-feature-icon">
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
}: {
  title: string
  description: string
  primaryHref: string
  primaryLabel: string
  secondaryHref?: string
  secondaryLabel?: string
}) {
  return (
    <section className="marketing-cta-band">
      <div className="container-narrow text-center relative z-10">
        <h2 className="font-display text-3xl md:text-4xl text-ink mb-4 text-balance">{title}</h2>
        <p className="text-ink-muted max-w-lg mx-auto mb-8 leading-relaxed">{description}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href={primaryHref} className="btn-brand">
            {primaryLabel}
          </Link>
          {secondaryHref && secondaryLabel && (
            <Link href={secondaryHref} className="btn-brand-outline">
              {secondaryLabel}
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}

export function MarketingStatStrip({
  stats,
}: {
  stats: { value: string; label: string; icon?: LucideIcon }[]
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
      {stats.map(({ value, label, icon: Icon }) => (
        <div key={label} className="text-center">
          {Icon && <Icon className="h-7 w-7 text-brand mx-auto mb-3 opacity-90" aria-hidden />}
          <div className="text-2xl md:text-3xl font-semibold text-ink tracking-tight tabular-nums">
            {value}
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
      <div className="dashboard-spinner" role="status" aria-label={message} />
      <p className="text-sm text-ink-muted">{message}</p>
    </div>
  )
}
