'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DASHBOARD_ICON_STROKE } from '@/components/dashboard/dashboard-shell'

export function DeleteUserDialog({
  open,
  email,
  busy,
  onOpenChange,
  onConfirm,
}: {
  open: boolean
  email: string
  busy: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}) {
  const [typed, setTyped] = useState('')
  const matches = typed.trim().toLowerCase() === email.trim().toLowerCase()

  useEffect(() => {
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    if (!open) setTyped('')
  }, [open])

  return (
    <Dialog open={open} onOpenChange={(next) => !busy && onOpenChange(next)}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete this account?</DialogTitle>
          <DialogDescription>
            The action is written to the audit log (Recent actions).
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2.5 rounded-xl border border-dash-negative/20 bg-dash-negative-soft px-4 py-3 text-[13px] leading-5 text-dash-negative">
          <AlertTriangle
            className="mt-0.5 h-4 w-4 shrink-0"
            strokeWidth={DASHBOARD_ICON_STROKE}
            aria-hidden
          />
          <p>
            This permanently removes <span className="font-semibold">{email}</span>, their API
            keys, and usage history.
          </p>
        </div>
        <div>
          <p className="dashboard-field-label">Type the account email to confirm.</p>
          <Input
            autoComplete="off"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder={email}
            disabled={busy}
            aria-label="Type the account email to confirm deletion"
          />
        </div>
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
          <Button
            variant="destructive"
            size="sm"
            className="h-9"
            onClick={onConfirm}
            disabled={busy || !matches}
          >
            {busy ? 'Deleting…' : 'Delete permanently'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
