'use client'

import { cn } from '@/lib/utils/cn'
import type { SupportMessage, SupportSenderRole } from '@/types/support'

function formatStamp(value: string | null): string {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function alignFor(role: SupportSenderRole, viewer: 'user' | 'admin'): 'left' | 'right' | 'center' {
  if (role === 'system') return 'center'
  if (viewer === 'user') return role === 'user' ? 'right' : 'left'
  return role === 'admin' ? 'right' : 'left'
}

export function SupportMessageList({
  messages,
  viewer,
  className,
}: {
  messages: SupportMessage[]
  viewer: 'user' | 'admin'
  className?: string
}) {
  if (messages.length === 0) {
    return (
      <div className={cn('flex flex-1 items-center justify-center px-6 py-10', className)}>
        <p className="text-sm text-ink-muted text-center max-w-xs">
          Send a message and the team will reply here. Typical response is one business day.
        </p>
      </div>
    )
  }

  return (
    <div
      className={cn('flex flex-col gap-3 overflow-y-auto px-4 py-4', className)}
      aria-live="polite"
      aria-relevant="additions"
    >
      {messages.map((message) => {
        const align = alignFor(message.sender_role, viewer)
        if (align === 'center') {
          return (
            <p
              key={message.id}
              className="self-center text-[11px] text-ink-dim text-center max-w-[90%]"
            >
              {message.body}
            </p>
          )
        }
        const mine = align === 'right'
        return (
          <div
            key={message.id}
            className={cn('flex flex-col max-w-[85%]', mine ? 'self-end items-end' : 'self-start items-start')}
          >
            <div
              className={cn(
                'rounded-brand px-3 py-2 text-sm whitespace-pre-wrap break-words',
                mine
                  ? 'bg-brand-muted text-brand-strong'
                  : 'bg-surface-elevated text-ink border border-surface-border/70'
              )}
            >
              {message.body ? <p>{message.body}</p> : null}
              {message.attachment_url ? (
                // Chat screenshots are already hosted on our S3/CDN allowlist.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={message.attachment_url}
                  alt="Screenshot attached to this support message"
                  className={cn('mt-2 max-h-48 rounded-md object-contain', message.body ? '' : 'mt-0')}
                />
              ) : null}
            </div>
            <span className="mt-1 text-[10px] text-ink-dim tabular-nums">
              {formatStamp(message.created_at)}
            </span>
          </div>
        )
      })}
    </div>
  )
}
