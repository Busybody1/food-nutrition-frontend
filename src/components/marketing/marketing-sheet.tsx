import type { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

type SectionAria = {
  id?: string
  'aria-labelledby'?: string
  'aria-label'?: string
}

export function MarketingSheet({
  children,
  className,
  innerClassName,
  padded = true,
  band = false,
  ...aria
}: SectionAria & {
  children: ReactNode
  className?: string
  innerClassName?: string
  padded?: boolean
  band?: boolean
}) {
  return (
    <section className={className} {...aria}>
      <div className={cn('marketing-sheet', band && 'marketing-band', padded && 'marketing-sheet-pad', innerClassName)}>
        {children}
      </div>
    </section>
  )
}

export function MarketingCanvasSection({
  children,
  className,
  ...aria
}: SectionAria & { children: ReactNode; className?: string }) {
  return (
    <section className={cn('marketing-canvas-pad', className)} {...aria}>
      {children}
    </section>
  )
}

export function MarketingSheetHero({
  badge,
  title,
  lead,
  leadId,
  leadClassName,
  actions,
  children,
  showcase,
  size = 'inner',
  className,
}: {
  badge?: ReactNode
  title: ReactNode
  lead?: ReactNode
  leadId?: string
  leadClassName?: string
  actions?: ReactNode
  children?: ReactNode
  showcase?: ReactNode
  size?: 'home' | 'inner'
  className?: string
}) {
  return (
    <section data-sheet-hero="" className={className}>
      <div className="marketing-sheet marketing-sheet--hero">
        <div
          className={cn(
            'container-narrow relative z-10 text-center',
            showcase ? 'pb-10 pt-12 md:pb-14 md:pt-16' : 'pb-14 pt-12 md:pb-20 md:pt-16'
          )}
        >
          {badge && <p className="marketing-hero-badge mb-5 animate-rise stagger-1">{badge}</p>}
          <h1
            className={cn(
              'mx-auto animate-rise-paint',
              size === 'home' ? 'marketing-display max-w-3xl' : 'marketing-display-sm max-w-4xl'
            )}
          >
            {title}
          </h1>
          {lead && (
            <p id={leadId} className={cn('marketing-lead mt-5 animate-rise-paint', leadClassName)}>
              {lead}
            </p>
          )}
          {actions && (
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 animate-rise stagger-4">
              {actions}
            </div>
          )}
          {children && <div className="animate-rise stagger-5">{children}</div>}
        </div>
        {showcase}
      </div>
    </section>
  )
}

export function MarketingSplit({
  copy,
  aside,
  reverse = false,
  className,
}: {
  copy: ReactNode
  aside: ReactNode
  reverse?: boolean
  className?: string
}) {
  return (
    <div className={cn('grid items-center gap-10 lg:grid-cols-12 lg:gap-14', className)}>
      <div className={cn('min-w-0 lg:col-span-5', reverse && 'lg:order-last lg:col-start-8')}>{copy}</div>
      <div className={cn('min-w-0 lg:col-span-7', reverse && 'lg:order-first lg:col-start-1')}>{aside}</div>
    </div>
  )
}

export function MarketingSplitCopy({
  title,
  titleId,
  description,
  actions,
  children,
}: {
  title: ReactNode
  titleId?: string
  description?: ReactNode
  actions?: ReactNode
  children?: ReactNode
}) {
  return (
    <div className="max-w-xl">
      <h2 id={titleId} className="marketing-h2">
        {title}
      </h2>
      {description && <p className="marketing-body mt-4">{description}</p>}
      {children}
      {actions && <div className="mt-8 flex flex-wrap items-center gap-3">{actions}</div>}
    </div>
  )
}
