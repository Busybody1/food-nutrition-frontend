'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, Menu, X, ChevronRight, Search, Zap, Database, GraduationCap } from 'lucide-react'
import { SITE_NAME } from '@/lib/site'

export type DocsNavItem = { name: string; href: string }
export type DocsNavGroup = { title: string; items: DocsNavItem[] }

const GROUP_ICONS: Record<string, typeof BookOpen> = {
  'Getting Started': BookOpen,
  Endpoints: Database,
  Guides: GraduationCap,
  Advanced: Zap,
}

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), input:not([disabled])'

export function DocsSidebar({ groups }: { groups: DocsNavGroup[] }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const pathname = usePathname()
  const asideRef = useRef<HTMLElement | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)
  const fabRef = useRef<HTMLButtonElement | null>(null)
  const wasOpenRef = useRef(false)

  const query = searchQuery.trim().toLowerCase()
  const filteredGroups = groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.name.toLowerCase().includes(query)),
    }))
    .filter((group) => group.items.length > 0)
  const resultCount = filteredGroups.reduce((count, group) => count + group.items.length, 0)

  useEffect(() => {
    if (!sidebarOpen) {
      // Restore focus to the FAB after the drawer closes (mobile only).
      if (wasOpenRef.current) {
        wasOpenRef.current = false
        fabRef.current?.focus()
      }
      return
    }
    wasOpenRef.current = true
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSidebarOpen(false)
        return
      }
      // Keep Tab focus inside the open drawer (dialog behavior).
      if (e.key !== 'Tab' || !asideRef.current) return
      const focusable = Array.from(
        asideRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement
      const inside = active instanceof HTMLElement && asideRef.current.contains(active)
      if (e.shiftKey) {
        if (!inside || active === first) {
          e.preventDefault()
          last.focus()
        }
      } else if (!inside || active === last) {
        e.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [sidebarOpen])

  const isActive = (href: string) => {
    const [hrefPath] = href.split('#')
    return hrefPath !== '' && hrefPath === pathname
  }

  const nav = (
    <nav className="space-y-6" aria-label="Documentation">
      {filteredGroups.map((group) => {
        const Icon = GROUP_ICONS[group.title] ?? BookOpen
        return (
          <div key={group.title}>
            <div className="flex items-center gap-2 mb-2">
              <Icon className="h-4 w-4 text-ink-muted shrink-0" aria-hidden />
              <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
                {group.title}
              </p>
            </div>
            <ul className="space-y-0.5 border-l border-surface-border pl-3 ml-1">
              {group.items.map((item) => {
                const active = isActive(item.href)
                return (
                  <li
                    key={item.href}
                    className={active ? '-ml-[13px] border-l-2 border-brand pl-[11px]' : ''}
                  >
                    <Link
                      href={item.href}
                      prefetch={false}
                      onClick={() => setSidebarOpen(false)}
                      aria-current={active ? 'page' : undefined}
                      className={`docs-nav-link focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 ${
                        active
                          ? 'bg-brand-muted font-semibold text-brand-strong hover:bg-brand-muted'
                          : ''
                      }`}
                    >
                      <span className="min-w-0">{item.name}</span>
                      <ChevronRight className="docs-nav-chevron lg:hidden" aria-hidden />
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        )
      })}
    </nav>
  )

  return (
    <>
      {!sidebarOpen && (
        <button
          ref={fabRef}
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="docs-sidebar-fab"
          aria-label="Open docs menu"
          aria-controls="docs-sidebar"
          aria-expanded={sidebarOpen}
        >
          <Menu className="w-5 h-5" aria-hidden />
        </button>
      )}

      {sidebarOpen && (
        <button
          type="button"
          className="docs-sidebar-backdrop"
          aria-label="Close docs menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        ref={asideRef}
        id="docs-sidebar"
        role={sidebarOpen ? 'dialog' : undefined}
        aria-modal={sidebarOpen ? true : undefined}
        className={`docs-sidebar shrink-0 ${sidebarOpen ? 'docs-sidebar--open' : ''}`}
        aria-label="Documentation navigation"
      >
        <div className="docs-sidebar__header">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-strong">
              {SITE_NAME}
            </p>
            <p className="text-sm font-semibold text-ink truncate">Documentation</p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            className="docs-sidebar__close focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close docs menu"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div className="docs-sidebar__scroll">
          <label className="relative block mb-6">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-dim"
              aria-hidden
            />
            <input
              type="search"
              placeholder="Search docs..."
              aria-label="Search docs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-3 text-sm rounded-brand border border-surface-border bg-white text-ink placeholder:text-ink-dim focus:outline-none focus:ring-2 focus:ring-brand/30"
            />
          </label>
          <p className="sr-only" role="status" aria-live="polite">
            {query ? `${resultCount} ${resultCount === 1 ? 'result' : 'results'}` : ''}
          </p>
          {nav}
        </div>
      </aside>
    </>
  )
}
