'use client'

import { useEffect, useState } from 'react'
import { List, X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { smoothScrollToId, useActiveSection, type LegalTocItem } from './legal-toc'

/**
 * Mobile section navigation for the legal documents (the sticky desktop rail is
 * lg+ only). A floating "Contents" button opens a bottom sheet listing every
 * section; tapping one smooth-scrolls to it and closes the sheet, so readers
 * can jump anywhere without scrolling the whole document. The currently-read
 * section is highlighted via the shared scroll-spy hook.
 */
export function LegalMobileNav({ items }: { items: LegalTocItem[] }) {
  const [open, setOpen] = useState(false)
  const activeId = useActiveSection(items)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  if (items.length === 0) return null

  const handleSelect = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    setOpen(false)
    // Let the sheet unmount first, then scroll.
    requestAnimationFrame(() => smoothScrollToId(id))
  }

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open contents"
        aria-expanded={open}
        className={cn(
          'fixed bottom-6 left-6 z-40 inline-flex h-11 items-center gap-2 rounded-full px-4',
          'border border-brand/30 bg-surface-elevated/90 text-sm font-medium text-brand-strong shadow-lg backdrop-blur',
          'transition-colors duration-200 hover:border-brand/50 hover:bg-brand-muted',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2'
        )}
      >
        <List className="h-4 w-4" aria-hidden />
        Contents
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close contents"
            onClick={() => setOpen(false)}
            className="absolute inset-0 h-full w-full cursor-default bg-ink/40 backdrop-blur-sm"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="On this page"
            className="absolute inset-x-0 bottom-0 flex max-h-[72vh] flex-col rounded-t-2xl border-t border-surface-border bg-surface-elevated shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-surface-border/60 px-5 py-3.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                On this page
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="-mr-1.5 inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <ul className="min-h-0 flex-1 space-y-0.5 overflow-y-auto p-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))]">
              {items.map((item) => {
                const active = item.id === activeId
                return (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      onClick={handleSelect(item.id)}
                      aria-current={active ? 'true' : undefined}
                      className={cn(
                        'block rounded-lg px-3 py-2.5 text-[15px] leading-snug transition-colors',
                        active
                          ? 'bg-brand-muted font-medium text-brand-strong'
                          : 'text-ink-muted hover:bg-surface hover:text-ink'
                      )}
                    >
                      {item.title}
                    </a>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
