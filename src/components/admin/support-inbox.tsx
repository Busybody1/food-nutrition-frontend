'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LifeBuoy, Search, UserRound } from 'lucide-react'
import { adminAPI } from '@/lib/api/admin'
import { useAdmin } from '@/lib/hooks/use-admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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

function waitingLabel(iso: string | null): string {
  if (!iso) return '—'
  const mins = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000))
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  return `${Math.floor(hours / 24)}d`
}

function statusChip(status: SupportStatus): { label: string; className: string } {
  if (status === 'waiting_on_admin') {
    return { label: 'Waiting', className: 'bg-amber-50 text-amber-800 border-amber-200/80' }
  }
  if (status === 'waiting_on_user') {
    return { label: 'Waiting on user', className: 'bg-blue-50 text-blue-800 border-blue-200/80' }
  }
  if (status === 'closed') {
    return { label: 'Closed', className: 'bg-surface-elevated text-ink-muted border-surface-border/80' }
  }
  return { label: 'Open', className: 'bg-emerald-50 text-emerald-800 border-emerald-200/80' }
}

function mergeMessages(current: SupportMessage[], incoming: SupportMessage[]): SupportMessage[] {
  const byId = new Map(current.map((item) => [item.id, item]))
  for (const item of incoming) byId.set(item.id, item)
  return Array.from(byId.values()).sort((a, b) => a.id - b.id)
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
    void loadList()
    const timer = window.setInterval(() => {
      if (!document.hidden) void loadList()
    }, 5000)
    return () => window.clearInterval(timer)
  }, [loadList])

  useEffect(() => {
    if (!selectedId) return
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
        // Ignore poll errors.
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

      <div className="grid grid-cols-1 lg:grid-cols-[340px_minmax(0,1fr)] gap-4 min-h-[560px]">
        <AdminPanel className="flex flex-col min-h-[420px]">
          <div className="p-3 border-b border-surface-border/70 space-y-2">
            <form
              onSubmit={(event) => {
                event.preventDefault()
                setAppliedQuery(query.trim())
                setListLoading(true)
              }}
              className="flex gap-2"
            >
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-ink-dim" aria-hidden />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search email or preview"
                  className="pl-8"
                />
              </div>
            </form>
            <div className="flex flex-wrap gap-1.5">
              {STATUS_FILTERS.map((filter) => (
                <button
                  key={filter.value || 'all'}
                  type="button"
                  onClick={() => {
                    setStatus(filter.value)
                    setListLoading(true)
                  }}
                  className={cn(
                    'rounded-full border px-2.5 py-1 text-[11px] font-medium',
                    status === filter.value
                      ? 'border-brand/30 bg-brand-muted text-brand-strong'
                      : 'border-surface-border/80 text-ink-muted hover:text-ink'
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-ink-dim">{total} conversation{total === 1 ? '' : 's'}</p>
          </div>
          <div className="flex-1 overflow-y-auto">
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
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => selectConversation(item.id)}
                        className={cn(
                          'w-full text-left px-4 py-3 border-b border-surface-border/50 hover:bg-surface-elevated',
                          active && 'bg-brand-muted/40'
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium text-ink truncate">{displayName(item)}</p>
                          <span className="text-[11px] text-ink-dim tabular-nums shrink-0">
                            {waitingLabel(item.last_message_at)}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-ink-muted truncate">
                          {item.last_message_preview || 'No messages yet'}
                        </p>
                        <div className="mt-1.5 flex items-center gap-1.5">
                          <span className={cn('rounded-full border px-1.5 py-0.5 text-[10px] font-medium', chip.className)}>
                            {chip.label}
                          </span>
                          {item.plan_name ? (
                            <span className="text-[10px] text-ink-dim">{item.plan_name}</span>
                          ) : null}
                          {item.unread_count > 0 ? (
                            <span className="ml-auto h-2 w-2 rounded-full bg-violet-600" aria-label="Unread" />
                          ) : null}
                        </div>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </AdminPanel>

        <AdminPanel className="flex flex-col min-h-[420px]">
          {!selectedId ? (
            <DashboardEmpty
              icon={LifeBuoy}
              title="Select a conversation"
              description="Choose a thread from the list to reply."
            />
          ) : threadLoading && !thread ? (
            <DashboardLoading message="Loading thread…" />
          ) : !thread ? (
            <DashboardEmpty icon={LifeBuoy} title="Conversation not found" description="It may have been deleted." />
          ) : (
            <>
              <div className="flex items-start justify-between gap-3 border-b border-surface-border/70 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink truncate">{displayName(thread)}</p>
                  <p className="text-xs text-ink-muted truncate">{thread.email}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <Badge className={statusChip(thread.status).className}>{statusChip(thread.status).label}</Badge>
                    {thread.plan_name ? <span className="text-[11px] text-ink-dim">{thread.plan_name}</span> : null}
                    <Link
                      href={`/admin/users/${thread.user_id}`}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-brand-strong hover:underline"
                    >
                      <UserRound className="h-3 w-3" />
                      User #{thread.user_id}
                    </Link>
                  </div>
                </div>
                {canReply ? (
                  <div className="flex gap-2 shrink-0">
                    {thread.status === 'closed' ? (
                      <Button variant="outline" size="sm" onClick={() => void reopenThread()}>
                        Reopen
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => void closeThread()}>
                        Close
                      </Button>
                    )}
                  </div>
                ) : null}
              </div>
              <div ref={listRef} className="flex-1 min-h-0 overflow-y-auto">
                <SupportMessageList messages={messages} viewer="admin" />
              </div>
              {pendingFile ? (
                <p className="px-4 pb-1 text-[11px] text-ink-muted truncate">
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
                />
              ) : (
                <p className="px-4 py-3 text-xs text-ink-muted border-t border-surface-border/70">
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
