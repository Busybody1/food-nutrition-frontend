'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useAuth } from '@/lib/hooks/use-auth'
import { Menu, X, LogOut } from 'lucide-react'
import { SITE_NAME, LOGO_ALT } from '@/lib/site'
import { cn } from '@/lib/utils/cn'

type NavLink = { href: string; label: string; exact?: boolean }

const navLinks: NavLink[] = [
  { href: '/', label: 'Home', exact: true },
  { href: '/pricing', label: 'Pricing' },
  { href: '/docs', label: 'Docs' },
  { href: '/faq', label: 'FAQ' },
]

function isNavActive(pathname: string | null, href: string, exact?: boolean) {
  if (!pathname) return false
  if (exact) return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

const HERO_BACKGROUND_PATHS = ['/', '/pricing', '/faq', '/contact'] as const

function hasImageHero(pathname: string | null) {
  return pathname != null && HERO_BACKGROUND_PATHS.some((p) => pathname === p)
}

export function Header() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isAuthenticated, logout } = useAuth()
  const overImageHero = hasImageHero(pathname)

  const navLinkClass = (href: string, exact?: boolean) =>
    cn(
      'site-header-nav-link',
      isNavActive(pathname, href, exact) && 'site-header-nav-link--active'
    )

  return (
    <header className="site-header-shell">
      <div className={cn('site-header-bar', overImageHero && 'site-header-bar--hero')}>
        <Link href="/" className="site-header-brand">
          <span className="site-header-logo-mark">
            <Image
              src="/logos/busybody-logo.png"
              alt={LOGO_ALT}
              width={28}
              height={28}
              className="h-7 w-7 object-contain"
              priority
            />
          </span>
          <span className="truncate text-sm font-semibold text-ink tracking-tight sm:text-base">
            {SITE_NAME}
          </span>
        </Link>

        <nav className="hidden md:flex flex-1 items-center justify-center gap-0.5" aria-label="Main">
          {navLinks.map(({ href, label, exact }) => (
            <Link key={href} href={href} className={navLinkClass(href, exact)}>
              {label}
            </Link>
          ))}
          {isAuthenticated && (
            <Link href="/dashboard" className={navLinkClass('/dashboard')}>
              Dashboard
            </Link>
          )}
        </nav>

        <div className="hidden md:flex items-center gap-2 shrink-0 ml-auto">
          {isAuthenticated ? (
            <button
              type="button"
              onClick={logout}
              className="text-sm font-medium text-ink-muted hover:text-ink px-3"
            >
              Sign out
            </button>
          ) : (
            <>
              <Link href="/auth/login" className="text-sm font-medium text-ink-muted hover:text-ink px-3">
                Sign in
              </Link>
              <Link href="/auth/register" className="site-header-cta">
                Get API key
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="md:hidden ml-auto text-ink p-2 rounded-full hover:bg-surface-elevated"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {isMenuOpen && (
        <nav
          className="pointer-events-auto mx-auto mt-2 max-w-5xl rounded-2xl border border-white/70 bg-white/90 p-3 shadow-[0_8px_32px_rgba(15,23,42,0.1)] backdrop-blur-xl md:hidden space-y-1 animate-fade-in"
          aria-label="Mobile"
        >
          {navLinks.map(({ href, label, exact }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'block rounded-xl px-4 py-2.5 text-sm font-medium',
                isNavActive(pathname, href, exact)
                  ? 'bg-surface-elevated text-ink'
                  : 'text-ink-muted hover:bg-surface-elevated/80'
              )}
              onClick={() => setIsMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
          {isAuthenticated && (
            <Link
              href="/dashboard"
              className={cn(
                'block rounded-xl px-4 py-2.5 text-sm font-medium',
                isNavActive(pathname, '/dashboard')
                  ? 'bg-surface-elevated text-ink'
                  : 'text-ink-muted hover:bg-surface-elevated/80'
              )}
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </Link>
          )}
          <div className="pt-2 mt-1 border-t border-surface-border/50 flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
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
                  className="block text-center py-2.5 text-sm font-medium text-ink-muted"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/register"
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
