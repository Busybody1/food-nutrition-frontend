'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'

const ApiPlayground = dynamic(
  () => import('@/components/marketing/api-playground').then((m) => m.ApiPlayground),
  { ssr: false }
)

export function LazyApiPlayground() {
  const rootRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = rootRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '240px 0px' }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={rootRef} className="min-h-[280px]">
      {visible ? (
        <ApiPlayground />
      ) : (
        <div className="marketing-card h-[280px] animate-pulse rounded-brand" aria-hidden />
      )}
    </div>
  )
}
