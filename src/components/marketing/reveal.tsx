'use client'

/**
 * Scroll-reveal primitives for marketing pages.
 *
 * No-JS / crawler / reduced-motion safe: content renders fully visible by
 * default. Only after mount — and only when IntersectionObserver exists and
 * the user has NOT requested reduced motion — do we set the pre-hidden state
 * ([data-reveal]) right before observing. When ~15% of the element enters the
 * viewport we set [data-revealed], which plays the fade-rise animation once.
 * The matching CSS lives in globals.css under
 * `@media (prefers-reduced-motion: no-preference)`.
 *
 * Usage (safe inside server components):
 *   <Reveal><MarketingSectionHeader ... /></Reveal>
 *   <Reveal as="section" delay={120} className="section-pad bg-white">...</Reveal>
 *   <RevealGroup className="grid gap-4 md:gap-5 md:grid-cols-3" itemClassName="h-full">
 *     <FeatureCard ... /> <FeatureCard ... /> <FeatureCard ... />
 *   </RevealGroup>
 */

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
  /** Rendered element, defaults to div. */
  as?: ElementType
  /** Animation delay in ms (used for manual staggering). */
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
    // Already revealed in a previous mount — leave it visible.
    if (el.hasAttribute('data-revealed')) return

    if (delay > 0) {
      el.style.setProperty('--reveal-delay', `${delay}ms`)
    }
    // Pre-hide only now that we know we can reveal.
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
      // Never leave content hidden after unmount/cleanup.
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
  /** Rendered wrapper element (put your grid/flex classes on className). */
  as?: ElementType
  className?: string
  /** Class applied to each generated item wrapper (e.g. "h-full min-w-0"). */
  itemClassName?: string
  /** Stagger step between children in ms. */
  step?: number
  /** Base delay before the first child, in ms. */
  delay?: number
  children?: ReactNode
}

/**
 * Staggers each direct child with an increasing reveal delay (default 80ms).
 * Each child is wrapped in its own observed element, so the wrapper itself
 * can be the grid/flex container.
 */
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
