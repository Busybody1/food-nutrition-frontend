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
        'marketing-canvas-pad',
        className
      )}
      aria-labelledby={`${id}-heading`}
    >
      <div className="container-prose">
        <h2 id={`${id}-heading`} className="marketing-h3 mb-6">
          {title}
        </h2>
        <div className="marketing-body space-y-4">{children}</div>
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
      className="text-brand-strong font-medium underline decoration-brand/40 underline-offset-2 transition-colors duration-200 hover:decoration-brand-strong rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
    >
      {children}
    </Link>
  )
}
