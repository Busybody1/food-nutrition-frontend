'use client'

import { useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { CALENDLY_ENTERPRISE_URL, calendlyEmbedSrc } from '@/lib/calendly'
import { cn } from '@/lib/utils/cn'

export function CalendlyInlineEmbed({
  className,
  iframeClassName,
}: {
  className?: string
  iframeClassName?: string
}) {
  const [isLoaded, setIsLoaded] = useState(false)

  return (
    <div className={cn('w-full', className)}>
      <div className="relative w-full overflow-hidden rounded-brand bg-white">
        {!isLoaded && (
          <div
            className="absolute inset-0 animate-pulse bg-surface-elevated"
            aria-hidden
          />
        )}
        <iframe
          src={calendlyEmbedSrc()}
          title="Schedule a 30-minute Enterprise call"
          className={cn('relative z-10 h-[700px] w-full border-0', iframeClassName)}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
        />
      </div>
      <p className="mt-3 text-center text-xs text-ink-muted">
        Having trouble loading the calendar?{' '}
        <a
          href={CALENDLY_ENTERPRISE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-medium text-brand-strong underline decoration-brand/40 underline-offset-2 hover:decoration-brand-strong"
        >
          Open Calendly in a new tab
          <ExternalLink className="h-3 w-3" aria-hidden />
        </a>
      </p>
    </div>
  )
}
