'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

function ResetPasswordDialogBody({
  email,
  busy,
  onCancel,
  onConfirm,
}: {
  email: string
  busy: boolean
  onCancel: () => void
  onConfirm: () => void
}) {
  const [typed, setTyped] = useState('')
  const matches = typed.trim().toLowerCase() === email.trim().toLowerCase()

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>Reset this password?</DialogTitle>
      </DialogHeader>
      <div className="space-y-3 text-sm text-ink-muted">
        <p>
          This replaces the current password for{' '}
          <span className="font-medium text-ink">{email}</span> with a temporary password
          emailed to that address. They can change it after signing in.
        </p>
        <p>Type the account email to confirm.</p>
        <Input
          autoComplete="off"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          placeholder={email}
          disabled={busy}
          aria-label="Type the account email to confirm password reset"
        />
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
        <Button onClick={onConfirm} disabled={busy || !matches}>
          {busy ? 'Sending…' : 'Reset and email password'}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}

export function ResetUserPasswordDialog({
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
  return (
    <Dialog open={open} onOpenChange={(next) => !busy && onOpenChange(next)}>
      <ResetPasswordDialogBody
        key={open ? email : 'closed'}
        email={email}
        busy={busy}
        onCancel={() => onOpenChange(false)}
        onConfirm={onConfirm}
      />
    </Dialog>
  )
}
