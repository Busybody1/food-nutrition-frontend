'use client'

import { useEffect, useState } from 'react'

export type DocsTocItem = { id: string; text: string }

const TOC_LINK_BASE =
  '-ml-px block rounded-r-lg border-l-2 py-1.5 pl-3 pr-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand'

export function DocsToc({ items }: { items: DocsTocItem[] }) {
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null)
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id)
        }
      },
      { rootMargin: '-96px 0px -70% 0px', threshold: 0 }
    )
    headings.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [items])

  if (items.length === 0) return null

  return (
    <nav aria-label="On this page" className="text-sm">
      <ul className="space-y-0.5 border-l border-mk-hair">
        {items.map((item) => {
          const active = activeId === item.id
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={active ? 'true' : undefined}
                className={
                  active
                    ? `${TOC_LINK_BASE} border-mk-ink bg-mk-stage font-medium text-mk-ink`
                    : `${TOC_LINK_BASE} border-transparent text-mk-muted hover:border-mk-line hover:text-mk-ink`
                }
              >
                {item.text}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
