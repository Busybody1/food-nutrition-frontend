'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CircleCheck, Inbox, LifeBuoy, RotateCcw, Search, UserRound } from 'lucide-react'
import { adminAPI } from '@/lib/api/admin'
import { useAdmin } from '@/lib/hooks/use-admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ApiError } from '@/types/api'
import type { SupportConversation, SupportMessage, SupportStatus } from '@/types/support'
import { SupportComposer } from '@/components/support/SupportComposer'
import { SupportMessageList } from '@/components/support/SupportMessageList'
import {
  AdminPage,
  AdminPageHeader,
  AdminPanel,
  AdminRefreshButton,
  DashboardAlert,
  DashboardEmpty,
  DashboardLoading,
  DashboardPanelHeader,
  DashboardPill,
  DashboardSegmented,
  DASHBOARD_ICON_STROKE,
  type DashboardTone,
} from '@/components/admin/admin-ui'
import { cn } from '@/lib/utils/cn'

const CANNED_REPLIES = [
  { label: 'Looking into it', text: 'Thanks, looking into this.' },
  { label: 'Need request id', text: 'Could you share the request id or barcode?' },
  { label: 'Resolved', text: 'This should be resolved now. Let us know if anything else comes up.' },
]

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'waiting_on_admin', label: 'Waiting' },
  { value: 'waiting_on_user', label: 'Waiting on user' },
  { value: 'closed', label: 'Closed' },
]

function displayName(convo: SupportConversation): string {
  const name = `${convo.first_name || ''} ${convo.last_name || ''}`.trim()
  return name || convo.email || `User #${convo.user_id}`
}

function initialsFor(convo: SupportConversation): string {
  const letters = `${(convo.first_name || '').trim().charAt(0)}${(convo.last_name || '').trim().charAt(0)}`
  if (letters) return letters.toUpperCase()
  const email = (convo.email || '').trim()
  return email ? email.charAt(0).toUpperCase() : '#'
}

function waitingLabel(iso: string | null): string {
  if (!iso) return '—'
  const mins = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000))
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  return `${Math.floor(hours / 24)}d`
}

function statusChip(status: SupportStatus): { label: string; tone: DashboardTone } {
  if (status === 'waiting_on_admin') return { label: 'Waiting', tone: 'orange' }
  if (status === 'waiting_on_user') return { label: 'Waiting on user', tone: 'indigo' }
  if (status === 'closed') return { label: 'Closed', tone: 'neutral' }
  return { label: 'Open', tone: 'green' }
}

function mergeMessages(current: SupportMessage[], incoming: SupportMessage[]): SupportMessage[] {
  const byId = new Map(current.map((item) => [item.id, item]))
  for (const item of incoming) byId.set(item.id, item)
  return Array.from(byId.values()).sort((a, b) => a.id - b.id)
}

function InitialsAvatar({ convo, className }: { convo: SupportConversation; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-dash-pill text-[11px] font-semibold text-dash-body',
        className
      )}
    >
      {initialsFor(convo)}
    </span>
  )
}

export function SupportInbox({ initialConversationId }: { initialConversationId?: number }) {
  const router = useRouter()
  const { hasPermission } = useAdmin()
  const canReply = hasPermission('admin:support:reply')

  const [conversations, setConversations] = useState<SupportConversation[]>([])
  const [total, setTotal] = useState(0)
  const [status, setStatus] = useState(initialConversationId ? '' : 'waiting_on_admin')
  const [query, setQuery] = useState('')
  const [appliedQuery, setAppliedQuery] = useState('')
  const [listLoading, setListLoading] = useState(true)
  const [listError, setListError] = useState('')
  const [selectedId, setSelectedId] = useState<number | null>(initialConversationId ?? null)
  const [thread, setThread] = useState<SupportConversation | null>(null)
  const [messages, setMessages] = useState<SupportMessage[]>([])
  const [threadLoading, setThreadLoading] = useState(false)
  const [draft, setDraft] = useState('')
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [sending, setSending] = useState(false)
  const [attaching, setAttaching] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const lastMessageId = messages.length > 0 ? messages[messages.length - 1].id : 0

  const loadList = useCallback(async () => {
    try {
      setListError('')
      const data = await adminAPI.getSupportConversations({
        status: status || undefined,
        q: appliedQuery || undefined,
        limit: 50,
        skip: 0,
      })
      setConversations(data.conversations)
      setTotal(data.count)
    } catch (err) {
      setListError(err instanceof Error ? err.message : 'Could not load conversations')
    } finally {
      setListLoading(false)
    }
  }, [appliedQuery, status])

  const loadThread = useCallback(async (id: number) => {
    try {
      setThreadLoading(true)
      const data = await adminAPI.getSupportConversation(id, { limit: 200 })
      setThread(data.conversation)
      setMessages(data.messages || [])
      await adminAPI.markSupportRead(id)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not load conversation')
    } finally {
      setThreadLoading(false)
    }
  }, [])

  useEffect(() => {
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    void loadList()
    const timer = window.setInterval(() => {
      if (!document.hidden) void loadList()
    }, 5000)
    return () => window.clearInterval(timer)
  }, [loadList])

  useEffect(() => {
    if (!selectedId) return
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    void loadThread(selectedId)
  }, [loadThread, selectedId])

  useEffect(() => {
    if (!selectedId || !thread) return
    const timer = window.setInterval(async () => {
      if (document.hidden) return
      try {
        const data = await adminAPI.getSupportMessages(selectedId, {
          after_id: lastMessageId || undefined,
          limit: 100,
        })
        if (data.messages?.length) {
          setMessages((current) => mergeMessages(current, data.messages))
        }
      } catch {

      }
    }, 3000)
    return () => window.clearInterval(timer)
  }, [lastMessageId, selectedId, thread])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [messages.length])

  const selectConversation = (id: number) => {
    setSelectedId(id)
    setActionError(null)
    router.replace(`/admin/support/${id}`)
  }

  const sendReply = async () => {
    if (!selectedId || !canReply) return
    const body = draft.trim()
    if (!body && !pendingFile) return
    setSending(true)
    setActionError(null)
    try {
      let attachmentUrl: string | undefined
      let attachmentType: string | undefined
      if (pendingFile) {
        setAttaching(true)
        const uploaded = await adminAPI.uploadSupportAttachment(pendingFile)
        attachmentUrl = uploaded.url
        attachmentType = uploaded.content_type
        setPendingFile(null)
        setAttaching(false)
      }
      const result = await adminAPI.replySupportConversation(selectedId, {
        body,
        attachment_url: attachmentUrl,
        attachment_content_type: attachmentType,
      })
      setThread(result.conversation)
      setMessages((current) => mergeMessages(current, [result.message]))
      setDraft('')
      void loadList()
    } catch (err) {
      setActionError(err instanceof ApiError || err instanceof Error ? err.message : 'Could not send reply')
    } finally {
      setSending(false)
      setAttaching(false)
    }
  }

  const closeThread = async () => {
    if (!selectedId || !canReply) return
    try {
      const result = await adminAPI.closeSupportConversation(selectedId)
      setThread(result.conversation)
      if (result.message) {
        const closedMessage = result.message
        setMessages((current) => mergeMessages(current, [closedMessage]))
      }
      void loadList()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not close conversation')
    }
  }

  const reopenThread = async () => {
    if (!selectedId || !canReply) return
    try {
      const result = await adminAPI.reopenSupportConversation(selectedId)
      setThread(result.conversation)
      void loadList()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not reopen conversation')
    }
  }

  return (
    <AdminPage>
      <AdminPageHeader
        title="Support"
        description="Reply to in-app chats. Discord is notified when a user is waiting."
        actions={<AdminRefreshButton onClick={() => void loadList()} loading={listLoading} />}
      />

      {listError ? <DashboardAlert variant="error">{listError}</DashboardAlert> : null}
      {actionError ? <DashboardAlert variant="error">{actionError}</DashboardAlert> : null}

      <div className="grid grid-cols-1 gap-5 lg:h-[clamp(560px,calc(100dvh_-_12rem),860px)] lg:grid-cols-[360px_minmax(0,1fr)]">
        <AdminPanel className="flex min-h-[420px] flex-col overflow-hidden lg:min-h-0">
          <DashboardPanelHeader
            title="Conversations"
            icon={Inbox}
            description={`${total} conversation${total === 1 ? '' : 's'}`}
          />
          <div className="space-y-2.5 border-b border-dash-border px-5 pb-4 pt-3">
            <form
              onSubmit={(event) => {
                event.preventDefault()
                setAppliedQuery(query.trim())
                setListLoading(true)
              }}
            >
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dash-dim"
                  strokeWidth={DASHBOARD_ICON_STROKE}
                  aria-hidden
                />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search email or preview"
                  aria-label="Search email or preview"
                  className="pl-9"
                />
              </div>
            </form>
            <DashboardSegmented
              value={status}
              options={STATUS_FILTERS}
              ariaLabel="Conversation status"
              onChange={(value) => {
                setStatus(value)
                setListLoading(true)
              }}
            />
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {listLoading && conversations.length === 0 ? (
              <DashboardLoading message="Loading conversations…" />
            ) : conversations.length === 0 ? (
              <DashboardEmpty
                icon={LifeBuoy}
                title="No conversations"
                description="When a dashboard user messages support, the thread appears here."
              />
            ) : (
              <ul>
                {conversations.map((item) => {
                  const chip = statusChip(item.status)
                  const active = item.id === selectedId
                  return (
                    <li key={item.id} className="border-b border-dash-border/70 last:border-b-0">
                      <button
                        type="button"
                        onClick={() => selectConversation(item.id)}
                        aria-current={active ? 'true' : undefined}
                        className={cn(
                          'flex w-full items-start gap-3 px-5 py-3.5 text-left transition-colors hover:bg-dash-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand/40',
                          active && 'bg-dash-teal-soft/60 hover:bg-dash-teal-soft/60'
                        )}
                      >
                        <InitialsAvatar convo={item} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-[13px] font-medium text-dash-ink">{displayName(item)}</p>
                            <span className="shrink-0 text-xs tabular-nums text-dash-dim">
                              {waitingLabel(item.last_message_at)}
                            </span>
                          </div>
                          <div className="mt-0.5 flex items-center gap-2">
                            <p className="min-w-0 flex-1 truncate text-xs text-dash-muted">
                              {item.last_message_preview || 'No messages yet'}
                            </p>
                            {item.unread_count > 0 ? (
                              <span className="dashboard-count-badge" title="Unread">
                                <span className="sr-only">Unread: </span>
                                {item.unread_count}
                              </span>
                            ) : null}
                          </div>
                          <div className="mt-2 flex items-center gap-1.5">
                            <DashboardPill tone={chip.tone}>{chip.label}</DashboardPill>
                            {item.plan_name ? (
                              <span className="truncate text-[11px] text-dash-dim">{item.plan_name}</span>
                            ) : null}
                          </div>
                        </div>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </AdminPanel>

        <AdminPanel className="flex min-h-[420px] flex-col overflow-hidden lg:min-h-0">
          {!selectedId ? (
            <DashboardEmpty
              icon={LifeBuoy}
              title="Select a conversation"
              description="Choose a thread from the list to reply."
              className="flex-1"
            />
          ) : threadLoading && !thread ? (
            <DashboardLoading message="Loading thread…" className="flex-1" />
          ) : !thread ? (
            <DashboardEmpty
              icon={LifeBuoy}
              title="Conversation not found"
              description="It may have been deleted."
              className="flex-1"
            />
          ) : (
            <>
              <div className="flex flex-col gap-3 border-b border-dash-border px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                  <InitialsAvatar convo={thread} className="h-9 w-9 text-xs" />
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-semibold leading-5 text-dash-ink">{displayName(thread)}</p>
                    <p className="truncate text-xs text-dash-muted">{thread.email}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <DashboardPill tone={statusChip(thread.status).tone}>{statusChip(thread.status).label}</DashboardPill>
                      {thread.plan_name ? <DashboardPill tone="outline">{thread.plan_name}</DashboardPill> : null}
                      <Link
                        href={`/admin/users/${thread.user_id}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-dash-teal-strong hover:underline"
                      >
                        <UserRound className="h-3.5 w-3.5" strokeWidth={DASHBOARD_ICON_STROKE} aria-hidden />
                        User #{thread.user_id}
                      </Link>
                    </div>
                  </div>
                </div>
                {canReply ? (
                  <div className="flex shrink-0 gap-2">
                    {thread.status === 'closed' ? (
                      <Button variant="outline" size="sm" className="h-9 gap-1.5" onClick={() => void reopenThread()}>
                        <RotateCcw className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} aria-hidden />
                        Reopen
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" className="h-9 gap-1.5" onClick={() => void closeThread()}>
                        <CircleCheck className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} aria-hidden />
                        Close
                      </Button>
                    )}
                  </div>
                ) : null}
              </div>
              <div ref={listRef} className="flex min-h-0 flex-1 flex-col overflow-y-auto">
                <SupportMessageList messages={messages} viewer="admin" className="px-5 py-5" />
              </div>
              {pendingFile ? (
                <p className="truncate px-5 pb-2 text-xs text-dash-muted">
                  Screenshot ready: {pendingFile.name}
                </p>
              ) : null}
              {canReply && thread.status !== 'closed' ? (
                <SupportComposer
                  value={draft}
                  onChange={setDraft}
                  onSend={() => void sendReply()}
                  onAttach={(file) => {
                    if (file.size > 5 * 1024 * 1024) {
                      setActionError('Screenshots must be 5 MB or smaller.')
                      return
                    }
                    setPendingFile(file)
                    setActionError(null)
                  }}
                  sending={sending}
                  attaching={attaching}
                  cannedReplies={CANNED_REPLIES}
                  placeholder="Reply to the user…"
                  className="px-5 py-4"
                />
              ) : (
                <p className="border-t border-dash-border bg-dash-hover px-5 py-3.5 text-xs text-dash-muted">
                  {thread.status === 'closed'
                    ? 'This conversation is closed. Reopen it to send another reply.'
                    : 'You do not have permission to reply.'}
                </p>
              )}
            </>
          )}
        </AdminPanel>
      </div>
    </AdminPage>
  )
}
