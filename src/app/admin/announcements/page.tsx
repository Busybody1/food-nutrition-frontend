'use client'

import { useEffect, useState } from 'react'
import { adminAPI } from '@/lib/api/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAdmin } from '@/lib/hooks/use-admin'
import { Mail, Send, History, AlertCircle } from 'lucide-react'
import {
  AdminPage,
  AdminPageHeader,
  AdminPanel,
  AdminPanelHeader,
  AdminPanelBody,
  AdminTableWrap,
  AdminTable,
  DashboardAlert,
  DashboardEmpty,
  DashboardPill,
  DASHBOARD_ICON_STROKE,
} from '@/components/admin/admin-ui'

export default function AdminAnnouncementsPage() {
  const { hasPermission } = useAdmin()
  const canSend = hasPermission('admin:settings:update')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [mode, setMode] = useState<'all' | 'active' | 'plan'>('all')
  const [history, setHistory] = useState<Array<Record<string, unknown>>>([])
  const [sending, setSending] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [emailStatus, setEmailStatus] = useState<{
    resend_configured: boolean
    smtp_configured: boolean
    provider: string
    from_email?: string | null
  } | null>(null)

  const loadHistory = () => {
    adminAPI.getAnnouncementHistory().then((d) => setHistory(d.announcements))
  }

  useEffect(() => {
    loadHistory()
    adminAPI.getAnnouncementEmailStatus().then(setEmailStatus).catch(() => setEmailStatus(null))
  }, [])

  const send = async () => {
    if (!canSend || !subject.trim() || !body.trim()) return
    setSending(true)
    setFeedback(null)
    try {
      const res = await adminAPI.sendAnnouncement({
        subject: subject.trim(),
        body_html: body.trim(),
        recipient_mode: mode,
        limit: 500,
      })
      const failed = res.failed ?? 0
      setFeedback({
        type: failed > 0 && res.sent === 0 ? 'error' : 'success',
        text:
          failed > 0
            ? `Sent to ${res.sent} of ${res.total_recipients} (${failed} failed) via ${res.provider ?? 'email'}.`
            : `Sent to ${res.sent} recipient${res.sent === 1 ? '' : 's'} via ${res.provider ?? 'email'}.`,
      })
      setSubject('')
      setBody('')
      loadHistory()
    } catch (e) {
      setFeedback({
        type: 'error',
        text: e instanceof Error ? e.message : 'Send failed',
      })
    } finally {
      setSending(false)
    }
  }

  return (
    <AdminPage>
      <AdminPageHeader
        title="Announcements"
        description="Broadcast email to active users via Resend (same as the companion app admin). Each send is logged in the audit trail."
        meta={
          emailStatus ? (
            <DashboardPill tone={emailStatus.resend_configured ? 'green' : 'neutral'}>
              Resend {emailStatus.resend_configured ? 'configured' : 'not configured'}
            </DashboardPill>
          ) : undefined
        }
      />

      {emailStatus && !emailStatus.resend_configured && !emailStatus.smtp_configured && (
        <DashboardAlert variant="warning">
          <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={DASHBOARD_ICON_STROKE} aria-hidden />
          <span className="min-w-0 flex-1">
            Email is not configured on the API. Set <code className="font-mono text-xs">RESEND_API_KEY</code> on
            Heroku (recommended) or SMTP credentials before sending.
          </span>
        </DashboardAlert>
      )}

      {feedback && (
        <DashboardAlert variant={feedback.type === 'success' ? 'success' : 'error'}>
          {feedback.text}
        </DashboardAlert>
      )}

      <div className="dashboard-grid-halves">
        <AdminPanel>
          <AdminPanelHeader title="Compose email" icon={Mail} />
          <AdminPanelBody className="space-y-4">
            {!canSend && (
              <DashboardAlert variant="warning">
                You do not have permission to send announcements.
              </DashboardAlert>
            )}
            <div>
              <label htmlFor="announcement-subject" className="dashboard-field-label">
                Subject
              </label>
              <Input
                id="announcement-subject"
                placeholder="Product update, March 2026"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={!canSend}
              />
            </div>
            <div>
              <label htmlFor="announcement-body" className="dashboard-field-label">
                HTML body
              </label>
              <textarea
                id="announcement-body"
                className="dashboard-textarea min-h-[160px] font-mono text-xs leading-5"
                placeholder="<p>Hello {{first_name}}, …</p>"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                disabled={!canSend}
              />
              <p className="dashboard-field-hint">
                Use HTML fragments; we wrap them in a branded template. Personalize with{' '}
                <code className="font-mono text-xs text-dash-body">{'{{first_name}}'}</code>.
              </p>
            </div>
            <div>
              <label htmlFor="announcement-recipients" className="dashboard-field-label">
                Recipients
              </label>
              <select
                id="announcement-recipients"
                className="dashboard-select w-full"
                value={mode}
                onChange={(e) => setMode(e.target.value as 'all' | 'active' | 'plan')}
                disabled={!canSend}
              >
                <option value="all">All active users (up to 500)</option>
                <option value="active">Active accounts only</option>
                <option value="plan">By plan (configure in API)</option>
              </select>
            </div>
          </AdminPanelBody>
          {canSend && (
            <div className="flex justify-end gap-2 border-t border-dash-border px-5 py-4">
              <Button
                size="sm"
                onClick={send}
                disabled={sending || !subject.trim() || !body.trim()}
                className="h-9 w-full gap-1.5 sm:w-auto"
              >
                <Send className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} aria-hidden />
                {sending ? 'Sending…' : 'Send announcement'}
              </Button>
            </div>
          )}
        </AdminPanel>

        <AdminPanel>
          <AdminPanelHeader
            title="Send history"
            icon={History}
            actions={
              history.length > 0 ? (
                <span className="dashboard-meta-pill tabular-nums">{history.length.toLocaleString()}</span>
              ) : undefined
            }
          />
          {history.length === 0 ? (
            <AdminPanelBody>
              <DashboardEmpty icon={History} title="No announcements sent yet" />
            </AdminPanelBody>
          ) : (
            <AdminPanelBody noPadding className="max-h-[480px] overflow-y-auto">
              <AdminTableWrap>
                <AdminTable>
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Recipients</th>
                      <th className="dashboard-num">Delivered</th>
                      <th>Sent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((h) => (
                      <tr key={String(h.id)}>
                        <td className="max-w-[260px]">
                          <p className="truncate font-medium text-dash-ink" title={String(h.subject)}>
                            {String(h.subject)}
                          </p>
                          {h.admin_email != null && String(h.admin_email) !== '' && (
                            <p className="truncate text-xs text-dash-muted">by {String(h.admin_email)}</p>
                          )}
                        </td>
                        <td>
                          <DashboardPill tone="neutral">{String(h.recipient_mode)}</DashboardPill>
                        </td>
                        <td className="dashboard-num text-dash-ink">{String(h.recipient_count)}</td>
                        <td className="whitespace-nowrap text-xs text-dash-muted">
                          {new Date(String(h.created_at)).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </AdminTable>
              </AdminTableWrap>
            </AdminPanelBody>
          )}
        </AdminPanel>
      </div>
    </AdminPage>
  )
}
