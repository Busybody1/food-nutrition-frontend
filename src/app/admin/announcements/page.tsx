'use client'

import { useEffect, useState } from 'react'
import { adminAPI } from '@/lib/api/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAdmin } from '@/lib/hooks/use-admin'
import { Mail, Send, History, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  AdminPage,
  AdminPageHeader,
  AdminPanel,
  AdminPanelHeader,
  AdminPanelBody,
  DashboardAlert,
  DashboardEmpty,
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
        description="Broadcast email to active users via Resend (same as BusyBody admin). Each send is logged in the audit trail."
        actions={
          emailStatus ? (
            <Badge variant={emailStatus.resend_configured ? 'default' : 'secondary'}>
              Resend {emailStatus.resend_configured ? 'configured' : 'not configured'}
            </Badge>
          ) : undefined
        }
      />

      {emailStatus && !emailStatus.resend_configured && !emailStatus.smtp_configured && (
        <DashboardAlert variant="warning">
          <AlertCircle className="h-4 w-4 shrink-0 inline mr-1.5 align-text-bottom" />
          Email is not configured on the API. Set <code className="text-xs">RESEND_API_KEY</code> on Heroku
          (recommended) or SMTP credentials before sending.
        </DashboardAlert>
      )}

      {feedback && (
        <DashboardAlert variant={feedback.type === 'success' ? 'success' : 'error'}>
          {feedback.text}
        </DashboardAlert>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <AdminPanel>
          <AdminPanelHeader title="Compose email" icon={Mail} />
          <AdminPanelBody className="space-y-4">
            {!canSend && (
              <DashboardAlert variant="warning">
                You do not have permission to send announcements.
              </DashboardAlert>
            )}
            <div>
              <label className="text-xs font-medium text-ink-dim block mb-1.5">Subject</label>
              <Input
                placeholder="Product update — March 2026"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={!canSend}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-ink-dim block mb-1.5">HTML body</label>
              <textarea
                className="w-full min-h-[160px] rounded-brand border border-surface-border/80 p-3 text-sm
                  focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/50
                  disabled:opacity-60 disabled:bg-surface-elevated"
                placeholder="<p>Hello {{first_name}}, …</p>"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                disabled={!canSend}
              />
              <p className="text-xs text-ink-muted mt-1.5">
                Use HTML fragments; we wrap them in a branded template. Personalize with{' '}
                <code className="text-xs">{'{{first_name}}'}</code>.
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-ink-dim block mb-1.5">Recipients</label>
              <select
                className="w-full rounded-brand border border-surface-border/80 p-2.5 text-sm bg-white
                  focus:outline-none focus:ring-2 focus:ring-brand/30"
                value={mode}
                onChange={(e) => setMode(e.target.value as 'all' | 'active' | 'plan')}
                disabled={!canSend}
              >
                <option value="all">All active users (up to 500)</option>
                <option value="active">Active accounts only</option>
                <option value="plan">By plan (configure in API)</option>
              </select>
            </div>
            {canSend && (
              <Button onClick={send} disabled={sending || !subject.trim() || !body.trim()} className="w-full sm:w-auto">
                <Send className="h-4 w-4 mr-1.5" />
                {sending ? 'Sending…' : 'Send announcement'}
              </Button>
            )}
          </AdminPanelBody>
        </AdminPanel>

        <AdminPanel>
          <AdminPanelHeader title="Send history" icon={History} />
          <AdminPanelBody className="space-y-3 max-h-[480px] overflow-y-auto">
            {history.length === 0 ? (
              <DashboardEmpty icon={History} title="No announcements sent yet" />
            ) : (
              history.map((h) => (
                <div
                  key={String(h.id)}
                  className="rounded-brand border border-surface-border/60 p-4 hover:bg-surface-elevated/40 transition-colors"
                >
                  <p className="font-medium text-sm text-ink">{String(h.subject)}</p>
                  <p className="text-xs text-ink-muted mt-1">
                    {String(h.recipient_count)} delivered · {String(h.recipient_mode)} ·{' '}
                    {new Date(String(h.created_at)).toLocaleString()}
                  </p>
                  {h.admin_email != null && String(h.admin_email) !== '' && (
                    <p className="text-xs text-ink-dim mt-0.5">by {String(h.admin_email)}</p>
                  )}
                </div>
              ))
            )}
          </AdminPanelBody>
        </AdminPanel>
      </div>
    </AdminPage>
  )
}
