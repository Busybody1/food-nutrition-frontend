'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { useAuth } from '@/lib/hooks/use-auth'
import { getDashboardPath, isDashboardPathActive } from '@/lib/auth/post-login-path'
import { Menu, X, LogOut, ChevronDown, LayoutDashboard } from 'lucide-react'
import { SITE_NAME, LOGO_ALT } from '@/lib/site'
import { cn } from '@/lib/utils/cn'

type NavLink = { href: string; label: string; description?: string }

const primaryLinks: NavLink[] = [
  { href: '/docs', label: 'Docs' },
  { href: '/playground', label: 'Playground' },
  { href: '/solutions', label: 'Solutions' },
  { href: '/pricing', label: 'Pricing' },
]

const resourceLinks: NavLink[] = [
  { href: '/blog', label: 'Blog', description: 'Guides and tutorials' },
  { href: '/faq', label: 'FAQ', description: 'Common questions, answered' },
  { href: '/compare', label: 'Compare', description: 'How we stack up against other APIs' },
  { href: '/changelog', label: 'Changelog', description: 'Latest product updates' },
  { href: '/api-status', label: 'API Status', description: 'Uptime and service health' },
]

function isNavActive(pathname: string | null, href: string) {
  if (!pathname) return false
  return pathname === href || pathname.startsWith(`${href}/`)
}

const navPrefetch = { prefetch: false } as const

export function Header() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()
  const dashboardHref = getDashboardPath(user)
  const dashboardActive = isDashboardPathActive(pathname, user)

  const resourcesActive = resourceLinks.some(({ href }) => isNavActive(pathname, href))

  const navLinkClass = (href: string) =>
    cn(
      'site-header-nav-link',
      isNavActive(pathname, href) && 'site-header-nav-link--active'
    )

  return (
    <header className="site-header-shell">
      <div className="site-header-bar site-header-bar--hero">
        <Link href="/" className="site-header-brand" {...navPrefetch} aria-label={`${SITE_NAME} home`}>
          <span className="site-header-logo-mark">
            <Image
              src="/logos/busybody-logo.png"
              alt={LOGO_ALT}
              fill
              sizes="40px"
              className="object-contain p-2"
              priority
            />
          </span>
          <span className="truncate max-w-[200px] xl:max-w-none text-sm font-semibold text-ink tracking-tight sm:text-base">
            {SITE_NAME}
          </span>
        </Link>

        <nav className="hidden lg:flex flex-1 items-center justify-center gap-1" aria-label="Main">
          {primaryLinks.map(({ href, label }) => (
            <Link key={href} href={href} className={navLinkClass(href)} {...navPrefetch}>
              {label}
            </Link>
          ))}

          <DropdownMenu.Root modal={false}>
            <DropdownMenu.Trigger asChild>
              <button
                type="button"
                className={cn(
                  'site-header-nav-link group flex items-center gap-1',
                  resourcesActive && 'site-header-nav-link--active'
                )}
              >
                Resources
                <ChevronDown
                  className="h-3.5 w-3.5 opacity-60 transition-transform duration-200 group-data-[state=open]:rotate-180"
                  aria-hidden
                />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                sideOffset={14}
                align="center"
                className="site-header-dropdown"
              >
                {resourceLinks.map(({ href, label, description }) => (
                  <DropdownMenu.Item key={href} asChild>
                    <Link href={href} className="site-header-dropdown-item" {...navPrefetch}>
                      <span
                        className={cn(
                          'text-sm font-medium',
                          isNavActive(pathname, href) ? 'text-brand-strong' : 'text-ink'
                        )}
                      >
                        {label}
                      </span>
                      <span className="text-xs text-ink-dim">{description}</span>
                    </Link>
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </nav>

        <div className="hidden lg:flex items-center gap-2 shrink-0 ml-auto">
          <span className="h-6 w-px bg-surface-border/70" aria-hidden />
          {isAuthenticated ? (
            <>
              <Link
                href={dashboardHref}
                className={cn('site-header-cta gap-2', dashboardActive && 'ring-2 ring-brand/25')}
                {...navPrefetch}
              >
                <LayoutDashboard className="h-4 w-4" aria-hidden />
                Dashboard
              </Link>
              <button
                type="button"
                onClick={logout}
                className="flex h-9 w-9 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-surface-elevated hover:text-ink"
                aria-label="Sign out"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" aria-hidden />
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="rounded-full px-3.5 py-1.5 text-sm font-medium text-ink-muted transition-colors hover:text-ink"
                {...navPrefetch}
              >
                Sign in
              </Link>
              <Link href="/auth/register" className="site-header-cta" {...navPrefetch}>
                Get API key
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="lg:hidden ml-auto text-ink p-2 rounded-full hover:bg-surface-elevated"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {isMenuOpen && (
        <nav
          className="pointer-events-auto mx-auto mt-2 max-w-6xl rounded-2xl border border-white/70 bg-white/90 p-3 shadow-[0_8px_32px_rgba(15,23,42,0.1)] backdrop-blur-xl lg:hidden space-y-1 animate-fade-in"
          aria-label="Mobile"
        >
          {primaryLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              {...navPrefetch}
              className={cn(
                'block rounded-xl px-4 py-2.5 text-sm font-medium',
                isNavActive(pathname, href)
                  ? 'bg-surface-elevated text-ink'
                  : 'text-ink-muted hover:bg-surface-elevated/80'
              )}
              onClick={() => setIsMenuOpen(false)}
            >
              {label}
            </Link>
          ))}

          <p className="px-4 pt-3 pb-1 text-xs font-semibold uppercase tracking-wider text-ink-dim">
            Resources
          </p>
          {resourceLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              {...navPrefetch}
              className={cn(
                'block rounded-xl px-4 py-2.5 text-sm font-medium',
                isNavActive(pathname, href)
                  ? 'bg-surface-elevated text-ink'
                  : 'text-ink-muted hover:bg-surface-elevated/80'
              )}
              onClick={() => setIsMenuOpen(false)}
            >
              {label}
            </Link>
          ))}

          <div className="pt-2 mt-1 border-t border-surface-border/50 flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <Link
                  href={dashboardHref}
                  {...navPrefetch}
                  className="site-header-cta h-10 justify-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    logout()
                    setIsMenuOpen(false)
                  }}
                  className="flex items-center justify-center gap-2 text-sm text-ink-muted py-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  {...navPrefetch}
                  className="block text-center py-2.5 text-sm font-medium text-ink-muted"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/register"
                  {...navPrefetch}
                  className="site-header-cta h-10 justify-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Get API key
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}
