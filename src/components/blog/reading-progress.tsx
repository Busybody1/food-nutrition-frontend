'use client'

import { useEffect, useRef } from 'react'

/**
 * Fixed scroll-progress hairline for long-form articles. Purely decorative
 * (aria-hidden) and scroll-driven only — it never animates on its own, so it
 * is safe under prefers-reduced-motion. Sits at the very top edge of the
 * viewport, above the floating header pill (which starts 1rem down).
 */
export function ReadingProgress() {
  const barRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const bar = barRef.current
    if (!bar) return

    let frame = 0

    const update = () => {
      frame = 0
      const doc = document.documentElement
      const max = doc.scrollHeight - window.innerHeight
      const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
      bar.style.transform = `scaleX(${progress})`
    }

    const requestUpdate = () => {
      if (frame) return
      frame = window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate, { passive: true })
    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
    }
  }, [])

  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-40 h-0.5">
      <div
        ref={barRef}
        className="h-full w-full origin-left bg-gradient-to-r from-brand to-brand-strong"
        style={{ transform: 'scaleX(0)' }}
      />
    </div>
  )
}
