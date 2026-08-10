'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { adminAPI, type AdminUser } from '@/lib/api/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAdmin } from '@/lib/hooks/use-admin'
import {
  AlertCircle,
  Eye,
  Mail,
  Search,
  Send,
  UserRound,
} from 'lucide-react'
import {
  AdminPage,
  AdminPageHeader,
  AdminPanel,
  AdminPanelHeader,
  AdminPanelBody,
  DashboardAlert,
} from '@/components/admin/admin-ui'

type Feedback = { type: 'success' | 'error'; text: string }

type EmailTemplate = {
  id: string
  campaign_kind?: 'usage' | 'activation'
  email_number: number
  label: string
  when: string
  commercial_variant: boolean
}

function UserPicker({
  selected,
  onSelect,
  disabled,
}: {
  selected: AdminUser | null
  onSelect: (user: AdminUser | null) => void
  disabled?: boolean
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<AdminUser[]>([])
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < 2) {
      setResults([])
      return
    }
    const timer = window.setTimeout(() => {
      setSearching(true)
      adminAPI
        .getUsers({ search: trimmed, limit: 8, skip: 0 })
        .then((res) => setResults(res.users || []))
        .catch(() => setResults([]))
        .finally(() => setSearching(false))
    }, 250)
    return () => window.clearTimeout(timer)
  }, [query])

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-ink-dim block">Recipient</label>
      {selected ? (
        <div className="flex items-center justify-between gap-3 rounded-brand border border-surface-border/80 px-3 py-2.5">
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink truncate">
              {[selected.first_name, selected.last_name].filter(Boolean).join(' ') || 'User'}{' '}
              <span className="font-normal text-ink-muted">#{selected.id}</span>
            </p>
            <p className="text-xs text-ink-muted truncate">{selected.email}</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={() => {
              onSelect(null)
              setQuery('')
            }}
          >
            Change
          </Button>
        </div>
      ) : (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" />
          <Input
            className="pl-9"
            placeholder="Search by name or email…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            disabled={disabled}
          />
          {(searching || results.length > 0 || query.trim().length >= 2) && (
            <div className="absolute z-20 mt-1 w-full rounded-brand border border-surface-border/80 bg-white shadow-lg max-h-56 overflow-y-auto">
              {searching && (
                <p className="px-3 py-2 text-xs text-ink-muted">Searching…</p>
              )}
              {!searching && results.length === 0 && (
                <p className="px-3 py-2 text-xs text-ink-muted">No users found</p>
              )}
              {results.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  className="w-full text-left px-3 py-2.5 hover:bg-surface-elevated/60 border-b border-surface-border/40 last:border-0"
                  onClick={() => {
                    onSelect(user)
                    setQuery('')
                    setResults([])
                  }}
                >
                  <p className="text-sm text-ink truncate">
                    {[user.first_name, user.last_name].filter(Boolean).join(' ') || 'User'}
                  </p>
                  <p className="text-xs text-ink-muted truncate">{user.email}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function AdminEmailsPage() {
  const { hasPermission } = useAdmin()
  const canSend = hasPermission('admin:settings:update')

  const [recipient, setRecipient] = useState<AdminUser | null>(null)
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [emailStatus, setEmailStatus] = useState<{
    resend_configured: boolean
    smtp_configured: boolean
    provider: string
  } | null>(null)

  // Custom compose
  const [mode, setMode] = useState<'html' | 'plain'>('html')
  const [subject, setSubject] = useState('')
  const [bodyHtml, setBodyHtml] = useState('<p>Hi {{first_name}},</p>\n<p></p>')
  const [bodyText, setBodyText] = useState('Hi {{first_name}},\n\n')
  const [wrapBranded, setWrapBranded] = useState(true)
  const [fromName, setFromName] = useState('Calorie API')
  const [sendingCustom, setSendingCustom] = useState(false)

  // Conversion templates
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [templateId, setTemplateId] = useState('conv-1')
  const [preview, setPreview] = useState<{
    subject: string
    html: string | null
    text: string
    variant: string
  } | null>(null)
  const [previewing, setPreviewing] = useState(false)
  const [sendingTemplate, setSendingTemplate] = useState(false)

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === templateId) || null,
    [templates, templateId]
  )

  useEffect(() => {
    adminAPI
      .getAnnouncementEmailStatus()
      .then(setEmailStatus)
      .catch(() => setEmailStatus(null))
    adminAPI
      .getEmailTemplates()
      .then((res) => {
        setTemplates(res.templates || [])
        if (res.templates?.[0]?.id) setTemplateId(res.templates[0].id)
      })
      .catch(() => setTemplates([]))
  }, [])

  const loadPreview = useCallback(async () => {
    if (!selectedTemplate) return
    setPreviewing(true)
    setFeedback(null)
    try {
      const res = await adminAPI.previewConversionEmail({
        user_id: recipient?.id,
        email_number: selectedTemplate.email_number,
        commercial_variant: selectedTemplate.commercial_variant,
        campaign_kind: selectedTemplate.campaign_kind || 'usage',
      })
      setPreview({
        subject: res.subject,
        html: res.html,
        text: res.text,
        variant: res.variant,
      })
    } catch (error) {
      setFeedback({
        type: 'error',
        text: error instanceof Error ? error.message : 'Preview failed',
      })
    } finally {
      setPreviewing(false)
    }
  }, [recipient?.id, selectedTemplate])

  const sendCustom = async () => {
    if (!canSend || !recipient || !subject.trim()) return
    const html = mode === 'html' ? bodyHtml.trim() : undefined
    const text = mode === 'plain' ? bodyText.trim() : undefined
    if (!html && !text) return

    setSendingCustom(true)
    setFeedback(null)
    try {
      const res = await adminAPI.sendCustomEmail({
        user_id: recipient.id,
        subject: subject.trim(),
        body_html: html,
        body_text: text,
        wrap_branded: wrapBranded,
        from_name: fromName.trim() || undefined,
      })
      setFeedback({
        type: 'success',
        text: `Sent “${res.subject}” to ${res.email} via ${res.provider ?? 'email'}.`,
      })
    } catch (error) {
      setFeedback({
        type: 'error',
        text: error instanceof Error ? error.message : 'Send failed',
      })
    } finally {
      setSendingCustom(false)
    }
  }

  const sendTemplate = async () => {
    if (!canSend || !recipient || !selectedTemplate) return
    setSendingTemplate(true)
    setFeedback(null)
    try {
      const res = await adminAPI.sendConversionEmail({
        user_id: recipient.id,
        email_number: selectedTemplate.email_number,
        commercial_variant: selectedTemplate.commercial_variant,
        campaign_kind: selectedTemplate.campaign_kind || 'usage',
      })
      setFeedback({
        type: 'success',
        text: `Sent ${selectedTemplate.campaign_kind || 'usage'} email #${res.email_number} (${res.variant}) to ${res.email}.`,
      })
    } catch (error) {
      setFeedback({
        type: 'error',
        text: error instanceof Error ? error.message : 'Send failed',
      })
    } finally {
      setSendingTemplate(false)
    }
  }

  const sendFeedbackTemplate = async () => {
    if (!canSend || !recipient) return
    setSendingTemplate(true)
    setFeedback(null)
    try {
      const res = await adminAPI.sendUserFeedbackEmail(recipient.id)
      setFeedback({
        type: 'success',
        text: res.reused_existing_send
          ? `Feedback request re-sent to user #${res.user_id}.`
          : `Feedback request sent to user #${res.user_id}.`,
      })
    } catch (error) {
      setFeedback({
        type: 'error',
        text: error instanceof Error ? error.message : 'Send failed',
      })
    } finally {
      setSendingTemplate(false)
    }
  }

  return (
    <AdminPage>
      <AdminPageHeader
        title="Emails"
        description="Send a conversion drip template, custom HTML, or plain text to one user. Broadcasts stay on Announcements."
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
          Email is not configured on the API. Set <code className="text-xs">RESEND_API_KEY</code> before
          sending.
        </DashboardAlert>
      )}

      {!canSend && (
        <DashboardAlert variant="warning">
          You do not have permission to send emails.
        </DashboardAlert>
      )}

      {feedback && (
        <DashboardAlert variant={feedback.type === 'success' ? 'success' : 'error'}>
          {feedback.text}
        </DashboardAlert>
      )}

      <AdminPanel>
        <AdminPanelHeader title="Recipient" icon={UserRound} />
        <AdminPanelBody>
          <UserPicker selected={recipient} onSelect={setRecipient} disabled={!canSend} />
        </AdminPanelBody>
      </AdminPanel>

      <Tabs defaultValue="custom" className="space-y-4">
        <TabsList>
          <TabsTrigger value="custom">Custom email</TabsTrigger>
          <TabsTrigger value="conversion">Conversion templates</TabsTrigger>
          <TabsTrigger value="feedback">Feedback template</TabsTrigger>
        </TabsList>

        <TabsContent value="custom" className="space-y-4">
          <AdminPanel>
            <AdminPanelHeader title="Compose" icon={Mail} />
            <AdminPanelBody className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={mode === 'html' ? 'default' : 'outline'}
                  onClick={() => setMode('html')}
                  disabled={!canSend}
                >
                  HTML
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={mode === 'plain' ? 'default' : 'outline'}
                  onClick={() => setMode('plain')}
                  disabled={!canSend}
                >
                  Plain text
                </Button>
              </div>

              <div>
                <label className="text-xs font-medium text-ink-dim block mb-1.5">From name</label>
                <Input
                  value={fromName}
                  onChange={(event) => setFromName(event.target.value)}
                  disabled={!canSend}
                  placeholder="Calorie API"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-ink-dim block mb-1.5">Subject</label>
                <Input
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  disabled={!canSend}
                  placeholder="Quick note about your API integration"
                />
              </div>

              {mode === 'html' ? (
                <div>
                  <label className="text-xs font-medium text-ink-dim block mb-1.5">HTML body</label>
                  <textarea
                    className="w-full min-h-[200px] rounded-brand border border-surface-border/80 p-3 text-sm font-mono
                      focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/50
                      disabled:opacity-60 disabled:bg-surface-elevated"
                    value={bodyHtml}
                    onChange={(event) => setBodyHtml(event.target.value)}
                    disabled={!canSend}
                  />
                  <label className="mt-2 flex items-center gap-2 text-xs text-ink-dim">
                    <input
                      type="checkbox"
                      checked={wrapBranded}
                      onChange={(event) => setWrapBranded(event.target.checked)}
                      disabled={!canSend}
                    />
                    Wrap in branded Calorie API / announcement layout
                  </label>
                </div>
              ) : (
                <div>
                  <label className="text-xs font-medium text-ink-dim block mb-1.5">Plain text body</label>
                  <textarea
                    className="w-full min-h-[200px] rounded-brand border border-surface-border/80 p-3 text-sm
                      focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/50
                      disabled:opacity-60 disabled:bg-surface-elevated"
                    value={bodyText}
                    onChange={(event) => setBodyText(event.target.value)}
                    disabled={!canSend}
                  />
                  <p className="text-xs text-ink-muted mt-1.5">
                    Sent as plain text (with a simple HTML fallback for some clients).
                  </p>
                </div>
              )}

              <p className="text-xs text-ink-muted">
                Personalize with <code className="text-xs">{'{{first_name}}'}</code>.
              </p>

              {canSend && (
                <Button
                  onClick={sendCustom}
                  disabled={
                    sendingCustom ||
                    !recipient ||
                    !subject.trim() ||
                    (mode === 'html' ? !bodyHtml.trim() : !bodyText.trim())
                  }
                >
                  <Send className="h-4 w-4 mr-1.5" />
                  {sendingCustom ? 'Sending…' : 'Send custom email'}
                </Button>
              )}
            </AdminPanelBody>
          </AdminPanel>
        </TabsContent>

        <TabsContent value="conversion" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <AdminPanel>
              <AdminPanelHeader title="Template" icon={Send} />
              <AdminPanelBody className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-ink-dim block mb-1.5">
                    Conversion drip email
                  </label>
                  <select
                    className="w-full rounded-brand border border-surface-border/80 p-2.5 text-sm bg-white
                      focus:outline-none focus:ring-2 focus:ring-brand/30"
                    value={templateId}
                    onChange={(event) => {
                      setTemplateId(event.target.value)
                      setPreview(null)
                    }}
                    disabled={!canSend || templates.length === 0}
                  >
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        [{template.campaign_kind || 'usage'}] #{template.email_number} —{' '}
                        {template.label} ({template.when})
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-xs text-ink-muted">
                  Manual sends do not advance or suppress the automated drip schedule.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={loadPreview}
                    disabled={!selectedTemplate || previewing}
                  >
                    <Eye className="h-4 w-4 mr-1.5" />
                    {previewing ? 'Loading…' : 'Preview'}
                  </Button>
                  {canSend && (
                    <Button
                      onClick={sendTemplate}
                      disabled={!recipient || !selectedTemplate || sendingTemplate}
                    >
                      <Send className="h-4 w-4 mr-1.5" />
                      {sendingTemplate ? 'Sending…' : 'Send template'}
                    </Button>
                  )}
                </div>
              </AdminPanelBody>
            </AdminPanel>

            <AdminPanel>
              <AdminPanelHeader title="Preview" icon={Eye} />
              <AdminPanelBody className="space-y-3">
                {!preview ? (
                  <p className="text-sm text-ink-muted">
                    Choose a template and click Preview to inspect subject and HTML.
                  </p>
                ) : (
                  <>
                    <div>
                      <p className="text-xs text-ink-muted">Subject</p>
                      <p className="text-sm font-medium text-ink">{preview.subject}</p>
                      <p className="text-xs text-ink-dim mt-1">Variant: {preview.variant}</p>
                    </div>
                    <div className="rounded-brand border border-surface-border/60 overflow-hidden bg-white p-4">
                      {preview.html ? (
                        <iframe
                          title="Email preview"
                          sandbox=""
                          srcDoc={preview.html}
                          className="w-full h-[420px] bg-white"
                        />
                      ) : (
                        <pre className="whitespace-pre-wrap text-sm text-ink font-sans leading-relaxed">
                          {preview.text}
                        </pre>
                      )}
                    </div>
                  </>
                )}
              </AdminPanelBody>
            </AdminPanel>
          </div>
        </TabsContent>

        <TabsContent value="feedback">
          <AdminPanel>
            <AdminPanelHeader title="Feedback request" icon={Mail} />
            <AdminPanelBody className="space-y-4">
              <p className="text-sm text-ink-muted">
                Sends the standard plain-text feedback request (reply-to Resend Receiving inbox). Same
                action as on the user detail page.
              </p>
              {canSend && (
                <Button onClick={sendFeedbackTemplate} disabled={!recipient || sendingTemplate}>
                  <Send className="h-4 w-4 mr-1.5" />
                  {sendingTemplate ? 'Sending…' : 'Send feedback email'}
                </Button>
              )}
            </AdminPanelBody>
          </AdminPanel>
        </TabsContent>
      </Tabs>
    </AdminPage>
  )
}
