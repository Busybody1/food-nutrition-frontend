'use client'

import { useState, useEffect } from 'react'
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

export function DocsSidebar({ groups }: { groups: DocsNavGroup[] }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const pathname = usePathname()

  const query = searchQuery.trim().toLowerCase()
  const filteredGroups = groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.name.toLowerCase().includes(query)),
    }))
    .filter((group) => group.items.length > 0)

  useEffect(() => {
    if (!sidebarOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false)
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
              <Icon className="h-4 w-4 text-ink-dim shrink-0" aria-hidden />
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-dim">
                {group.title}
              </p>
            </div>
            <ul className="space-y-0.5 border-l border-surface-border pl-3 ml-1">
              {group.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    prefetch={false}
                    onClick={() => setSidebarOpen(false)}
                    aria-current={isActive(item.href) ? 'page' : undefined}
                    className={`docs-nav-link ${isActive(item.href) ? 'text-brand-strong font-semibold' : ''}`}
                  >
                    <span className="min-w-0">{item.name}</span>
                    <ChevronRight className="docs-nav-chevron lg:hidden" aria-hidden />
                  </Link>
                </li>
              ))}
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
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="docs-sidebar-fab"
          aria-label="Open docs menu"
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
        className={`docs-sidebar shrink-0 ${sidebarOpen ? 'docs-sidebar--open' : ''}`}
        aria-label="Documentation navigation"
      >
        <div className="docs-sidebar__header">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-strong">
              {SITE_NAME}
            </p>
            <p className="text-sm font-semibold text-ink truncate">Documentation</p>
          </div>
          <button
            type="button"
            className="docs-sidebar__close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close docs menu"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div className="docs-sidebar__scroll">
          <label className="relative block mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-dim" />
            <input
              type="search"
              placeholder="Search docs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-3 text-sm rounded-brand border border-surface-border bg-white text-ink placeholder:text-ink-dim focus:outline-none focus:ring-2 focus:ring-brand/30"
            />
          </label>
          {nav}
        </div>
      </aside>
    </>
  )
}
