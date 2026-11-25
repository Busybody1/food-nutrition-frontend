import type { Icon as PhosphorIcon } from '@phosphor-icons/react'
import { cn } from '@/lib/utils/cn'
import { TrackedCtaLink } from '@/components/analytics/tracked-cta-link'
import { RevealGroup } from '@/components/marketing/reveal'

export const marketingCardClass = 'marketing-card'

export type MarketingIcon = PhosphorIcon

export type DiscTone = 'blue' | 'green' | 'violet' | 'coral'

const DISC_TONE_CLASS: Record<DiscTone, string> = {
  blue: 'text-mk-blue',
  green: 'text-mk-green',
  violet: 'text-mk-violet',
  coral: 'text-mk-coral',
}

const DISC_TONE_ORDER: DiscTone[] = ['blue', 'green', 'violet', 'coral']

export function discToneAt(index: number): DiscTone {
  return DISC_TONE_ORDER[index % DISC_TONE_ORDER.length]
}

export function discToneClass(tone: DiscTone): string {
  return DISC_TONE_CLASS[tone]
}

export function MarketingIconDisc({
  icon: Icon,
  tone = 'blue',
  className,
}: {
  icon: MarketingIcon
  tone?: DiscTone
  className?: string
}) {
  return (
    <span className={cn('marketing-icon-disc', DISC_TONE_CLASS[tone], className)} aria-hidden>
      <Icon weight="fill" className="h-7 w-7" />
    </span>
  )
}

export function MarketingSectionHeader({
  title,
  description,
  className,
  id,
  align = 'center',
}: {
  label?: string
  title: React.ReactNode
  description?: React.ReactNode
  className?: string
  id?: string
  align?: 'center' | 'left'
}) {
  const centered = align === 'center'
  return (
    <div className={cn('mb-10 md:mb-14', centered ? 'mx-auto max-w-3xl text-center' : 'max-w-2xl', className)}>
      <h2 id={id} className="marketing-h2">
        {title}
      </h2>
      {description && (
        <p className={cn('marketing-body mt-4', centered && 'mx-auto max-w-[38rem]')}>{description}</p>
      )}
    </div>
  )
}

export function MarketingTrustPills({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm font-medium text-mk-muted">
      {items.map((item) => (
        <li key={item} className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-mk-line" aria-hidden />
          {item}
        </li>
      ))}
    </ul>
  )
}

export type MarketingHighlightStat = { icon: MarketingIcon; value: string; label: string }

export function MarketingHighlightStats({
  stats,
  className,
}: {
  stats: readonly MarketingHighlightStat[]
  className?: string
}) {
  return (
    <ul
      className={cn(
        'mx-auto grid max-w-5xl grid-cols-2 gap-1 rounded-[24px] border border-mk-hair bg-white p-1.5 shadow-float md:grid-cols-4 md:gap-0 md:rounded-full md:p-2',
        className
      )}
    >
      {stats.map(({ icon, value, label }, index) => (
        <li
          key={label}
          className={cn(
            'flex min-w-0 flex-col items-center gap-2 rounded-[18px] px-2 py-4 text-center md:flex-row md:justify-center md:gap-3 md:rounded-none md:px-4 md:py-2 md:text-left',
            index > 0 && 'md:border-l md:border-mk-hair'
          )}
        >
          <MarketingIconDisc icon={icon} tone={discToneAt(index)} />
          <span className="min-w-0">
            <span className="block whitespace-nowrap text-[17px] font-semibold leading-tight tracking-[-0.02em] text-mk-ink tabular-nums">
              {value}
            </span>
            <span className="block text-[13px] leading-snug text-mk-muted lg:whitespace-nowrap">{label}</span>
          </span>
        </li>
      ))}
    </ul>
  )
}

export function MarketingFeatureCard({
  icon,
  title,
  description,
  tone = 'blue',
}: {
  icon: MarketingIcon
  title: string
  description: string
  tone?: DiscTone
}) {
  return (
    <div className="h-full">
      <MarketingIconDisc icon={icon} tone={tone} />
      <h3 className="mt-4 text-base font-semibold tracking-[-0.01em] text-mk-ink">{title}</h3>
      <p className="mt-1.5 text-[15px] leading-relaxed text-mk-muted">{description}</p>
    </div>
  )
}

export type MarketingFeatureItem = {
  icon: MarketingIcon
  title: string
  description: string
}

export function MarketingFeatureGrid({
  items,
  columns = 3,
  className,
}: {
  items: readonly MarketingFeatureItem[]
  columns?: 2 | 3
  className?: string
}) {
  return (
    <RevealGroup
      className={cn(
        'grid gap-x-10 gap-y-10 sm:grid-cols-2 md:gap-y-12',
        columns === 3 && 'lg:grid-cols-3',
        className
      )}
      itemClassName="h-full min-w-0"
    >
      {items.map((item, index) => (
        <MarketingFeatureCard
          key={item.title}
          icon={item.icon}
          title={item.title}
          description={item.description}
          tone={discToneAt(index)}
        />
      ))}
    </RevealGroup>
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
  description: React.ReactNode
  primaryHref: string
  primaryLabel: string
  secondaryHref?: string
  secondaryLabel?: string

  footnote?: React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <section className="marketing-cta-band">
      <div className="container-narrow text-center">
        <h2 className="marketing-h2 mx-auto max-w-2xl">{title}</h2>
        <p className="marketing-lead mt-4">{description}</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <TrackedCtaLink href={primaryHref} eventLabel={primaryLabel} className="btn-brand">
            {primaryLabel}
          </TrackedCtaLink>
          {secondaryHref && secondaryLabel && (
            <TrackedCtaLink href={secondaryHref} eventLabel={secondaryLabel} className="btn-brand-outline">
              {secondaryLabel}
            </TrackedCtaLink>
          )}
        </div>
        {footnote && <div className="mt-6 text-sm text-mk-muted">{footnote}</div>}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </section>
  )
}

const STAT_GRID_CLASS: Record<number, string> = {
  1: 'grid-cols-1 max-w-xs mx-auto',
  2: 'grid-cols-2 max-w-xl mx-auto',
  3: 'grid-cols-1 sm:grid-cols-3 max-w-3xl mx-auto',
  4: 'grid-cols-2 md:grid-cols-4',
}

export function MarketingStatStrip({
  stats,
}: {
  stats: { value: string; label: string; icon?: MarketingIcon }[]
}) {
  const gridClass = STAT_GRID_CLASS[stats.length] ?? STAT_GRID_CLASS[4]
  return (
    <dl className={cn('grid gap-x-6 gap-y-8', gridClass)}>
      {stats.map(({ value, label }) => (
        <div key={label} className="flex flex-col-reverse items-center text-center">
          <dt className="mt-1 text-sm text-mk-muted">{label}</dt>
          <dd className="whitespace-nowrap text-3xl font-semibold tabular-nums tracking-[-0.03em] text-mk-ink md:text-[2.25rem]">
            {value}
          </dd>
        </div>
      ))}
    </dl>
  )
}

export function MarketingPageLoading({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="marketing-page min-h-[50vh] flex flex-col items-center justify-center gap-4 pt-[var(--site-header-offset)]">
      <div className="marketing-spinner" role="status" aria-label={message} />
      <p className="text-sm text-mk-muted">{message}</p>
    </div>
  )
}
