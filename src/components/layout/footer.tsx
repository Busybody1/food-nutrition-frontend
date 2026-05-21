import Link from 'next/link'
import Image from 'next/image'
import { SITE_NAME, SUPPORT_EMAIL, absoluteUrl } from '@/lib/site'

const productLinks = [
  { href: '/docs', label: 'Documentation' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/api-status', label: 'API status' },
  { href: '/changelog', label: 'Changelog' },
]

const legalLinks = [
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
  { href: '/cookies', label: 'Cookies' },
  { href: '/contact', label: 'Contact' },
]

export function Footer() {
  return (
    <footer className="bg-white border-t border-surface-border/80">
      <div className="container-narrow py-14 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8">
          <div className="md:col-span-5">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-4">
              <Image src="/logos/busybody-logo.png" alt="" width={32} height={32} className="h-8 w-8" />
              <span className="text-base font-semibold text-ink">{SITE_NAME}</span>
            </Link>
            <p className="text-ink-muted text-sm max-w-sm leading-relaxed mb-4">
              Food and nutrition database API with search, suggest, barcode lookup, and developer
              dashboards. Powered by BusyBody FIT LTD.
            </p>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="text-sm font-medium text-brand-strong hover:text-brand transition-colors"
            >
              {SUPPORT_EMAIL}
            </a>
          </div>

          <div className="md:col-span-3">
            <h3 className="text-xs font-semibold text-ink uppercase tracking-wider mb-4">Product</h3>
            <ul className="space-y-2.5">
              {productLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-ink-muted hover:text-brand-strong transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-4">
            <h3 className="text-xs font-semibold text-ink uppercase tracking-wider mb-4">Legal</h3>
            <ul className="space-y-2.5">
              {legalLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-ink-muted hover:text-brand-strong transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-surface-border/60 flex flex-col sm:flex-row justify-between gap-3 text-xs text-ink-dim">
          <p>© {new Date().getFullYear()} BusyBody FIT LTD. All rights reserved.</p>
          <a href={absoluteUrl('/llms.txt')} className="hover:text-brand-strong transition-colors">
            llms.txt
          </a>
        </div>
      </div>
    </footer>
  )
}
