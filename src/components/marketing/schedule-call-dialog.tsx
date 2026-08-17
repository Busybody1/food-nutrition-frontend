'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CalendlyInlineEmbed } from '@/components/marketing/calendly-embed'
import { CALENDLY_ENTERPRISE_URL } from '@/lib/calendly'

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

export function ScheduleCallDialog({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const pathname = usePathname()

  useEffect(() => {
    if (!isOpen) return
    window.gtag?.('event', 'cta_click', {
      source_path: pathname ?? '',
      target: CALENDLY_ENTERPRISE_URL,
      label: 'Schedule Enterprise call',
    })
  }, [isOpen, pathname])

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent className="max-h-[92dvh] w-[calc(100%-1rem)] max-w-2xl gap-0 overflow-y-auto p-0 sm:rounded-brand">
        <DialogHeader className="px-6 pb-2 pt-6 pr-12">
          <DialogTitle>Schedule an Enterprise call</DialogTitle>
          <DialogDescription>
            Pick a 30-minute slot. We&apos;ll cover custom volume, image-to-calorie API access, and
            credits-based usage.
          </DialogDescription>
        </DialogHeader>
        {isOpen ? (
          <div className="px-2 pb-4 sm:px-4">
            <CalendlyInlineEmbed iframeClassName="h-[min(700px,68dvh)]" />
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
