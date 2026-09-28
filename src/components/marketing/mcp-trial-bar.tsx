'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export function McpTrialBar() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 520)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!visible) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-surface-border bg-white/95 p-3 backdrop-blur lg:hidden">
      <Link href="/mcp/pricing" className="btn-brand h-12 w-full text-base">
        Start 7-day trial
      </Link>
    </div>
  )
}
