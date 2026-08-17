'use client'

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { adminAPI, type AdminUser, type EmailLogEntry } from '@/lib/api/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAdmin } from '@/lib/hooks/use-admin'
import {
  AlertCircle,
  Eye,
  Mail,
  ScrollText,
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
  AdminTableWrap,
  AdminTable,
  AdminPagination,
  AdminRefreshButton,
  DashboardAlert,
  DashboardEmpty,
  DashboardLoading,
} from '@/components/admin/admin-ui'

type Feedback = { type: 'success' | 'error'; text: string }

const EMAIL_LOG_KINDS = [
  { value: '', label: 'All kinds' },
  { value: 'conversion', label: 'Conversion drip' },
  { value: 'conversion_manual', label: 'Conversion (manual)' },
  { value: 'verification', label: 'Verification code' },
  { value: 'feedback', label: 'Feedback request' },
  { value: 'announcement', label: 'Announcement' },
  { value: 'custom', label: 'Custom' },
] as const

function formatLogKind(kind: string): string {
  const match = EMAIL_LOG_KINDS.find((item) => item.value === kind)
  return match?.label || kind
}

type EmailTemplate = {
  id: string
  campaign_kind?: 'usage' | 'activation'
  email_number: number
  label: string
  when: string
  commercial_variant: boolean
}

const USER_PICKER_MENU_HEIGHT_PX = 224
const USER_PICKER_FLIP_THRESHOLD_PX = 160

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
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuRect, setMenuRect] = useState<DOMRect | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const trimmed = query.trim()
  const showMenu = menuOpen && !selected && trimmed.length >= 2

  useEffect(() => {
    if (trimmed.length < 2) return
    const timer = window.setTimeout(() => {
      setSearching(true)
      adminAPI
        .getUsers({ search: trimmed, limit: 8, skip: 0 })
        .then((res) => setResults(res.users || []))
        .catch(() => setResults([]))
        .finally(() => setSearching(false))
    }, 250)
    return () => window.clearTimeout(timer)
  }, [trimmed])

  const updateMenuRect = useCallback(() => {
    const input = inputRef.current
    if (!input) return
    const rect = input.getBoundingClientRect()
    const menuHeight = USER_PICKER_MENU_HEIGHT_PX
    const spaceBelow = window.innerHeight - rect.bottom
    const top =
      spaceBelow < USER_PICKER_FLIP_THRESHOLD_PX
        ? Math.max(8, rect.top - menuHeight - 6)
        : rect.bottom + 6
    setMenuRect(new DOMRect(rect.left, top, rect.width, rect.height))
  }, [])

  useLayoutEffect(() => {
    if (!showMenu) return
    updateMenuRect()
    const onReposition = () => updateMenuRect()
    window.addEventListener('resize', onReposition)
    window.addEventListener('scroll', onReposition, true)
    return () => {
      window.removeEventListener('resize', onReposition)
      window.removeEventListener('scroll', onReposition, true)
    }
  }, [showMenu, updateMenuRect, results.length, searching])

  useEffect(() => {
    if (!showMenu) return
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (inputRef.current?.contains(target) || menuRef.current?.contains(target)) return
      setMenuOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [showMenu])

  return (
    <div>
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
              setMenuOpen(false)
            }}
          >
            Change
          </Button>
        </div>
      ) : (
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" />
          <Input
            ref={inputRef}
            className="pl-9"
            placeholder="Search by name or email…"
            value={query}
            onChange={(event) => {
              const next = event.target.value
              setQuery(next)
              setMenuOpen(true)
              if (next.trim().length < 2) setResults([])
            }}
            onFocus={() => {
              if (trimmed.length >= 2) setMenuOpen(true)
            }}
            disabled={disabled}
            autoComplete="off"
            aria-autocomplete="list"
            aria-expanded={showMenu}
          />
          {showMenu &&
            menuRect &&
            typeof document !== 'undefined' &&
            createPortal(
              <div
                ref={menuRef}
                className="dashboard-popover pointer-events-auto fixed max-h-56 overflow-y-auto"
                style={{
                  top: menuRect.top,
                  left: menuRect.left,
                  width: menuRect.width,
                }}
                role="listbox"
              >
                {searching && <p className="px-3 py-2.5 text-xs text-ink-muted">Searching…</p>}
                {!searching && results.length === 0 && (
                  <p className="px-3 py-2.5 text-xs text-ink-muted">No users found</p>
                )}
                {results.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    role="option"
                    aria-selected={false}
                    className="w-full cursor-pointer text-left px-3 py-2.5 hover:bg-surface-elevated/80 border-b border-surface-border/40 last:border-0"
                    onClick={() => {
                      onSelect(user)
                      setQuery('')
                      setResults([])
                      setMenuOpen(false)
                    }}
                  >
                    <p className="text-sm text-ink truncate">
                      {[user.first_name, user.last_name].filter(Boolean).join(' ') || 'User'}
                    </p>
                    <p className="text-xs text-ink-muted truncate">{user.email}</p>
                  </button>
                ))}
              </div>,
              document.body
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

  const [logEntries, setLogEntries] = useState<EmailLogEntry[]>([])
  const [logTotal, setLogTotal] = useState(0)
  const [logKind, setLogKind] = useState('')
  const [logEmailInput, setLogEmailInput] = useState('')
  const [logEmailFilter, setLogEmailFilter] = useState('')
  const [logPage, setLogPage] = useState(1)
  const [logPageSize, setLogPageSize] = useState(50)
  const [logLoading, setLogLoading] = useState(false)
  const [logError, setLogError] = useState('')

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

  const loadEmailLog = useCallback(async () => {
    setLogLoading(true)
    setLogError('')
    try {
      const data = await adminAPI.getEmailLog({
        user_id: recipient?.id,
        email: logEmailFilter.trim() || undefined,
        kind: logKind || undefined,
        skip: (logPage - 1) * logPageSize,
        limit: logPageSize,
      })
      setLogEntries(data.entries || [])
      setLogTotal(data.total ?? 0)
    } catch (error) {
      setLogError(error instanceof Error ? error.message : 'Failed to load email log')
    } finally {
      setLogLoading(false)
    }
  }, [recipient?.id, logEmailFilter, logKind, logPage, logPageSize])

  useEffect(() => {
    loadEmailLog()
  }, [loadEmailLog])

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
        description="Send mail to one user, or inspect the outbound log of who received what."
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

      <AdminPanel className="relative z-10 overflow-visible">
        <AdminPanelHeader title="Recipient" icon={UserRound} />
        <AdminPanelBody>
          <UserPicker selected={recipient} onSelect={setRecipient} disabled={!canSend} />
        </AdminPanelBody>
      </AdminPanel>

      <Tabs defaultValue="custom">
        <TabsList>
          <TabsTrigger value="custom">Custom email</TabsTrigger>
          <TabsTrigger value="conversion">Conversion templates</TabsTrigger>
          <TabsTrigger value="feedback">Feedback template</TabsTrigger>
          <TabsTrigger value="log">Sent log</TabsTrigger>
        </TabsList>

        <TabsContent value="custom" className="flex flex-col gap-4">
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

        <TabsContent value="conversion" className="flex flex-col gap-4">
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

        <TabsContent value="log" className="flex flex-col gap-4">
          <AdminPanel>
            <AdminPanelHeader
              title="Outbound log"
              icon={ScrollText}
              actions={<AdminRefreshButton onClick={loadEmailLog} loading={logLoading} />}
            />
            <AdminPanelBody className="space-y-4">
              <p className="text-sm text-ink-muted">
                Every send attempt is recorded here (drip, verification, feedback, custom). Selecting a
                recipient above filters to that user. Verification codes log the subject only, never the
                OTP.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="sm:w-56">
                  <label className="text-xs font-medium text-ink-dim block mb-1.5">Kind</label>
                  <select
                    className="w-full rounded-brand border border-surface-border/80 p-2.5 text-sm bg-white
                      focus:outline-none focus:ring-2 focus:ring-brand/30"
                    value={logKind}
                    onChange={(event) => {
                      setLogKind(event.target.value)
                      setLogPage(1)
                    }}
                  >
                    {EMAIL_LOG_KINDS.map((item) => (
                      <option key={item.value || 'all'} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-xs font-medium text-ink-dim block mb-1.5">To email contains</label>
                  <Input
                    placeholder="name@company.com"
                    value={logEmailInput}
                    onChange={(event) => setLogEmailInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        setLogEmailFilter(logEmailInput.trim())
                        setLogPage(1)
                      }
                    }}
                  />
                </div>
              </div>
              {recipient && (
                <p className="text-xs text-ink-dim">
                  Filtered to user #{recipient.id} ({recipient.email}). Clear the recipient to see everyone.
                </p>
              )}
            </AdminPanelBody>
          </AdminPanel>

          {logError && (
            <DashboardAlert variant="error">
              {logError}
              <Button variant="outline" size="sm" className="ml-3" onClick={loadEmailLog}>
                Retry
              </Button>
            </DashboardAlert>
          )}

          <AdminPanel>
            <AdminPanelHeader
              title="Sends"
              icon={Mail}
              actions={
                <span className="text-xs text-ink-muted tabular-nums">
                  {logTotal.toLocaleString()} entries
                </span>
              }
            />
            {logLoading && logEntries.length === 0 ? (
              <DashboardLoading message="Loading email log…" />
            ) : logEntries.length === 0 ? (
              <DashboardEmpty
                icon={ScrollText}
                title="No emails logged yet"
                description="Sends will appear here after the next verification, drip, or admin email."
              />
            ) : (
              <>
                <AdminPanelBody noPadding>
                  <AdminTableWrap>
                    <AdminTable>
                      <thead>
                        <tr>
                          <th>Time</th>
                          <th>User</th>
                          <th>Kind</th>
                          <th>Subject</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody className={logLoading ? 'opacity-60 transition-opacity' : undefined}>
                        {logEntries.map((entry) => {
                          const name = [entry.first_name, entry.last_name].filter(Boolean).join(' ')
                          const template =
                            entry.campaign_kind && entry.email_number
                              ? `${entry.campaign_kind} #${entry.email_number}`
                              : entry.template_key
                          return (
                            <tr key={entry.id}>
                              <td className="whitespace-nowrap text-xs text-ink-muted">
                                {new Date(entry.sent_at).toLocaleString()}
                              </td>
                              <td className="max-w-[220px]">
                                <p className="text-sm text-ink truncate">
                                  {name || entry.user_email || '—'}
                                  {entry.user_id ? (
                                    <span className="font-normal text-ink-muted"> #{entry.user_id}</span>
                                  ) : null}
                                </p>
                                <p className="text-xs text-ink-muted truncate">{entry.to_email}</p>
                              </td>
                              <td>
                                <p className="text-xs text-ink">{formatLogKind(entry.kind)}</p>
                                {template ? (
                                  <p className="text-xs text-ink-muted">{template}</p>
                                ) : null}
                              </td>
                              <td className="max-w-[280px]">
                                <p className="text-sm text-ink truncate">{entry.subject}</p>
                              </td>
                              <td>
                                <Badge variant={entry.status === 'sent' ? 'default' : 'secondary'}>
                                  {entry.status}
                                </Badge>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </AdminTable>
                  </AdminTableWrap>
                </AdminPanelBody>
                <AdminPagination
                  page={logPage}
                  pageSize={logPageSize}
                  total={logTotal}
                  onPageChange={setLogPage}
                  onPageSizeChange={(next) => {
                    setLogPageSize(next)
                    setLogPage(1)
                  }}
                  pageSizeOptions={[25, 50, 100]}
                  loading={logLoading}
                  noun="emails"
                />
              </>
            )}
          </AdminPanel>
        </TabsContent>
      </Tabs>
    </AdminPage>
  )
}
