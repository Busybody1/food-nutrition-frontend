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
    <div className="min-w-0 md:col-span-1 lg:col-span-2">
      <h3 className="text-xs font-semibold text-ink uppercase tracking-wider mb-4">{title}</h3>
      <ul className="space-y-2.5">
        {links.map(({ href, label }) => (
          <li key={href}>
            <Link
              href={href}
              prefetch={false}
              className="inline-block rounded-sm text-sm text-ink-muted transition-colors duration-200 hover:text-brand-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2"
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
    <footer className="relative overflow-hidden bg-surface-elevated border-t border-brand/10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(10,197,215,0.08),transparent)]"
      />
      <div className="container-narrow relative py-14 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-12 gap-10 md:gap-8">
          <div className="col-span-2 md:col-span-4 lg:col-span-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 mb-4 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2"
              {...navPrefetch}
            >
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
              className="rounded-sm text-sm font-medium text-brand-strong underline decoration-brand/40 underline-offset-2 transition-colors duration-200 hover:decoration-brand-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2"
            >
              {SUPPORT_EMAIL}
            </a>
            <div className="mt-5">
              <Link href="/auth/register" prefetch={false} className="btn-brand h-10 px-5">
                Get API key
              </Link>
            </div>
          </div>

          <FooterLinkColumn title="Product" links={productLinks} />
          <FooterLinkColumn title="APIs" links={apiLinks} />
          <FooterLinkColumn title="Solutions" links={solutionLinks} />
          <FooterLinkColumn title="Legal" links={legalLinks} />
        </div>

        <div className="mt-12 pt-8 border-t border-surface-border/60 flex flex-col sm:flex-row justify-between gap-3 text-xs text-ink-muted">
          <p>© {new Date().getFullYear()} BusyBody FIT LTD. All rights reserved.</p>
          <a
            href={absoluteUrl('/llms.txt')}
            className="rounded-sm underline decoration-surface-border underline-offset-2 transition-colors duration-200 hover:text-brand-strong hover:decoration-brand-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2"
          >
            llms.txt
          </a>
        </div>
      </div>
    </footer>
  )
}
