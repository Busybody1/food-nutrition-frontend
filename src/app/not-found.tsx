import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '@/lib/metadata'

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
    <div className="marketing-page min-h-[60vh] flex items-center justify-center px-4 py-20">
      <div className="marketing-card max-w-lg w-full p-8 md:p-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-strong mb-3">404</p>
        <h1 className="font-display text-3xl text-ink mb-3">Page not found</h1>
        <p className="text-sm text-ink-muted mb-8 leading-relaxed">
          This URL does not exist or may have moved. Try one of the links below or return to the homepage.
        </p>
        <ul className="grid grid-cols-2 gap-2 text-sm text-left mb-8">
          {helpfulLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                prefetch={false}
                className="block rounded-brand border border-surface-border/70 px-3 py-2 text-ink-muted hover:text-brand-strong hover:border-brand/30 transition-colors"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <Link href="/" prefetch={false} className="site-header-cta">
          Back to home
        </Link>
      </div>
    </div>
  )
}
