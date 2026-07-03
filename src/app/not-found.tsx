import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '@/lib/metadata'
import { cn } from '@/lib/utils/cn'

export const metadata: Metadata = buildPageMetadata({
  title: 'Page not found',
  description: 'The page you requested could not be found on Calorie API.',
  path: '/404',
  noIndex: true,
})

const helpfulLinks = [
  { href: '/', label: 'Home' },
  { href: '/docs', label: 'API documentation' },
  { href: '/playground', label: 'API playground' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/blog', label: 'Blog' },
  { href: '/faq', label: 'FAQ' },
  { href: '/auth/register', label: 'Get API key' },
]

export default function NotFound() {
  return (
    <div className="marketing-page hero-glow hero-pad-compact flex min-h-[calc(100vh-var(--site-header-offset))] items-center justify-center px-4">
      <div className="marketing-card card-hairline animate-rise relative max-w-lg w-full p-8 md:p-10 text-center">
        <p className="marketing-section-label mb-3">404</p>
        <h1 className="font-display text-3xl md:text-4xl tracking-tight text-balance text-ink mb-3">
          Page not found
        </h1>
        <p className="text-sm text-ink-muted mb-8 leading-relaxed">
          This URL does not exist or may have moved. Try one of the links below or return to the homepage.
        </p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-left mb-8">
          {helpfulLinks.map((link) => {
            const isRegister = link.href === '/auth/register'
            return (
              <li key={link.href} className={cn(isRegister && 'sm:col-span-2')}>
                <Link
                  href={link.href}
                  prefetch={false}
                  className={cn(
                    'block rounded-brand border px-3 py-2 transition-colors duration-200',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2',
                    isRegister
                      ? 'border-brand/40 bg-brand-muted font-medium text-brand-strong hover:bg-brand/15'
                      : 'border-surface-border/70 text-ink-muted hover:text-brand-strong hover:border-brand/30'
                  )}
                >
                  {link.label}
                </Link>
              </li>
            )
          })}
        </ul>
        <Link href="/" prefetch={false} className="btn-brand">
          Back to home
        </Link>
      </div>
    </div>
  )
}
