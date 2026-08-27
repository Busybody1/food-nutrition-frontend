'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { MessageCircle, X } from 'lucide-react'
import { api } from '@/lib/api/client'
import { useAuth } from '@/lib/hooks/use-auth'
import { ApiError } from '@/types/api'
import type { SupportConversation, SupportMessage } from '@/types/support'
import { SupportComposer } from './SupportComposer'
import { SupportMessageList } from './SupportMessageList'
import { cn } from '@/lib/utils/cn'

const OPEN_EVENT = 'calorie-api:open-support'

type SupportChatContextValue = {
  isOpen: boolean
  unreadCount: number
  openSupport: () => void
  closeSupport: () => void
}

const SupportChatContext = createContext<SupportChatContextValue | null>(null)

export function useSupportChat(): SupportChatContextValue {
  const value = useContext(SupportChatContext)
  if (!value) {
    throw new Error('useSupportChat must be used inside SupportChatProvider')
  }
  return value
}

function mergeMessages(current: SupportMessage[], incoming: SupportMessage[]): SupportMessage[] {
  if (incoming.length === 0) return current
  const byId = new Map(current.map((item) => [item.id, item]))
  for (const item of incoming) {
    byId.set(item.id, item)
  }
  return Array.from(byId.values()).sort((a, b) => a.id - b.id)
}

export function SupportChatProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [conversation, setConversation] = useState<SupportConversation | null>(null)
  const [messages, setMessages] = useState<SupportMessage[]>([])
  const [draft, setDraft] = useState('')
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [attaching, setAttaching] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)
  const lastMessageId = messages.length > 0 ? messages[messages.length - 1].id : 0

  const openSupport = useCallback(() => setIsOpen(true), [])
  const closeSupport = useCallback(() => setIsOpen(false), [])

  const scrollToBottom = useCallback(() => {
    const node = listRef.current
    if (!node) return
    node.scrollTop = node.scrollHeight
  }, [])

  const refreshUnread = useCallback(async () => {
    if (!isAuthenticated) return
    try {
      const res = await api.support.unreadCount()
      const count = (res.data as { count?: number } | undefined)?.count ?? 0
      setUnreadCount(typeof count === 'number' ? count : 0)
    } catch {
      // Badge polling should stay silent.
    }
  }, [isAuthenticated])

  const loadConversation = useCallback(async () => {
    if (!isAuthenticated) return
    try {
      const res = await api.support.getConversation(100)
      const payload = res.data as { conversation: SupportConversation | null; messages: SupportMessage[] }
      setConversation(payload.conversation)
      setMessages(payload.messages || [])
    } catch {
      // Keep the last good snapshot.
    }
  }, [isAuthenticated])

  const pollMessages = useCallback(async () => {
    if (!isAuthenticated || !conversation) return
    try {
      const res = await api.support.getMessages(lastMessageId || undefined, 100)
      const payload = res.data as { messages: SupportMessage[] }
      if (payload.messages?.length) {
        setMessages((current) => mergeMessages(current, payload.messages))
      }
    } catch {
      // Ignore transient poll errors.
    }
  }, [conversation, isAuthenticated, lastMessageId])

  const markRead = useCallback(async () => {
    if (!isAuthenticated || !conversation) return
    try {
      await api.support.markRead()
      setUnreadCount(0)
    } catch {
      // Read receipts are best-effort.
    }
  }, [conversation, isAuthenticated])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    if (params.get('support') === '1') setIsOpen(true)
  }, [])

  useEffect(() => {
    const onOpen = () => setIsOpen(true)
    window.addEventListener(OPEN_EVENT, onOpen)
    return () => window.removeEventListener(OPEN_EVENT, onOpen)
  }, [])

  useEffect(() => {
    if (!isAuthenticated || loading) return
    void refreshUnread()
    void loadConversation()
  }, [isAuthenticated, loading, loadConversation, refreshUnread])

  useEffect(() => {
    if (!isAuthenticated) return

    const tick = () => {
      if (document.hidden) return
      if (isOpen) {
        void (conversation ? pollMessages() : loadConversation())
        void markRead()
      } else {
        void refreshUnread()
      }
    }

    const intervalMs = isOpen ? 3000 : 30000
    const timer = window.setInterval(tick, intervalMs)
    const onVisibility = () => {
      if (!document.hidden) tick()
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [conversation, isAuthenticated, isOpen, loadConversation, markRead, pollMessages, refreshUnread])

  useEffect(() => {
    if (isOpen) {
      void loadConversation()
      void markRead()
    }
  }, [isOpen, loadConversation, markRead])

  useEffect(() => {
    if (isOpen) scrollToBottom()
  }, [isOpen, messages.length, scrollToBottom])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen])

  const send = useCallback(async () => {
    const body = draft.trim()
    if (!body && !pendingFile) return
    setError(null)
    setSending(true)
    try {
      let attachmentUrl: string | undefined
      let attachmentType: string | undefined
      if (pendingFile) {
        setAttaching(true)
        const uploaded = await api.support.uploadAttachment(pendingFile)
        const data = uploaded.data as { url: string; content_type: string }
        attachmentUrl = data.url
        attachmentType = data.content_type
        setPendingFile(null)
        setAttaching(false)
      }
      const res = await api.support.postMessage({
        body,
        attachment_url: attachmentUrl,
        attachment_content_type: attachmentType,
      })
      const payload = res.data as {
        conversation: SupportConversation
        message: SupportMessage
      }
      setConversation(payload.conversation)
      setMessages((current) => mergeMessages(current, [payload.message]))
      setDraft('')
      setUnreadCount(0)
    } catch (err) {
      const fallback = 'Could not send your message. Please try again.'
      setError(err instanceof ApiError || err instanceof Error ? err.message : fallback)
    } finally {
      setSending(false)
      setAttaching(false)
    }
  }, [draft, pendingFile])

  const onAttach = useCallback((file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      setError('Screenshots must be 5 MB or smaller.')
      return
    }
    if (!file.type.startsWith('image/')) {
      setError('Please attach a JPEG, PNG, or WebP image.')
      return
    }
    setError(null)
    setPendingFile(file)
  }, [])

  const contextValue = useMemo(
    () => ({ isOpen, unreadCount, openSupport, closeSupport }),
    [closeSupport, isOpen, openSupport, unreadCount]
  )

  return (
    <SupportChatContext.Provider value={contextValue}>
      {children}
      {isAuthenticated && !loading ? (
        <>
          <div className={cn('fixed z-40 bottom-5 right-5', isOpen && 'hidden')}>
            <button
              type="button"
              onClick={openSupport}
              className={cn(
                'relative flex h-12 w-12 items-center justify-center rounded-full bg-violet-600 text-white shadow-lg',
                'hover:bg-violet-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40'
              )}
              aria-label={unreadCount > 0 ? `Open support chat, ${unreadCount} unread` : 'Open support chat'}
            >
              <MessageCircle className="h-5 w-5" />
              {unreadCount > 0 ? (
                <span className="absolute -top-1 -right-1 min-w-[18px] rounded-full bg-red-600 px-1 text-[10px] font-semibold leading-4 text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              ) : null}
            </button>
          </div>

          {isOpen ? (
            <div
              className="fixed inset-0 z-40 sm:inset-auto sm:bottom-5 sm:right-5 sm:h-[min(560px,calc(100vh-2.5rem))] sm:w-[380px]"
              role="dialog"
              aria-modal="true"
              aria-labelledby="support-chat-title"
            >
              <div className="flex h-full flex-col bg-white shadow-2xl sm:rounded-brand sm:border sm:border-surface-border/80 overflow-hidden">
                <header className="flex items-center justify-between border-b border-surface-border/70 px-4 py-3">
                  <div>
                    <h2 id="support-chat-title" className="text-sm font-semibold text-ink">
                      Support
                    </h2>
                    <p className="text-[11px] text-ink-muted">Chat with the Calorie API team</p>
                  </div>
                  <button
                    type="button"
                    onClick={closeSupport}
                    className="rounded-brand p-1.5 text-ink-muted hover:bg-surface-elevated hover:text-ink"
                    aria-label="Close support chat"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </header>
                <div ref={listRef} className="flex-1 min-h-0 overflow-y-auto">
                  <SupportMessageList messages={messages} viewer="user" />
                </div>
                {pendingFile ? (
                  <p className="px-4 pb-1 text-[11px] text-ink-muted truncate">
                    Screenshot ready: {pendingFile.name}
                  </p>
                ) : null}
                <SupportComposer
                  value={draft}
                  onChange={setDraft}
                  onSend={() => void send()}
                  onAttach={onAttach}
                  sending={sending}
                  attaching={attaching}
                  error={error}
                  placeholder="How can we help?"
                />
              </div>
            </div>
          ) : null}
        </>
      ) : null}
    </SupportChatContext.Provider>
  )
}

export function requestOpenSupportChat(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(OPEN_EVENT))
  }
}
