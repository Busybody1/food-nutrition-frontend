import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '@/lib/metadata'
import { cn } from '@/lib/utils/cn'
import { MarketingSheetHero } from '@/components/marketing/marketing-sheet'

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
    <div className="marketing-page">
      <MarketingSheetHero
        badge="404"
        title="Page not found"
        lead="This URL does not exist or may have moved. Try one of the links below or return to the homepage."
      >
        <ul className="mx-auto mt-10 grid max-w-lg grid-cols-1 gap-2 text-left text-[15px] sm:grid-cols-2">
          {helpfulLinks.map((link) => {
            const isRegister = link.href === '/auth/register'
            return (
              <li key={link.href} className={cn(isRegister && 'sm:col-span-2')}>
                <Link
                  href={link.href}
                  prefetch={false}
                  className={cn(
                    'flex min-h-11 items-center rounded-xl border px-3.5 transition-colors duration-200',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2',
                    isRegister
                      ? 'border-mk-line bg-mk-stage font-medium text-mk-ink hover:bg-white'
                      : 'border-mk-hair bg-white text-mk-muted hover:bg-mk-stage hover:text-mk-ink'
                  )}
                >
                  {link.label}
                </Link>
              </li>
            )
          })}
        </ul>
        <div className="mt-8">
          <Link href="/" prefetch={false} className="btn-brand">
            Back to home
          </Link>
        </div>
      </MarketingSheetHero>
    </div>
  )
}
