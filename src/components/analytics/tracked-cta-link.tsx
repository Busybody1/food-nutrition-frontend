'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

/**
 * CTA link that reports clicks to GA4 (event: cta_click) with the source page,
 * so keyword → landing page → signup attribution is possible without prop threading.
 */
export function TrackedCtaLink({
  href,
  className,
  children,
  eventLabel,
}: {
  href: string
  className?: string
  children: React.ReactNode
  eventLabel?: string
}) {
  const pathname = usePathname()
  return (
    <Link
      href={href}
      prefetch={false}
      className={className}
      onClick={() => {
        window.gtag?.('event', 'cta_click', {
          source_path: pathname ?? '',
          target: href,
          label: eventLabel ?? '',
        })
      }}
    >
      {children}
    </Link>
  )
}
