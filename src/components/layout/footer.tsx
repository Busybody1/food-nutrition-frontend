import Link from 'next/link'
import Image from 'next/image'
import { SITE_NAME, SUPPORT_EMAIL, LOGO_ALT, absoluteUrl } from '@/lib/site'
import { CAPABILITY_PAGES, capabilityPath } from '@/lib/capability-pages-data'
import { SOLUTION_PAGES, solutionPath } from '@/lib/solutions-data'

const productLinks = [
  { href: '/docs', label: 'Documentation' },
  { href: '/playground', label: 'API Playground' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/blog', label: 'Blog' },
  { href: '/api-status', label: 'API status' },
  { href: '/changelog', label: 'Changelog' },
]

const apiLinks = [
  ...CAPABILITY_PAGES.map((page) => ({
    href: capabilityPath(page.slug),
    label: page.h1,
  })),
  { href: '/compare', label: 'Compare providers' },
]

const solutionLinks = [
  ...SOLUTION_PAGES.map((page) => ({
    href: solutionPath(page.slug),
    label: page.heroBadge,
  })),
  { href: '/solutions', label: 'All solutions' },
]

const navPrefetch = { prefetch: false } as const

const legalLinks = [
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
  { href: '/cookies', label: 'Cookies' },
  { href: '/contact', label: 'Contact' },
]

function FooterLinkColumn({
  title,
  links,
}: {
  title: string
  links: { href: string; label: string }[]
}) {
  return (
    <div className="md:col-span-2">
      <h3 className="text-xs font-semibold text-ink uppercase tracking-wider mb-4">{title}</h3>
      <ul className="space-y-2.5">
        {links.map(({ href, label }) => (
          <li key={href}>
            <Link
              href={href}
              prefetch={false}
              className="text-sm text-ink-muted hover:text-brand-strong transition-colors"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Footer() {
  return (
    <footer className="bg-white border-t border-surface-border/80">
      <div className="container-narrow py-14 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8">
          <div className="md:col-span-4">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-4" {...navPrefetch}>
              <span className="relative block h-8 w-8 shrink-0">
                <Image
                  src="/logos/busybody-logo.png"
                  alt={LOGO_ALT}
                  fill
                  sizes="32px"
                  className="object-contain"
                />
              </span>
              <span className="text-base font-semibold text-ink">{SITE_NAME}</span>
            </Link>
            <p className="text-ink-muted text-sm max-w-sm leading-relaxed mb-4">
              Food calorie API with search, suggest, barcode lookup, and developer dashboards.
              Powered by BusyBody FIT LTD.
            </p>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="text-sm font-medium text-brand-strong hover:text-brand transition-colors"
            >
              {SUPPORT_EMAIL}
            </a>
          </div>

          <FooterLinkColumn title="Product" links={productLinks} />
          <FooterLinkColumn title="APIs" links={apiLinks} />
          <FooterLinkColumn title="Solutions" links={solutionLinks} />
          <FooterLinkColumn title="Legal" links={legalLinks} />
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
