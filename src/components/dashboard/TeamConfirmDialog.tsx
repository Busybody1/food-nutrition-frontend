'use client'

import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DASHBOARD_ICON_STROKE } from '@/components/dashboard/dashboard-shell'

export function TeamConfirmDialog({
  open,
  title,
  description,
  warning,
  confirmLabel,
  busyLabel,
  busy,
  error,
  onOpenChange,
  onConfirm,
}: {
  open: boolean
  title: string
  description?: string
  warning: React.ReactNode
  confirmLabel: string
  busyLabel: string
  busy: boolean
  error?: string
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={(next) => !busy && onOpenChange(next)}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="flex gap-2.5 rounded-xl border border-dash-negative/20 bg-dash-negative-soft px-4 py-3 text-[13px] leading-5 text-dash-negative">
          <AlertTriangle
            className="mt-0.5 h-4 w-4 shrink-0"
            strokeWidth={DASHBOARD_ICON_STROKE}
            aria-hidden
          />
          <div>{warning}</div>
        </div>
        {error && (
          <p role="alert" className="text-[13px] leading-5 text-dash-negative">
            {error}
          </p>
        )}
        <DialogFooter className="gap-2 sm:space-x-0">
          <Button
            variant="outline"
            size="sm"
            className="h-9"
            onClick={() => onOpenChange(false)}
            disabled={busy}
          >
            Cancel
          </Button>
          <Button variant="destructive" size="sm" className="h-9" onClick={onConfirm} disabled={busy}>
            {busy ? busyLabel : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
