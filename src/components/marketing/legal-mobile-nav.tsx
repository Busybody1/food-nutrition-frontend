'use client'

import { useEffect, useState } from 'react'
import { List, X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { smoothScrollToId, useActiveSection, type LegalTocItem } from './legal-toc'

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
          'fixed bottom-6 left-4 z-40 inline-flex h-11 items-center gap-2 rounded-full px-4',
          'border border-mk-line bg-white text-sm font-medium text-mk-ink shadow-float',
          'transition-colors duration-200 hover:bg-mk-stage',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2'
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
            className="absolute inset-0 h-full w-full cursor-default bg-mk-ink/30"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="On this page"
            className="absolute inset-x-0 bottom-0 flex max-h-[72vh] flex-col rounded-t-[20px] border-t border-mk-hair bg-white shadow-float"
          >
            <div className="flex items-center justify-between border-b border-mk-hair px-5 py-3.5">
              <span className="text-sm font-medium text-mk-ink">
                On this page
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="hit-44 -mr-1.5 inline-flex h-10 w-10 items-center justify-center rounded-full text-mk-muted transition-colors hover:bg-mk-stage hover:text-mk-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
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
                        'block rounded-xl px-3 py-2.5 text-[15px] leading-snug transition-colors',
                        active
                          ? 'bg-mk-stage font-medium text-mk-ink'
                          : 'text-mk-muted hover:bg-mk-stage hover:text-mk-ink'
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
