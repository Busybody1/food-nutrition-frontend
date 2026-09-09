'use client'

import { Children, useEffect, useRef, type ElementType, type ReactNode, type Ref } from 'react'

const OBSERVER_OPTIONS: IntersectionObserverInit = {
  threshold: 0.15,
  rootMargin: '0px 0px -8% 0px',
}

function prefersReducedMotion(): boolean {
  return (
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

interface RevealProps {

  as?: ElementType

  delay?: number
  className?: string
  children?: ReactNode
}

export function Reveal({ as, delay = 0, className, children }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') return
    if (prefersReducedMotion()) return

    if (el.hasAttribute('data-revealed')) return

    if (delay > 0) {
      el.style.setProperty('--reveal-delay', `${delay}ms`)
    }

    el.setAttribute('data-reveal', '')

    const observer = new IntersectionObserver((entries, obs) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          el.setAttribute('data-revealed', '')
          obs.disconnect()
        }
      }
    }, OBSERVER_OPTIONS)
    observer.observe(el)

    return () => {
      observer.disconnect()

      el.removeAttribute('data-reveal')
    }
  }, [delay])

  const Tag = (as ?? 'div') as 'div'
  return (
    <Tag ref={ref as Ref<HTMLDivElement>} className={className}>
      {children}
    </Tag>
  )
}

interface RevealGroupProps {

  as?: ElementType
  className?: string

  itemClassName?: string

  step?: number

  delay?: number
  children?: ReactNode
}

export function RevealGroup({
  as,
  className,
  itemClassName = 'min-w-0',
  step = 80,
  delay = 0,
  children,
}: RevealGroupProps) {
  const Tag = (as ?? 'div') as 'div'
  const items = Children.toArray(children)
  return (
    <Tag className={className}>
      {items.map((child, index) => (
        <Reveal key={index} delay={delay + Math.min(index, 6) * step} className={itemClassName}>
          {child}
        </Reveal>
      ))}
    </Tag>
  )
}
