'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { useAuth } from '@/lib/hooks/use-auth'
import { getDashboardPath, isDashboardPathActive } from '@/lib/auth/post-login-path'
import { Menu, X, LogOut, ChevronDown, LayoutDashboard } from 'lucide-react'
import { SITE_NAME, LOGO_ALT } from '@/lib/site'
import { cn } from '@/lib/utils/cn'

type NavLink = { href: string; label: string; description?: string; isNew?: boolean }

const primaryLinks: NavLink[] = [
  { href: '/docs', label: 'Docs' },
  { href: '/playground', label: 'Playground' },
  { href: '/solutions', label: 'Solutions' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/mcp', label: 'Calorie MCP', isNew: true },
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
  const [isScrolled, setIsScrolled] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()
  const dashboardHref = getDashboardPath(user)
  const dashboardActive = isDashboardPathActive(pathname, user)

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 4)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!isMenuOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isMenuOpen])

  const resourcesActive = resourceLinks.some(({ href }) => isNavActive(pathname, href))
  const docked = isScrolled || isMenuOpen

  const navLinkClass = (href: string) =>
    cn('site-header-nav-link', isNavActive(pathname, href) && 'site-header-nav-link--active')

  const menuLinkClass = (href: string) =>
    cn('site-header-menu-link', isNavActive(pathname, href) && 'site-header-menu-link--active')

  return (
    <header className="site-header-shell" data-docked={docked ? 'true' : 'false'}>
      <div className="site-header-bar">
        <div className="site-header-inner">
          <Link href="/" className="site-header-brand" {...navPrefetch} aria-label={`${SITE_NAME} home`}>
            <span className="site-header-logo-mark">
              <Image
                src="/logos/busybody-logo.png"
                alt={LOGO_ALT}
                fill
                sizes="32px"
                className="object-contain p-1.5"
                priority
              />
            </span>
            <span className="truncate max-w-[180px] xl:max-w-none text-[15px] font-semibold tracking-[-0.01em] text-mk-ink">
              {SITE_NAME}
            </span>
          </Link>

          <nav className="hidden lg:flex flex-1 items-center justify-center gap-0.5" aria-label="Main">
            {primaryLinks.map(({ href, label, isNew }) => (
              <Link
                key={href}
                href={href}
                className={navLinkClass(href)}
                aria-current={isNavActive(pathname, href) ? 'page' : undefined}
                {...navPrefetch}
              >
                {label}
                {isNew && <span className="site-header-new">New</span>}
              </Link>
            ))}

            <DropdownMenu.Root modal={false}>
              <DropdownMenu.Trigger asChild>
                <button
                  type="button"
                  className={cn(
                    'site-header-nav-link group cursor-pointer gap-1',
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
                <DropdownMenu.Content sideOffset={10} align="center" className="site-header-dropdown">
                  {resourceLinks.map(({ href, label, description }) => (
                    <DropdownMenu.Item key={href} asChild>
                      <Link href={href} className="site-header-dropdown-item" {...navPrefetch}>
                        <span
                          className={cn(
                            'text-sm font-medium',
                            isNavActive(pathname, href) ? 'text-brand-strong' : 'text-mk-ink'
                          )}
                        >
                          {label}
                        </span>
                        <span className="text-xs text-mk-muted">{description}</span>
                      </Link>
                    </DropdownMenu.Item>
                  ))}
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </nav>

          <div className="hidden lg:flex items-center gap-1.5 shrink-0 ml-auto">
            {isAuthenticated ? (
              <>
                <Link
                  href={dashboardHref}
                  className="btn-brand hit-44"
                  aria-current={dashboardActive ? 'page' : undefined}
                  {...navPrefetch}
                >
                  <LayoutDashboard className="h-4 w-4" aria-hidden />
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="site-header-icon-btn"
                  aria-label="Sign out"
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" aria-hidden />
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="site-header-nav-link" {...navPrefetch}>
                  Sign in
                </Link>
                <Link href="/auth/register" className="btn-brand hit-44" {...navPrefetch}>
                  Get API key
                </Link>
              </>
            )}
          </div>

          {!isAuthenticated && (
            <Link
              href="/auth/register"
              className="btn-brand hit-44 lg:hidden ml-auto shrink-0"
              {...navPrefetch}
              onClick={() => setIsMenuOpen(false)}
            >
              Get API key
            </Link>
          )}

          <button
            type="button"
            className={cn('site-header-icon-btn text-mk-ink lg:hidden', isAuthenticated && 'ml-auto')}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-nav"
          >
            {isMenuOpen ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <nav id="mobile-nav" className="site-header-menu animate-menu-in" aria-label="Mobile">
          <div className="space-y-0.5">
            {primaryLinks.map(({ href, label, isNew }) => (
              <Link
                key={href}
                href={href}
                {...navPrefetch}
                className={menuLinkClass(href)}
                aria-current={isNavActive(pathname, href) ? 'page' : undefined}
                onClick={() => setIsMenuOpen(false)}
              >
                {label}
                {isNew && <span className="site-header-new">New</span>}
              </Link>
            ))}
          </div>

          <p className="px-4 pb-1 pt-4 text-xs font-medium text-mk-muted">Resources</p>
          <div className="space-y-0.5">
            {resourceLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                {...navPrefetch}
                className={menuLinkClass(href)}
                aria-current={isNavActive(pathname, href) ? 'page' : undefined}
                onClick={() => setIsMenuOpen(false)}
              >
                {label}
              </Link>
            ))}
          </div>

          <div className="mt-2 flex flex-col gap-2 border-t border-mk-hair p-2 pt-3">
            {isAuthenticated ? (
              <>
                <Link
                  href={dashboardHref}
                  {...navPrefetch}
                  className="btn-brand hit-44 w-full"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <LayoutDashboard className="h-4 w-4" aria-hidden />
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    logout()
                    setIsMenuOpen(false)
                  }}
                  className="flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl text-sm font-medium text-mk-muted transition-colors hover:bg-mk-stage hover:text-mk-ink"
                >
                  <LogOut className="h-4 w-4" aria-hidden />
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  {...navPrefetch}
                  className="flex min-h-11 items-center justify-center rounded-xl text-sm font-medium text-mk-ink transition-colors hover:bg-mk-stage"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/register"
                  {...navPrefetch}
                  className="btn-brand hit-44 w-full"
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
