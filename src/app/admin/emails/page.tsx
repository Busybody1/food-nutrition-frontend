'use client'

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { adminAPI, type AdminUser, type EmailLogEntry } from '@/lib/api/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAdmin } from '@/lib/hooks/use-admin'
import { cn } from '@/lib/utils/cn'
import {
  AlertCircle,
  AtSign,
  Eye,
  Mail,
  MessageSquareText,
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
  DashboardPill,
  DASHBOARD_ICON_STROKE,
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

type EmailRecipient = {
  userId: number | null
  email: string
  firstName?: string
  lastName?: string
  fromDirectory: boolean
}

function isLikelyEmail(value: string): boolean {
  const trimmed = value.trim()
  if (!trimmed || trimmed.length > 320) return false
  if (/[\s,;<>\r\n]/.test(trimmed)) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)
}

function recipientFromUser(user: AdminUser): EmailRecipient {
  return {
    userId: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    fromDirectory: true,
  }
}

function recipientFromEmail(email: string): EmailRecipient {
  return {
    userId: null,
    email: email.trim().toLowerCase(),
    fromDirectory: false,
  }
}

function recipientSendPayload(recipient: EmailRecipient): { user_id?: number; email?: string } {
  if (recipient.userId != null) return { user_id: recipient.userId }
  return { email: recipient.email }
}

function formatLogKind(kind: string): string {
  const match = EMAIL_LOG_KINDS.find((item) => item.value === kind)
  return match?.label || kind
}

function initialsFrom(first?: string | null, last?: string | null, fallback?: string | null): string {
  const letters = `${(first || '').trim().charAt(0)}${(last || '').trim().charAt(0)}`
  if (letters) return letters.toUpperCase()
  const backup = (fallback || '').trim()
  return backup ? backup.charAt(0).toUpperCase() : '#'
}

function InitialsCircle({ text }: { text: string }) {
  return (
    <span
      aria-hidden
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-dash-pill text-[11px] font-semibold text-dash-body"
    >
      {text}
    </span>
  )
}

function BodyModeToggle({
  value,
  onChange,
  disabled,
}: {
  value: 'html' | 'plain'
  onChange: (next: 'html' | 'plain') => void
  disabled?: boolean
}) {
  const options: { value: 'html' | 'plain'; label: string }[] = [
    { value: 'html', label: 'HTML' },
    { value: 'plain', label: 'Plain text' },
  ]
  return (
    <div className="dashboard-segmented" role="group" aria-label="Body format">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          disabled={disabled}
          aria-pressed={value === option.value}
          className={cn(
            'dashboard-segmented-btn disabled:cursor-not-allowed disabled:opacity-50',
            value === option.value && 'dashboard-segmented-btn-active'
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
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
  onDraftChange,
  disabled,
}: {
  selected: EmailRecipient | null
  onSelect: (user: EmailRecipient | null) => void
  onDraftChange?: (query: string) => void
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
  const typedIsEmail = isLikelyEmail(trimmed)
  const exactEmailMatch = results.some(
    (user) => user.email.toLowerCase() === trimmed.toLowerCase()
  )
  const showExternalOption = typedIsEmail && !exactEmailMatch
  const showMenu = menuOpen && !selected && (trimmed.length >= 2 || typedIsEmail)

  const applyRecipient = (next: EmailRecipient) => {
    onSelect(next)
    setQuery('')
    onDraftChange?.('')
    setResults([])
    setMenuOpen(false)
  }

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
        <div className="flex items-center justify-between gap-3 rounded-xl border border-dash-border bg-dash-hover px-3 py-2.5">
          <div className="flex min-w-0 items-center gap-3">
            {selected.fromDirectory ? (
              <InitialsCircle text={initialsFrom(selected.firstName, selected.lastName, selected.email)} />
            ) : (
              <span
                aria-hidden
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-dash-border bg-white text-dash-muted"
              >
                <AtSign className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} />
              </span>
            )}
            <div className="min-w-0">
              {selected.fromDirectory ? (
                <>
                  <p className="truncate text-[13px] font-medium text-dash-ink">
                    {[selected.firstName, selected.lastName].filter(Boolean).join(' ') || 'User'}{' '}
                    {selected.userId != null ? (
                      <span className="font-normal text-dash-muted">#{selected.userId}</span>
                    ) : null}
                  </p>
                  <p className="truncate text-xs text-dash-muted">{selected.email}</p>
                </>
              ) : (
                <>
                  <p className="truncate text-[13px] font-medium text-dash-ink">{selected.email}</p>
                  <p className="text-xs text-dash-muted">Not in user list</p>
                </>
              )}
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 shrink-0"
            disabled={disabled}
            onClick={() => {
              onSelect(null)
              setQuery('')
              onDraftChange?.('')
              setMenuOpen(false)
            }}
          >
            Change
          </Button>
        </div>
      ) : (
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dash-dim"
            strokeWidth={DASHBOARD_ICON_STROKE}
            aria-hidden
          />
          <Input
            ref={inputRef}
            className="pl-9"
            placeholder="Search users, or type any email…"
            value={query}
            onChange={(event) => {
              const next = event.target.value
              setQuery(next)
              onDraftChange?.(next)
              setMenuOpen(true)
              if (next.trim().length < 2) setResults([])
            }}
            onFocus={() => {
              if (trimmed.length >= 2 || typedIsEmail) setMenuOpen(true)
            }}
            onKeyDown={(event) => {
              if (event.key !== 'Enter' || !typedIsEmail) return
              event.preventDefault()
              const match = results.find(
                (user) => user.email.toLowerCase() === trimmed.toLowerCase()
              )
              applyRecipient(match ? recipientFromUser(match) : recipientFromEmail(trimmed))
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
                {showExternalOption && (
                  <button
                    type="button"
                    role="option"
                    aria-selected={false}
                    className="flex w-full cursor-pointer items-center gap-3 border-b border-dash-border/70 px-3 py-2.5 text-left transition-colors hover:bg-dash-hover"
                    onClick={() => applyRecipient(recipientFromEmail(trimmed))}
                  >
                    <span
                      aria-hidden
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-dash-border bg-white text-dash-muted"
                    >
                      <AtSign className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] text-dash-ink">Send to {trimmed.toLowerCase()}</span>
                      <span className="block text-xs text-dash-muted">Not in user list</span>
                    </span>
                  </button>
                )}
                {searching && <p className="px-3 py-2.5 text-xs text-dash-muted">Searching…</p>}
                {!searching && results.length === 0 && !showExternalOption && (
                  <p className="px-3 py-2.5 text-xs text-dash-muted">No users found</p>
                )}
                {results.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    role="option"
                    aria-selected={false}
                    className="flex w-full cursor-pointer items-center gap-3 border-b border-dash-border/70 px-3 py-2.5 text-left transition-colors last:border-0 hover:bg-dash-hover"
                    onClick={() => applyRecipient(recipientFromUser(user))}
                  >
                    <InitialsCircle text={initialsFrom(user.first_name, user.last_name, user.email)} />
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] text-dash-ink">
                        {[user.first_name, user.last_name].filter(Boolean).join(' ') || 'User'}
                      </span>
                      <span className="block truncate text-xs text-dash-muted">{user.email}</span>
                    </span>
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

  const [recipient, setRecipient] = useState<EmailRecipient | null>(null)
  const [draftQuery, setDraftQuery] = useState('')
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [emailStatus, setEmailStatus] = useState<{
    resend_configured: boolean
    smtp_configured: boolean
    provider: string
  } | null>(null)

  const [mode, setMode] = useState<'html' | 'plain'>('html')
  const [subject, setSubject] = useState('')
  const [bodyHtml, setBodyHtml] = useState('<p>Hi {{first_name}},</p>\n<p></p>')
  const [bodyText, setBodyText] = useState('Hi {{first_name}},\n\n')
  const [wrapBranded, setWrapBranded] = useState(true)
  const [fromName, setFromName] = useState('Calorie API')
  const [sendingCustom, setSendingCustom] = useState(false)

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

  const effectiveRecipient = useMemo(() => {
    if (recipient) return recipient
    return isLikelyEmail(draftQuery) ? recipientFromEmail(draftQuery) : null
  }, [recipient, draftQuery])

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
        user_id: recipient?.userId ?? undefined,
        email:
          logEmailFilter.trim() ||
          (recipient && !recipient.fromDirectory ? recipient.email : undefined),
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
  }, [recipient, logEmailFilter, logKind, logPage, logPageSize])

  useEffect(() => {
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    loadEmailLog()
  }, [loadEmailLog])

  const loadPreview = useCallback(async () => {
    if (!selectedTemplate) return
    setPreviewing(true)
    setFeedback(null)
    try {
      const res = await adminAPI.previewConversionEmail({
        ...(effectiveRecipient ? recipientSendPayload(effectiveRecipient) : {}),
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
  }, [effectiveRecipient, selectedTemplate])

  const sendCustom = async () => {
    if (!canSend || !effectiveRecipient || !subject.trim()) return
    const html = mode === 'html' ? bodyHtml.trim() : undefined
    const text = mode === 'plain' ? bodyText.trim() : undefined
    if (!html && !text) return

    setSendingCustom(true)
    setFeedback(null)
    try {
      const res = await adminAPI.sendCustomEmail({
        ...recipientSendPayload(effectiveRecipient),
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
    if (!canSend || !effectiveRecipient || !selectedTemplate) return
    setSendingTemplate(true)
    setFeedback(null)
    try {
      const res = await adminAPI.sendConversionEmail({
        ...recipientSendPayload(effectiveRecipient),
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
    if (!canSend || recipient?.userId == null) return
    setSendingTemplate(true)
    setFeedback(null)
    try {
      const res = await adminAPI.sendUserFeedbackEmail(recipient.userId)
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
        description="Send mail to a user or any email address, or inspect the outbound log of who received what."
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
            Email is not configured on the API. Set <code className="font-mono text-xs">RESEND_API_KEY</code>{' '}
            before sending.
          </span>
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
          <UserPicker
            selected={recipient}
            onSelect={setRecipient}
            onDraftChange={setDraftQuery}
            disabled={!canSend}
          />
          <p className="dashboard-field-hint">
            Custom and conversion emails can go to an address that is not in the user list. Feedback
            emails still require an existing user.
          </p>
        </AdminPanelBody>
      </AdminPanel>

      <Tabs defaultValue="custom">
        <TabsList>
          <TabsTrigger value="custom">Custom email</TabsTrigger>
          <TabsTrigger value="conversion">Conversion templates</TabsTrigger>
          <TabsTrigger value="feedback">Feedback template</TabsTrigger>
          <TabsTrigger value="log">Sent log</TabsTrigger>
        </TabsList>

        <TabsContent value="custom" className="flex flex-col gap-5">
          <AdminPanel>
            <AdminPanelHeader
              title="Compose"
              icon={Mail}
              actions={<BodyModeToggle value={mode} onChange={setMode} disabled={!canSend} />}
            />
            <AdminPanelBody className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="custom-email-from" className="dashboard-field-label">
                    From name
                  </label>
                  <Input
                    id="custom-email-from"
                    value={fromName}
                    onChange={(event) => setFromName(event.target.value)}
                    disabled={!canSend}
                    placeholder="Calorie API"
                  />
                </div>

                <div>
                  <label htmlFor="custom-email-subject" className="dashboard-field-label">
                    Subject
                  </label>
                  <Input
                    id="custom-email-subject"
                    value={subject}
                    onChange={(event) => setSubject(event.target.value)}
                    disabled={!canSend}
                    placeholder="Quick note about your API integration"
                  />
                </div>
              </div>

              {mode === 'html' ? (
                <div>
                  <label htmlFor="custom-email-html" className="dashboard-field-label">
                    HTML body
                  </label>
                  <textarea
                    id="custom-email-html"
                    className="dashboard-textarea min-h-[200px] font-mono text-xs leading-5"
                    value={bodyHtml}
                    onChange={(event) => setBodyHtml(event.target.value)}
                    disabled={!canSend}
                  />
                  <label className="mt-2.5 flex items-center gap-2 text-xs text-dash-body">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-dash-border accent-dash-teal-strong"
                      checked={wrapBranded}
                      onChange={(event) => setWrapBranded(event.target.checked)}
                      disabled={!canSend}
                    />
                    Wrap in branded Calorie API / announcement layout
                  </label>
                </div>
              ) : (
                <div>
                  <label htmlFor="custom-email-text" className="dashboard-field-label">
                    Plain text body
                  </label>
                  <textarea
                    id="custom-email-text"
                    className="dashboard-textarea min-h-[200px]"
                    value={bodyText}
                    onChange={(event) => setBodyText(event.target.value)}
                    disabled={!canSend}
                  />
                  <p className="dashboard-field-hint">
                    Sent as plain text (with a simple HTML fallback for some clients).
                  </p>
                </div>
              )}

              <p className="text-xs text-dash-muted">
                Personalize with <code className="font-mono text-xs text-dash-body">{'{{first_name}}'}</code>.
              </p>
            </AdminPanelBody>
            {canSend && (
              <div className="flex justify-end gap-2 border-t border-dash-border px-5 py-4">
                <Button
                  size="sm"
                  className="h-9 gap-1.5"
                  onClick={sendCustom}
                  disabled={
                    sendingCustom ||
                    !effectiveRecipient ||
                    !subject.trim() ||
                    (mode === 'html' ? !bodyHtml.trim() : !bodyText.trim())
                  }
                >
                  <Send className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} aria-hidden />
                  {sendingCustom ? 'Sending…' : 'Send custom email'}
                </Button>
              </div>
            )}
          </AdminPanel>
        </TabsContent>

        <TabsContent value="conversion" className="flex flex-col gap-5">
          <div className="dashboard-grid-narrow-wide">
            <AdminPanel className="self-start">
              <AdminPanelHeader title="Template" icon={Send} />
              <AdminPanelBody>
                <label htmlFor="conversion-template" className="dashboard-field-label">
                  Conversion drip email
                </label>
                <select
                  id="conversion-template"
                  className="dashboard-select w-full"
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
                <p className="dashboard-field-hint">
                  Manual sends do not advance or suppress the automated drip schedule. You can send a
                  template to an address that is not in the database.
                </p>
              </AdminPanelBody>
              <div className="flex flex-wrap justify-end gap-2 border-t border-dash-border px-5 py-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 gap-1.5"
                  onClick={loadPreview}
                  disabled={!selectedTemplate || previewing}
                >
                  <Eye className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} aria-hidden />
                  {previewing ? 'Loading…' : 'Preview'}
                </Button>
                {canSend && (
                  <Button
                    size="sm"
                    className="h-9 gap-1.5"
                    onClick={sendTemplate}
                    disabled={!effectiveRecipient || !selectedTemplate || sendingTemplate}
                  >
                    <Send className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} aria-hidden />
                    {sendingTemplate ? 'Sending…' : 'Send template'}
                  </Button>
                )}
              </div>
            </AdminPanel>

            <AdminPanel>
              <AdminPanelHeader
                title="Preview"
                icon={Eye}
                actions={
                  preview ? <DashboardPill tone="neutral">Variant: {preview.variant}</DashboardPill> : undefined
                }
              />
              <AdminPanelBody className="space-y-3">
                {!preview ? (
                  <DashboardEmpty
                    icon={Eye}
                    title="No preview loaded"
                    description="Choose a template and click Preview to inspect subject and HTML."
                  />
                ) : (
                  <>
                    <div className="rounded-xl border border-dash-border px-4 py-3">
                      <p className="text-xs text-dash-muted">Subject</p>
                      <p className="mt-0.5 text-[13px] font-medium text-dash-ink">{preview.subject}</p>
                    </div>
                    <div className="overflow-hidden rounded-xl border border-dash-border bg-dash-hover p-4">
                      {preview.html ? (
                        <iframe
                          title="Email preview"
                          sandbox=""
                          srcDoc={preview.html}
                          className="h-[420px] w-full rounded-lg border border-dash-border bg-white"
                        />
                      ) : (
                        <pre className="whitespace-pre-wrap rounded-lg border border-dash-border bg-white p-4 font-sans text-[13px] leading-relaxed text-dash-ink">
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
            <AdminPanelHeader title="Feedback request" icon={MessageSquareText} />
            <AdminPanelBody>
              <p className="max-w-3xl text-[13px] leading-5 text-dash-muted">
                Sends the standard plain-text feedback request (reply-to Resend Receiving inbox). Same
                action as on the user detail page. The recipient must already exist in the user list.
              </p>
            </AdminPanelBody>
            {canSend && (
              <div className="flex justify-end gap-2 border-t border-dash-border px-5 py-4">
                <Button
                  size="sm"
                  className="h-9 gap-1.5"
                  onClick={sendFeedbackTemplate}
                  disabled={recipient?.userId == null || sendingTemplate}
                >
                  <Send className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} aria-hidden />
                  {sendingTemplate ? 'Sending…' : 'Send feedback email'}
                </Button>
              </div>
            )}
          </AdminPanel>
        </TabsContent>

        <TabsContent value="log" className="flex flex-col gap-5">
          <AdminPanel>
            <AdminPanelHeader
              title="Outbound log"
              icon={ScrollText}
              description="Every send attempt is recorded here (drip, verification, feedback, custom). Selecting a recipient above filters to that user. Verification codes log the subject only, never the OTP."
              actions={
                <>
                  <span className="dashboard-meta-pill tabular-nums">
                    {logTotal.toLocaleString()} entries
                  </span>
                  <AdminRefreshButton onClick={loadEmailLog} loading={logLoading} />
                </>
              }
            />
            <div className="flex flex-col gap-3 px-5 pb-4 pt-3 sm:flex-row sm:items-end">
              <div className="sm:w-56">
                <label htmlFor="email-log-kind" className="dashboard-field-label">
                  Kind
                </label>
                <select
                  id="email-log-kind"
                  className="dashboard-select w-full"
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
              <div className="min-w-0 flex-1 sm:max-w-md">
                <label htmlFor="email-log-to" className="dashboard-field-label">
                  To email contains
                </label>
                <Input
                  id="email-log-to"
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
              <p className="px-5 pb-4 text-xs text-dash-muted">
                {recipient.fromDirectory && recipient.userId != null
                  ? `Filtered to user #${recipient.userId} (${recipient.email}). Clear the recipient to see everyone.`
                  : `Filtered to ${recipient.email}. Clear the recipient to see everyone.`}
              </p>
            )}

            {logError && (
              <div className="px-5 pb-4">
                <DashboardAlert variant="error">
                  <span className="min-w-0 flex-1">{logError}</span>
                  <Button variant="outline" size="sm" className="h-8" onClick={loadEmailLog}>
                    Retry
                  </Button>
                </DashboardAlert>
              </div>
            )}

            {logLoading && logEntries.length === 0 ? (
              <DashboardLoading message="Loading email log…" className="border-t border-dash-border" />
            ) : logEntries.length === 0 ? (
              <DashboardEmpty
                icon={ScrollText}
                title="No emails logged yet"
                description="Sends will appear here after the next verification, drip, or admin email."
                className="border-t border-dash-border"
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
                              <td className="whitespace-nowrap text-xs tabular-nums text-dash-muted">
                                {new Date(entry.sent_at).toLocaleString()}
                              </td>
                              <td className="max-w-[260px]">
                                <div className="flex min-w-0 items-center gap-3">
                                  <InitialsCircle
                                    text={initialsFrom(
                                      entry.first_name,
                                      entry.last_name,
                                      entry.user_email || entry.to_email
                                    )}
                                  />
                                  <div className="min-w-0">
                                    <p className="truncate font-medium text-dash-ink">
                                      {name || entry.user_email || '—'}
                                      {entry.user_id ? (
                                        <span className="font-normal text-dash-muted"> #{entry.user_id}</span>
                                      ) : null}
                                    </p>
                                    <p className="truncate text-xs text-dash-muted">{entry.to_email}</p>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <p className="text-dash-ink">{formatLogKind(entry.kind)}</p>
                                {template ? (
                                  <p className="text-xs text-dash-muted">{template}</p>
                                ) : null}
                              </td>
                              <td className="max-w-[280px]">
                                <p className="truncate text-dash-ink">{entry.subject}</p>
                              </td>
                              <td>
                                <DashboardPill tone={entry.status === 'sent' ? 'green' : 'rose'}>
                                  {entry.status}
                                </DashboardPill>
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
