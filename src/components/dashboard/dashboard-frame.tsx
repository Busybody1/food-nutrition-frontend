'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, ChevronRight, LogOut, Menu, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { SITE_NAME } from '@/lib/site'
import { cn } from '@/lib/utils/cn'
import { DASHBOARD_ICON_STROKE } from '@/components/dashboard/dashboard-shell'

export function DashboardFrame({
  brand,
  renderNav,
  footer,
  topbarLeft,
  topbarRight,
  children,
}: {
  brand: React.ReactNode
  renderNav: (onNavigate?: () => void) => React.ReactNode
  footer: React.ReactNode
  topbarLeft?: React.ReactNode
  topbarRight?: React.ReactNode
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!sidebarOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSidebarOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [sidebarOpen])

  const close = () => setSidebarOpen(false)

  return (
    <div className="dashboard-app">
      <div className={cn('fixed inset-0 z-50 lg:hidden', sidebarOpen ? 'block' : 'hidden')}>
        <div className="absolute inset-0 bg-dash-ink/30 backdrop-blur-[2px]" onClick={close} aria-hidden />
        <aside
          className="relative h-full w-[min(280px,86vw)] shadow-dash-pop animate-fade-in"
          aria-label="Navigation"
        >
          <SidebarContent
            brand={brand}
            nav={renderNav(close)}
            footer={footer}
            closeButton={
              <button
                type="button"
                onClick={close}
                aria-label="Close menu"
                className="rounded-lg p-1.5 text-dash-muted transition-colors hover:bg-dash-hover hover:text-dash-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
              >
                <X className="h-5 w-5" strokeWidth={DASHBOARD_ICON_STROKE} aria-hidden />
              </button>
            }
          />
        </aside>
      </div>

      <aside
        className="z-30 hidden border-r border-dash-border lg:fixed lg:inset-y-0 lg:flex lg:w-[240px]"
        aria-label="Navigation"
      >
        <SidebarContent brand={brand} nav={renderNav()} footer={footer} />
      </aside>

      <div className="flex min-h-screen min-w-0 flex-col lg:pl-[240px]">
        <header className="dashboard-topbar">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
              className="-ml-1.5 rounded-lg p-1.5 text-dash-muted transition-colors hover:bg-dash-hover hover:text-dash-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 lg:hidden"
            >
              <Menu className="h-5 w-5" strokeWidth={DASHBOARD_ICON_STROKE} aria-hidden />
            </button>
            {topbarLeft}
          </div>
          {topbarRight && <div className="flex shrink-0 items-center gap-2">{topbarRight}</div>}
        </header>
        <main id="main-content" className="relative z-0 min-w-0 flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}

function SidebarContent({
  brand,
  nav,
  footer,
  closeButton,
}: {
  brand: React.ReactNode
  nav: React.ReactNode
  footer: React.ReactNode
  closeButton?: React.ReactNode
}) {
  return (
    <div className="dashboard-sidebar">
      <div className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-dash-border px-4">
        {brand}
        {closeButton}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">{nav}</div>
      {footer}
    </div>
  )
}

export function SidebarBrand({ href, tag }: { href: string; tag?: string }) {
  return (
    <Link
      href={href}
      className="flex min-w-0 items-center gap-2.5 rounded-lg px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
    >
      <span className="relative block h-7 w-7 shrink-0">
        <Image
          src="/logos/busybody-logo.png"
          alt={`${SITE_NAME} logo`}
          fill
          sizes="28px"
          className="object-contain"
        />
      </span>
      <span className="truncate text-[15px] font-semibold tracking-[-0.01em] text-dash-ink">
        {SITE_NAME}
      </span>
      {tag && (
        <span className="inline-flex h-5 shrink-0 items-center rounded-md bg-dash-pill px-1.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-dash-body">
          {tag}
        </span>
      )}
    </Link>
  )
}

export function SidebarGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-5 last:mb-0">
      <p className="dashboard-sidebar-group-label">{label}</p>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  )
}

export function SidebarNavItem({
  icon: Icon,
  label,
  href,
  onClick,
  active,
  badge,
  nativeAnchor,
}: {
  icon: LucideIcon
  label: string
  href?: string
  onClick?: () => void
  active?: boolean
  badge?: number
  nativeAnchor?: boolean
}) {
  const className = cn('dashboard-nav-link', active && 'dashboard-nav-link-active')
  const content = (
    <>
      <Icon className="h-4 w-4 shrink-0" strokeWidth={DASHBOARD_ICON_STROKE} aria-hidden />
      <span className="truncate">{label}</span>
      {badge != null && badge > 0 ? (
        <span className="dashboard-count-badge" aria-label={`${badge} unread`}>
          {badge > 9 ? '9+' : badge}
        </span>
      ) : null}
    </>
  )

  if (!href) {
    return (
      <button type="button" onClick={onClick} className={cn(className, 'text-left')} aria-pressed={active}>
        {content}
      </button>
    )
  }
  if (nativeAnchor) {
    return (
      <a href={href} onClick={onClick} className={className}>
        {content}
      </a>
    )
  }
  return (
    <Link href={href} onClick={onClick} className={className} aria-current={active ? 'page' : undefined}>
      {content}
    </Link>
  )
}

export function SidebarUser({
  firstName,
  lastName,
  email,
  onLogout,
}: {
  firstName?: string
  lastName?: string
  email?: string
  onLogout: () => void
}) {
  const initials =
    [firstName?.[0], lastName?.[0]].filter(Boolean).join('').toUpperCase() ||
    email?.[0]?.toUpperCase() ||
    '?'
  const name = [firstName, lastName].filter(Boolean).join(' ')

  return (
    <div className="shrink-0 border-t border-dash-border p-3">
      <div className="flex items-center gap-3 rounded-xl px-1.5 py-1.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-dash-pill text-xs font-semibold text-dash-body">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium text-dash-ink">{name || email}</p>
          {name && email && <p className="truncate text-xs text-dash-muted">{email}</p>}
        </div>
        <button
          type="button"
          onClick={onLogout}
          title="Sign out"
          aria-label="Sign out"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-dash-muted transition-colors hover:bg-dash-hover hover:text-dash-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
        >
          <LogOut className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} aria-hidden />
        </button>
      </div>
    </div>
  )
}

export function TopbarBreadcrumb({ items }: { items: string[] }) {
  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      <ol className="flex min-w-0 items-center gap-1.5 text-[13px]">
        {items.map((item, index) => {
          const last = index === items.length - 1
          return (
            <li
              key={`${item}-${index}`}
              className={cn('flex min-w-0 items-center gap-1.5', !last && 'hidden md:flex')}
            >
              <span
                className={cn('truncate', last ? 'font-medium text-dash-ink' : 'text-dash-muted')}
                aria-current={last ? 'page' : undefined}
              >
                {item}
              </span>
              {!last && (
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-dash-dim" aria-hidden />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

const TOPBAR_BUTTON =
  'relative inline-flex h-9 items-center gap-1.5 rounded-[10px] border border-dash-border bg-white px-3 text-[13px] font-medium text-dash-body shadow-dash transition-colors hover:bg-dash-hover hover:text-dash-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40'

export function TopbarLink({
  href,
  icon: Icon,
  label,
  external,
}: {
  href: string
  icon: LucideIcon
  label: string
  external?: boolean
}) {
  return (
    <Link href={href} className={TOPBAR_BUTTON} title={label}>
      <Icon className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} aria-hidden />
      <span className="hidden sm:inline">{label}</span>
      {external && (
        <ArrowUpRight className="hidden h-3.5 w-3.5 text-dash-dim sm:block" aria-hidden />
      )}
    </Link>
  )
}

export function TopbarButton({
  icon: Icon,
  label,
  onClick,
  pressed,
  badge,
}: {
  icon: LucideIcon
  label: string
  onClick: () => void
  pressed?: boolean
  badge?: number
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={pressed}
      title={label}
      className={cn(TOPBAR_BUTTON, pressed && 'bg-dash-pill text-dash-ink')}
    >
      <Icon className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} aria-hidden />
      <span className="hidden sm:inline">{label}</span>
      {badge != null && badge > 0 ? (
        <span
          className="absolute -right-1.5 -top-1.5 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-dash-teal-strong px-1 text-[10px] font-semibold leading-none text-white ring-2 ring-white"
          aria-label={`${badge} unread`}
        >
          {badge > 9 ? '9+' : badge}
        </span>
      ) : null}
    </button>
  )
}
