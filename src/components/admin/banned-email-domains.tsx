'use client'

import { useCallback, useEffect, useState } from 'react'
import { AtSign, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  adminAPI,
  EmailDomainBan,
  EmailDomainBanPreview,
} from '@/lib/api/admin'
import {
  AdminPanel,
  AdminPanelBody,
  AdminPanelHeader,
  DashboardAlert,
} from '@/components/admin/admin-ui'

export function emailDomainLabel(email: string): string {
  const trimmed = email.trim()
  const at = trimmed.lastIndexOf('@')
  const domain = (at >= 0 ? trimmed.slice(at + 1) : trimmed).replace(/\.+$/, '')
  return domain || trimmed
}

function messageFrom(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback
}

function BanConfirmOptions({
  preview,
  deactivateExisting,
  onDeactivateExisting,
  allowSelfLockout,
  onAllowSelfLockout,
  confirmLarge,
  onConfirmLarge,
  disabled,
}: {
  preview: EmailDomainBanPreview | null
  deactivateExisting: boolean
  onDeactivateExisting: (value: boolean) => void
  allowSelfLockout: boolean
  onAllowSelfLockout: (value: boolean) => void
  confirmLarge: boolean
  onConfirmLarge: (value: boolean) => void
  disabled: boolean
}) {
  return (
    <div className="space-y-2 text-sm text-ink-muted">
      {preview && (
        <p>
          <span className="font-medium text-ink">{preview.domain}</span>
          {' '}matches {preview.account_count.toLocaleString()} account
          {preview.account_count === 1 ? '' : 's'}
          {preview.active_account_count > 0
            ? ` (${preview.active_account_count.toLocaleString()} active)`
            : ''}
          . New signups on this domain and its subdomains are blocked.
        </p>
      )}
      <label className="flex items-start gap-2">
        <input
          type="checkbox"
          className="mt-1 rounded border-gray-300"
          checked={deactivateExisting}
          disabled={disabled}
          onChange={(event) => onDeactivateExisting(event.target.checked)}
        />
        <span>Deactivate existing non-admin accounts on this domain.</span>
      </label>
      {preview?.locks_out_actor && (
        <label className="flex items-start gap-2">
          <input
            type="checkbox"
            className="mt-1 rounded border-gray-300"
            checked={allowSelfLockout}
            disabled={disabled}
            onChange={(event) => onAllowSelfLockout(event.target.checked)}
          />
          <span>This domain includes your admin login. Ban it anyway. Your admin account stays active.</span>
        </label>
      )}
      {preview?.requires_large_confirm && (
        <label className="flex items-start gap-2">
          <input
            type="checkbox"
            className="mt-1 rounded border-gray-300"
            checked={confirmLarge}
            disabled={disabled}
            onChange={(event) => onConfirmLarge(event.target.checked)}
          />
          <span>
            I understand this bans {preview.account_count.toLocaleString()} accounts.
          </span>
        </label>
      )}
    </div>
  )
}

function banNeedsConfirm(
  preview: EmailDomainBanPreview,
  allowSelfLockout: boolean,
  confirmLarge: boolean
): boolean {
  return (
    (preview.locks_out_actor && !allowSelfLockout) ||
    (preview.requires_large_confirm && !confirmLarge)
  )
}

export function BannedEmailDomainsPanel({
  refreshKey = 0,
  onAccountsChanged,
}: {
  refreshKey?: number
  onAccountsChanged?: () => void
}) {
  const [bans, setBans] = useState<EmailDomainBan[]>([])
  const [domain, setDomain] = useState('')
  const [reason, setReason] = useState('')
  const [deactivateExisting, setDeactivateExisting] = useState(true)
  const [allowSelfLockout, setAllowSelfLockout] = useState(false)
  const [confirmLarge, setConfirmLarge] = useState(false)
  const [preview, setPreview] = useState<EmailDomainBanPreview | null>(null)
  const [previewInput, setPreviewInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const load = useCallback(async () => {
    const response = await adminAPI.listEmailDomainBans()
    setBans(response.bans || [])
    setError('')
    setLoading(false)
  }, [])

  useEffect(() => {
    let cancelled = false
    adminAPI
      .listEmailDomainBans()
      .then((response) => {
        if (cancelled) return
        setBans(response.bans || [])
        setError('')
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(messageFrom(err, 'Failed to load banned email domains'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [refreshKey])

  const resetConfirm = () => {
    setPreview(null)
    setPreviewInput('')
    setAllowSelfLockout(false)
    setConfirmLarge(false)
  }

  const handleAdd = async () => {
    const typed = domain.trim()
    if (!typed) return
    try {
      setSaving(true)
      setError('')
      setNotice('')
      let nextPreview = preview
      if (typed !== previewInput || !nextPreview) {
        nextPreview = await adminAPI.previewEmailDomainBan(typed)
        setPreview(nextPreview)
        setPreviewInput(typed)
        return
      }
      if (banNeedsConfirm(nextPreview, allowSelfLockout, confirmLarge)) {
        setError('Confirm the warning below before banning this domain.')
        return
      }
      const result = await adminAPI.createEmailDomainBan({
        domain: nextPreview.domain,
        reason: reason.trim() || undefined,
        deactivateExisting,
        allowSelfLockout,
        confirmLarge,
      })
      const deactivated = result.deactivated_count
      setNotice(
        deactivated > 0
          ? `Banned ${result.ban.domain}. Deactivated ${deactivated} account${deactivated === 1 ? '' : 's'}.`
          : `Banned ${result.ban.domain}.`
      )
      setDomain('')
      setReason('')
      resetConfirm()
      await load()
      if (deactivated > 0) onAccountsChanged?.()
    } catch (err) {
      setError(messageFrom(err, 'Failed to ban this email domain'))
    } finally {
      setSaving(false)
    }
  }

  const handleRemove = async (ban: EmailDomainBan) => {
    const confirmed = window.confirm(
      `Remove the ban for ${ban.domain}? Accounts that were deactivated stay inactive until you activate them.`
    )
    if (!confirmed) return
    try {
      setSaving(true)
      setError('')
      setNotice('')
      await adminAPI.deleteEmailDomainBan(ban.id)
      setNotice(`Removed the ban for ${ban.domain}.`)
      await load()
    } catch (err) {
      setError(messageFrom(err, 'Failed to remove this email domain ban'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminPanel>
      <AdminPanelHeader title="Banned email domains" icon={AtSign} />
      <AdminPanelBody>
        <p className="text-sm text-ink-muted mb-4">
          Stop new accounts from a spam domain. Subdomains are included. Admin accounts stay active.
        </p>
        {error && <div className="mb-3"><DashboardAlert variant="error">{error}</DashboardAlert></div>}
        {notice && <div className="mb-3"><DashboardAlert variant="success">{notice}</DashboardAlert></div>}
        <form
          className="flex flex-col gap-3"
          onSubmit={(event) => {
            event.preventDefault()
            void handleAdd()
          }}
        >
          <div className="flex flex-col lg:flex-row gap-2">
            <Input
              value={domain}
              onChange={(event) => {
                setDomain(event.target.value)
                resetConfirm()
              }}
              placeholder="example.com or user@example.com"
              aria-label="Email domain to ban"
              disabled={saving}
            />
            <Input
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Reason (optional)"
              aria-label="Reason for the email domain ban"
              disabled={saving}
            />
            <Button type="submit" disabled={saving || !domain.trim()}>
              {saving
                ? 'Saving…'
                : preview && domain.trim() === previewInput
                  ? 'Confirm ban'
                  : 'Ban domain'}
            </Button>
          </div>
          <BanConfirmOptions
            preview={preview}
            deactivateExisting={deactivateExisting}
            onDeactivateExisting={setDeactivateExisting}
            allowSelfLockout={allowSelfLockout}
            onAllowSelfLockout={setAllowSelfLockout}
            confirmLarge={confirmLarge}
            onConfirmLarge={setConfirmLarge}
            disabled={saving}
          />
        </form>
        <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
          {loading && bans.length === 0 ? (
            <p className="text-sm text-ink-muted">Loading banned domains…</p>
          ) : bans.length === 0 ? (
            <p className="text-sm text-ink-muted">No email domains are banned.</p>
          ) : (
            bans.map((ban) => (
              <div
                key={ban.id}
                className="flex items-start justify-between gap-3 rounded-md border border-gray-200 px-3 py-2"
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium text-ink truncate">{ban.domain}</div>
                  <div className="text-xs text-ink-muted">
                    {ban.account_count.toLocaleString()} accounts
                    {ban.reason ? ` · ${ban.reason}` : ''}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  title={`Remove ban for ${ban.domain}`}
                  aria-label={`Remove ban for ${ban.domain}`}
                  disabled={saving}
                  onClick={() => void handleRemove(ban)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </AdminPanelBody>
    </AdminPanel>
  )
}

export function BanEmailDomainDialog({
  email,
  open,
  onOpenChange,
  onBanned,
}: {
  email: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onBanned: (message: string) => void
}) {
  const [preview, setPreview] = useState<EmailDomainBanPreview | null>(null)
  const [reason, setReason] = useState('')
  const [deactivateExisting, setDeactivateExisting] = useState(true)
  const [allowSelfLockout, setAllowSelfLockout] = useState(false)
  const [confirmLarge, setConfirmLarge] = useState(false)
  const [loading, setLoading] = useState(open && email.length > 0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open || !email) return
    let cancelled = false
    adminAPI
      .previewEmailDomainBan(email)
      .then((result) => {
        if (!cancelled) setPreview(result)
      })
      .catch((err) => {
        if (!cancelled) setError(messageFrom(err, 'Failed to check this email domain'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [open, email])

  const handleBan = async () => {
    if (!preview) return
    if (banNeedsConfirm(preview, allowSelfLockout, confirmLarge)) {
      setError('Confirm the warning below before banning this domain.')
      return
    }
    try {
      setSaving(true)
      setError('')
      const result = await adminAPI.createEmailDomainBan({
        domain: preview.domain,
        reason: reason.trim() || undefined,
        deactivateExisting,
        allowSelfLockout,
        confirmLarge,
      })
      const deactivated = result.deactivated_count
      onBanned(
        deactivated > 0
          ? `Banned ${result.ban.domain}. Deactivated ${deactivated} account${deactivated === 1 ? '' : 's'}.`
          : `Banned ${result.ban.domain}.`
      )
      onOpenChange(false)
    } catch (err) {
      setError(messageFrom(err, 'Failed to ban this email domain'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !saving && onOpenChange(next)}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Ban this email domain?</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {loading && <p className="text-sm text-ink-muted">Checking {emailDomainLabel(email)}…</p>}
          {error && <DashboardAlert variant="error">{error}</DashboardAlert>}
          <BanConfirmOptions
            preview={preview}
            deactivateExisting={deactivateExisting}
            onDeactivateExisting={setDeactivateExisting}
            allowSelfLockout={allowSelfLockout}
            onAllowSelfLockout={setAllowSelfLockout}
            confirmLarge={confirmLarge}
            onConfirmLarge={setConfirmLarge}
            disabled={saving || loading}
          />
          <Input
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Reason (optional)"
            aria-label="Reason for the email domain ban"
            disabled={saving || loading}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => void handleBan()}
            disabled={saving || loading || !preview}
          >
            {saving ? 'Banning…' : 'Ban domain'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
