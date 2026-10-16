'use client'

import { useState } from 'react'
import { KeyRound } from 'lucide-react'
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
        <DialogDescription>They can change it after signing in.</DialogDescription>
      </DialogHeader>
      <div className="flex gap-2.5 rounded-xl border border-dash-warning/20 bg-dash-warning-soft px-4 py-3 text-[13px] leading-5 text-dash-warning">
        <KeyRound
          className="mt-0.5 h-4 w-4 shrink-0"
          strokeWidth={DASHBOARD_ICON_STROKE}
          aria-hidden
        />
        <p>
          This replaces the current password for <span className="font-semibold">{email}</span>{' '}
          with a temporary password emailed to that address.
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
          aria-label="Type the account email to confirm password reset"
        />
      </div>
      <DialogFooter className="gap-2 sm:space-x-0">
        <Button variant="outline" size="sm" className="h-9" onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
        <Button size="sm" className="h-9" onClick={onConfirm} disabled={busy || !matches}>
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
