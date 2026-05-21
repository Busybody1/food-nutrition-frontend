'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useAuth } from '@/lib/hooks/use-auth'
import { Menu, X, User, LogOut } from 'lucide-react'
import { SITE_NAME } from '@/lib/site'
import { cn } from '@/lib/utils/cn'

const navLinks = [
  { href: '/docs', label: 'Documentation' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
]

export function Header() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isAuthenticated, logout } = useAuth()

  const linkClass = (href: string) =>
    cn(
      'text-sm font-medium transition-colors relative py-1',
      pathname === href || (href !== '/' && pathname?.startsWith(href))
        ? 'text-brand-strong'
        : 'text-ink-muted hover:text-ink'
    )

  return (
    <header className="sticky top-0 z-50 w-full border-b border-surface-border/80 bg-white/85 backdrop-blur-lg">
      <div className="container-narrow">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <Image
              src="/logos/busybody-logo.png"
              alt={`${SITE_NAME} logo`}
              width={32}
              height={32}
              className="h-8 w-8"
              priority
            />
            <span className="text-base font-semibold text-ink tracking-tight">{SITE_NAME}</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8" aria-label="Main">
            {navLinks.map(({ href, label }) => (
              <Link key={href} href={href} className={linkClass(href)}>
                {label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard" className="btn-brand-outline text-sm h-9 px-4 gap-2">
                  <User className="h-4 w-4" />
                  Dashboard
                </Link>
                <button type="button" onClick={logout} className="text-sm text-ink-muted hover:text-ink px-2">
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="text-sm font-medium text-ink-muted hover:text-ink px-3">
                  Sign in
                </Link>
                <Link href="/auth/register" className="btn-brand text-sm h-9 px-5">
                  Get API key
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            className="md:hidden text-ink p-2 rounded-brand hover:bg-surface-elevated"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {isMenuOpen && (
          <nav
            className="md:hidden py-4 border-t border-surface-border/80 space-y-1 animate-fade-in"
            aria-label="Mobile"
          >
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'block px-3 py-2.5 rounded-brand text-sm font-medium',
                  pathname === href ? 'bg-brand-muted text-brand-strong' : 'text-ink-muted hover:bg-surface-elevated'
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                {label}
              </Link>
            ))}
            <div className="pt-3 mt-2 border-t border-surface-border/60 flex flex-col gap-2 px-1">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/dashboard"
                    className="btn-brand text-sm h-10 justify-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={() => { logout(); setIsMenuOpen(false) }}
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
                    className="block text-center py-2.5 text-sm text-ink-muted"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/auth/register"
                    className="btn-brand text-sm h-10 justify-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Get API key
                  </Link>
                </>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
