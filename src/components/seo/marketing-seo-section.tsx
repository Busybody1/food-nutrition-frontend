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
      <div className="container-narrow max-w-3xl">
        <h2 id={`${id}-heading`} className="font-display text-2xl md:text-3xl text-ink mb-4">
          {title}
        </h2>
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
    <Link href={href} prefetch={false} className="text-brand-strong font-medium hover:underline">
      {children}
    </Link>
  )
}
