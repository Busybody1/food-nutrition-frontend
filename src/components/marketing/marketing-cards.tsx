import Link from 'next/link'
import { Children, type ReactNode } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { MarketingIconDisc, discToneAt, type DiscTone, type MarketingIcon } from '@/components/marketing/marketing-shell'

const STACK_INSET_CLASS = ['', 'md:mx-3', 'md:mx-6']

export function MarketingFloatStack({
  children,
  className,
  float = false,
}: {
  children: ReactNode
  className?: string
  float?: boolean
}) {
  const items = Children.toArray(children)
  return (
    <div className={cn('mx-auto w-full max-w-md', className)}>
      <div className={cn('flex flex-col gap-2 md:gap-0', float && 'md:animate-float-slow')}>
        {items.map((child, index) => (
          <div
            key={index}
            className={cn('relative', index > 0 && 'md:-mt-2', STACK_INSET_CLASS[Math.min(index, 2)])}
            style={{ zIndex: items.length - index }}
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  )
}

export function MarketingFloatCard({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('marketing-float-card', className)}>{children}</div>
}

export function MarketingPreviewCard({
  href,
  title,
  description,
  stage,
}: {
  href: string
  title: string
  description: string
  stage: ReactNode
}) {
  return (
    <Link href={href} prefetch={false} className="marketing-preview-card group">
      <div className="marketing-preview-stage" aria-hidden>
        {stage}
      </div>
      <div className="flex flex-1 flex-col p-5 md:p-6">
        <h3 className="flex items-center justify-between gap-3 text-base font-semibold tracking-[-0.01em] text-mk-ink">
          {title}
          <ArrowUpRight
            className="h-4 w-4 shrink-0 text-mk-muted transition-transform duration-200 motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5"
            aria-hidden
          />
        </h3>
        <p className="mt-1.5 text-[15px] leading-relaxed text-mk-muted">{description}</p>
      </div>
    </Link>
  )
}

export function MarketingProductFrame({
  children,
  cropped = false,
  className,
  frameClassName,
}: {
  children: ReactNode
  cropped?: boolean
  className?: string
  frameClassName?: string
}) {
  return (
    <div
      className={cn(
        'marketing-product-stage',
        cropped ? 'max-h-[300px] md:max-h-[340px]' : 'marketing-product-stage--padded',
        className
      )}
    >
      <div className={cn('marketing-product-frame', cropped && 'rounded-b-none border-b-0', frameClassName)}>
        {children}
      </div>
    </div>
  )
}

export type MarketingIntegrationItem = {
  icon: MarketingIcon
  title: string
  description: string
  href: string
  tone?: DiscTone
}

export function MarketingIntegrationList({ items }: { items: readonly MarketingIntegrationItem[] }) {
  return (
    <ul className="divide-y divide-mk-hair border-y border-mk-hair">
      {items.map((item, index) => (
        <li key={item.href}>
          <Link
            href={item.href}
            prefetch={false}
            className="group flex items-start gap-4 rounded-xl py-5 transition-colors md:py-6"
          >
            <MarketingIconDisc icon={item.icon} tone={item.tone ?? discToneAt(index)} />
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2 text-base font-semibold tracking-[-0.01em] text-mk-ink">
                {item.title}
                <ArrowUpRight
                  className="h-4 w-4 shrink-0 text-mk-muted transition-transform duration-200 motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5"
                  aria-hidden
                />
              </span>
              <span className="mt-1 block text-[15px] leading-relaxed text-mk-muted">{item.description}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
