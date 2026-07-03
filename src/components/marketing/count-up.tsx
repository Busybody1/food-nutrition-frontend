'use client'

/**
 * Animated stat number for marketing pages.
 *
 * Renders the ORIGINAL string (byte-identical) by default, so SSR output,
 * crawlers, no-JS users and reduced-motion users all see the exact copy.
 * When the element first intersects (and motion is allowed), the leading
 * number inside the string counts up 0 → value over ~1.2s with ease-out,
 * then settles on the exact original string again.
 *
 * Usage (safe inside server components):
 *   <CountUp value="4.9/5" />
 *   <CountUp value="120ms" className="font-display text-3xl" />
 *   <CountUp value="1M+" />          // animates the "1"
 *   <CountUp value="99.99% uptime" />
 */

import { useEffect, useRef, useState } from 'react'

const NUMBER_PATTERN = /(\d[\d,]*(?:\.\d+)?)/

interface CountUpProps {
  /** The existing stat string, rendered verbatim (e.g. "4.9/5", "120ms"). */
  value: string
  className?: string
  /** Animation duration in ms. */
  duration?: number
}

export function CountUp({ value, className, duration = 1200 }: CountUpProps) {
  const ref = useRef<HTMLSpanElement | null>(null)
  const [display, setDisplay] = useState(value)

  // Reset to the verbatim string whenever the prop changes (render-time
  // "derived state" pattern, avoids a setState call inside the effect).
  const [prevValue, setPrevValue] = useState(value)
  if (prevValue !== value) {
    setPrevValue(value)
    setDisplay(value)
  }

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') return
    if (
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return
    }

    const match = value.match(NUMBER_PATTERN)
    if (!match || match.index === undefined) return // unparsable → static string

    const numberText = match[1]
    const prefix = value.slice(0, match.index)
    const suffix = value.slice(match.index + numberText.length)
    const target = Number.parseFloat(numberText.replace(/,/g, ''))
    if (!Number.isFinite(target)) return

    const decimals = numberText.includes('.') ? numberText.split('.')[1].length : 0
    const grouped = numberText.includes(',')

    const format = (n: number): string => {
      const fixed = n.toFixed(decimals)
      if (!grouped) return fixed
      const [int, dec] = fixed.split('.')
      const intGrouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      return dec ? `${intGrouped}.${dec}` : intGrouped
    }

    let rafId = 0

    const observer = new IntersectionObserver((entries, obs) => {
      if (!entries.some((entry) => entry.isIntersecting)) return
      obs.disconnect()

      const startedAt = performance.now()
      const tick = (now: number) => {
        const progress = Math.min(1, (now - startedAt) / duration)
        const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
        if (progress < 1) {
          setDisplay(prefix + format(target * eased) + suffix)
          rafId = requestAnimationFrame(tick)
        } else {
          // Guarantee the final text equals the original string exactly.
          setDisplay(value)
        }
      }
      rafId = requestAnimationFrame(tick)
    }, { threshold: 0.4 })

    observer.observe(el)

    return () => {
      observer.disconnect()
      cancelAnimationFrame(rafId)
    }
  }, [value, duration])

  return (
    <span ref={ref} className={className ? `tabular-nums ${className}` : 'tabular-nums'}>
      {display}
    </span>
  )
}
