'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
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
import { emailDomainBanNeedsConfirm } from '@/lib/admin/email-domain-ban'
import {
  AdminPanel,
  AdminPanelBody,
  AdminPanelHeader,
  AdminTable,
  AdminTableWrap,
  DashboardAlert,
  DashboardLoading,
  InfoHint,
  DASHBOARD_ICON_STROKE,
} from '@/components/admin/admin-ui'

export function emailDomainLabel(email: string): string {
  const trimmed = email.trim()
  const at = trimmed.lastIndexOf('@')
  const domain = (at >= 0 ? trimmed.slice(at + 1) : trimmed).replace(/\.+$/, '')
  return domain || trimmed
}

const CHECKBOX_CLASS =
  'mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-dash-border accent-dash-teal-strong disabled:cursor-not-allowed'

const WARNING_OPTION_CLASS =
  'flex items-start gap-2.5 rounded-xl border border-dash-warning/20 bg-dash-warning-soft px-3.5 py-2.5 text-dash-warning'

function formatBanDate(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString()
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
    <div className="space-y-2.5 text-[13px] leading-5 text-dash-body">
      {preview && (
        <p className="rounded-xl border border-dash-border bg-dash-hover px-3.5 py-2.5 text-dash-muted">
          <span className="font-medium text-dash-ink">{preview.domain}</span>
          {' '}matches {preview.account_count.toLocaleString()} account
          {preview.account_count === 1 ? '' : 's'}
          {preview.active_account_count > 0
            ? ` (${preview.active_account_count.toLocaleString()} active)`
            : ''}
          . New signups on this domain and its subdomains will be blocked.
        </p>
      )}
      <label className="flex items-start gap-2.5">
        <input
          type="checkbox"
          className={CHECKBOX_CLASS}
          checked={deactivateExisting}
          disabled={disabled}
          onChange={(event) => onDeactivateExisting(event.target.checked)}
        />
        <span>Deactivate existing non-admin accounts on this domain.</span>
      </label>
      {preview?.locks_out_actor && (
        <label className={WARNING_OPTION_CLASS}>
          <input
            type="checkbox"
            className={CHECKBOX_CLASS}
            checked={allowSelfLockout}
            disabled={disabled}
            onChange={(event) => onAllowSelfLockout(event.target.checked)}
          />
          <span>This domain includes your admin login. Ban it anyway. Your admin account stays active.</span>
        </label>
      )}
      {preview?.requires_large_confirm && (
        <label className={WARNING_OPTION_CLASS}>
          <input
            type="checkbox"
            className={CHECKBOX_CLASS}
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
  const listRequest = useRef(0)

  const load = useCallback(async () => {
    const requestId = ++listRequest.current
    const response = await adminAPI.listEmailDomainBans()
    if (requestId !== listRequest.current) return
    setBans(response.bans || [])
    setError('')
    setLoading(false)
  }, [])

  useEffect(() => {
    let cancelled = false
    const requestId = ++listRequest.current
    adminAPI
      .listEmailDomainBans()
      .then((response) => {
        if (cancelled || requestId !== listRequest.current) return
        setBans(response.bans || [])
        setError('')
      })
      .catch((err: unknown) => {
        if (cancelled || requestId !== listRequest.current) return
        setError(messageFrom(err, 'Failed to load banned email domains'))
      })
      .finally(() => {
        if (!cancelled && requestId === listRequest.current) setLoading(false)
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
      const needsFreshPreview = typed !== previewInput || !preview
      let nextPreview = preview
      if (needsFreshPreview || !nextPreview) {
        nextPreview = await adminAPI.previewEmailDomainBan(typed)
        setPreview(nextPreview)
        setPreviewInput(typed)
      }
      if (!nextPreview) return
      if (emailDomainBanNeedsConfirm(nextPreview, allowSelfLockout, confirmLarge)) {
        if (!needsFreshPreview) {
          setError('Confirm the warning below before banning this domain.')
        }
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
      setBans((current) => [
        result.ban,
        ...current.filter((ban) => ban.id !== result.ban.id && ban.domain !== result.ban.domain),
      ])
      setDomain('')
      setReason('')
      resetConfirm()
      const saved = result.ban
      try {
        await load()
        setBans((current) =>
          current.some((ban) => ban.id === saved.id) ? current : [saved, ...current]
        )
      } catch (err) {
        setError(messageFrom(err, 'Banned the domain, but the list could not be refreshed.'))
      }
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
      <AdminPanelHeader
        title="Banned email domains"
        icon={AtSign}
        actions={
          <InfoHint text="Stop new accounts from a spam domain. Subdomains are included. Admin accounts stay active." />
        }
      />
      <AdminPanelBody>
        {error && <div className="mb-3"><DashboardAlert variant="error">{error}</DashboardAlert></div>}
        {notice && <div className="mb-3"><DashboardAlert variant="success">{notice}</DashboardAlert></div>}
        <form
          className="flex flex-col gap-3"
          onSubmit={(event) => {
            event.preventDefault()
            void handleAdd()
          }}
        >
          <div className="flex flex-col gap-2 lg:flex-row">
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
            <Button
              type="submit"
              size="sm"
              className="h-9 shrink-0"
              disabled={saving || !domain.trim()}
            >
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
      </AdminPanelBody>
      {loading && bans.length === 0 ? (
        <DashboardLoading message="Loading banned domains…" className="min-h-[120px] pb-5" />
      ) : bans.length === 0 ? (
        <p className="border-t border-dash-border px-5 py-4 text-[13px] text-dash-muted">
          No email domains are banned.
        </p>
      ) : (
        <div className="max-h-80 overflow-y-auto rounded-b-2xl">
          <AdminTableWrap>
            <AdminTable>
              <thead>
                <tr>
                  <th>Domain</th>
                  <th>Reason</th>
                  <th>Created</th>
                  <th className="dashboard-num">Accounts</th>
                  <th className="text-right">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {bans.map((ban) => (
                  <tr key={ban.id}>
                    <td className="max-w-[240px]">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-dash-negative-soft text-dash-negative"
                          aria-hidden
                        >
                          <AtSign className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} />
                        </span>
                        <span className="truncate font-medium text-dash-ink" title={ban.domain}>
                          {ban.domain}
                        </span>
                      </div>
                    </td>
                    <td className="max-w-[280px] truncate text-dash-muted" title={ban.reason || undefined}>
                      {ban.reason || '—'}
                    </td>
                    <td className="whitespace-nowrap text-xs text-dash-muted">
                      {formatBanDate(ban.created_at)}
                    </td>
                    <td className="dashboard-num font-medium text-dash-ink">
                      {ban.account_count.toLocaleString()}
                    </td>
                    <td className="text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-dash-negative hover:bg-dash-negative-soft hover:text-dash-negative"
                        title={`Remove ban for ${ban.domain}`}
                        aria-label={`Remove ban for ${ban.domain}`}
                        disabled={saving}
                        onClick={() => void handleRemove(ban)}
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </AdminTable>
          </AdminTableWrap>
        </div>
      )}
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
    if (emailDomainBanNeedsConfirm(preview, allowSelfLockout, confirmLarge)) {
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
          {loading && (
            <p className="text-[13px] text-dash-muted">Checking {emailDomainLabel(email)}…</p>
          )}
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
        <DialogFooter className="gap-2 sm:space-x-0">
          <Button
            variant="outline"
            size="sm"
            className="h-9"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="h-9"
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
