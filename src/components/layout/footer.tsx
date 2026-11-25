import Link from 'next/link'
import Image from 'next/image'
import { SITE_NAME, SUPPORT_EMAIL, LOGO_ALT } from '@/lib/site'
import { CAPABILITY_PAGES, capabilityPath } from '@/lib/capability-pages-data'
import { SOLUTION_PAGES, solutionPath } from '@/lib/solutions-data'

const productLinks = [
  { href: '/docs', label: 'Documentation' },
  { href: '/playground', label: 'API Playground' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/mcp', label: 'Calorie MCP' },
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
  { href: '/commercial-license', label: 'Commercial License' },
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
    <div className="min-w-0 lg:col-span-2">
      <h3 className="mb-3.5 text-[13px] font-medium text-mk-ink">{title}</h3>
      <ul className="space-y-1">
        {links.map(({ href, label }) => (
          <li key={href}>
            <Link
              href={href}
              prefetch={false}
              className="inline-flex min-h-8 items-center rounded-sm text-[13px] text-mk-muted transition-colors duration-200 hover:text-mk-ink"
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
    <footer className="border-t border-mk-hair bg-white">
      <div>
        <div className="container-narrow py-12 md:py-14">
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4 lg:grid-cols-12 lg:gap-8">
            <div className="col-span-2 md:col-span-4 lg:col-span-4">
              <Link
                href="/"
                className="mb-4 inline-flex items-center gap-2.5 rounded-sm"
                {...navPrefetch}
              >
                <span className="relative block h-7 w-7 shrink-0">
                  <Image
                    src="/logos/busybody-logo.png"
                    alt={LOGO_ALT}
                    fill
                    sizes="28px"
                    className="object-contain"
                  />
                </span>
                <span className="text-[15px] font-semibold tracking-[-0.01em] text-mk-ink">{SITE_NAME}</span>
              </Link>
              <p className="mb-3 max-w-xs text-[13px] leading-relaxed text-mk-muted">
                Food calorie API with search, suggest, barcode lookup, and developer dashboards.
                Powered by BusyBody FIT LTD.
              </p>
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="rounded-sm text-[13px] font-medium text-mk-ink underline decoration-mk-line underline-offset-4 transition-colors duration-200 hover:decoration-mk-ink"
              >
                {SUPPORT_EMAIL}
              </a>
            </div>

            <FooterLinkColumn title="Product" links={productLinks} />
            <FooterLinkColumn title="APIs" links={apiLinks} />
            <FooterLinkColumn title="Solutions" links={solutionLinks} />
            <FooterLinkColumn title="Legal" links={legalLinks} />
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-mk-hair pt-6 text-[13px] text-mk-muted sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} BusyBody FIT LTD. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
