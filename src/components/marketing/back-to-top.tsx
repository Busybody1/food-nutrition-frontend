'use client'

import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

/**
 * Floating "back to top" button. Hidden until the reader scrolls down, then
 * returns them to the top (the page nav / legal pills) in one tap. Reduced-
 * motion aware. Purely progressive — no-JS readers simply never see it.
 */
export function BackToTop({ threshold = 500 }: { threshold?: number }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > threshold)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])

  const toTop = () => {
    const reduce =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
  }

  return (
    <button
      type="button"
      onClick={toTop}
      aria-label="Back to top"
      tabIndex={visible ? 0 : -1}
      className={cn(
        'fixed bottom-6 right-6 z-40 inline-flex h-11 w-11 items-center justify-center rounded-full',
        'border border-brand/30 bg-surface-elevated/90 text-brand-strong shadow-lg backdrop-blur',
        'transition-all duration-200 hover:border-brand/50 hover:bg-brand-muted',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2',
        visible ? 'opacity-100 translate-y-0' : 'pointer-events-none translate-y-3 opacity-0'
      )}
    >
      <ArrowUp className="h-5 w-5" aria-hidden />
    </button>
  )
}
