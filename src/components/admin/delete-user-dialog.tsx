'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

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
    if (!open) setTyped('')
  }, [open])

  return (
    <Dialog open={open} onOpenChange={(next) => !busy && onOpenChange(next)}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete this account?</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm text-ink-muted">
          <p>
            This permanently removes{' '}
            <span className="font-medium text-ink">{email}</span>, their API keys, and usage
            history. The action is written to the audit log (Recent actions).
          </p>
          <p>Type the account email to confirm.</p>
          <Input
            autoComplete="off"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder={email}
            disabled={busy}
            aria-label="Type the account email to confirm deletion"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button
            variant="destructive"
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
