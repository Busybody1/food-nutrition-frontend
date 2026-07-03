'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils/cn'

export type LegalTocItem = { id: string; title: string }

/**
 * Sticky "on this page" rail for the legal documents (lg+ only).
 * Renders plain anchor links server-side (works without JS); a lightweight
 * IntersectionObserver scroll-spy highlights the section currently in the
 * reading band. Link text is the existing section titles, verbatim.
 */
export function LegalToc({
  items,
  className,
}: {
  items: LegalTocItem[]
  className?: string
}) {
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    const sections = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null)
    if (sections.length === 0) return

    const inView = new Set<string>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) inView.add(entry.target.id)
          else inView.delete(entry.target.id)
        }
        const current = items.find((item) => inView.has(item.id))
        if (current) setActiveId(current.id)
      },
      // Band just below the floating header down to the upper half of the
      // viewport — long sections stay "active" while being read.
      { rootMargin: '-96px 0px -55% 0px' }
    )
    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [items])

  if (items.length === 0) return null

  return (
    <nav aria-label="On this page" className={className}>
      <ul className="space-y-0.5 border-l border-surface-border/80">
        {items.map((item) => {
          const active = activeId === item.id
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={active ? 'true' : undefined}
                className={cn(
                  '-ml-px block cursor-pointer rounded-r border-l-2 py-1.5 pl-4 pr-2 text-sm leading-snug transition-colors duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2',
                  active
                    ? 'border-brand text-brand-strong'
                    : 'border-transparent text-ink-muted hover:border-brand/30 hover:text-brand-strong'
                )}
              >
                {item.title}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
