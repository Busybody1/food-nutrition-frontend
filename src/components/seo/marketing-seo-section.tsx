import Link from 'next/link'
import { cn } from '@/lib/utils/cn'

type MarketingSeoSectionProps = {
  title: string
  children: React.ReactNode
  className?: string
  id?: string
}

export function MarketingSeoSection({
  title,
  children,
  className,
  id = 'page-seo-content',
}: MarketingSeoSectionProps) {
  return (
    <section
      id={id}
      className={cn(
        'section-pad bg-white border-t border-surface-border/60',
        className
      )}
      aria-labelledby={`${id}-heading`}
    >
      <div className="container-prose">
        <h2
          id={`${id}-heading`}
          className="font-display text-3xl md:text-4xl tracking-tight text-ink mb-3"
        >
          {title}
        </h2>
        <div
          className="h-1 w-12 rounded-full bg-gradient-to-r from-brand to-brand-soft mb-6"
          aria-hidden
        />
        <div className="space-y-4 text-ink-muted leading-relaxed text-base">{children}</div>
      </div>
    </section>
  )
}

export function SeoInlineLink({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      prefetch={false}
      className="text-brand-strong font-medium underline decoration-brand/40 underline-offset-2 transition-colors duration-200 hover:decoration-brand-strong rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2"
    >
      {children}
    </Link>
  )
}
