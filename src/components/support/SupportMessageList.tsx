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
        <p className="max-w-xs text-center text-[13px] text-dash-muted">
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
              className="max-w-[90%] self-center rounded-full bg-dash-hover px-3 py-1 text-center text-[11px] text-dash-dim"
            >
              {message.body}
            </p>
          )
        }
        const mine = align === 'right'
        return (
          <div
            key={message.id}
            className={cn('flex max-w-[85%] flex-col', mine ? 'items-end self-end' : 'items-start self-start')}
          >
            <div
              className={cn(
                'whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-[13px] leading-5',
                mine ? 'rounded-br-md bg-dash-teal-strong text-white' : 'rounded-bl-md bg-dash-pill text-dash-ink'
              )}
            >
              {message.body ? <p>{message.body}</p> : null}
              {message.attachment_url ? (
                <img
                  src={message.attachment_url}
                  alt="Screenshot attached to this support message"
                  className={cn('mt-2 max-h-48 rounded-lg object-contain', message.body ? '' : 'mt-0')}
                />
              ) : null}
            </div>
            <span className="mt-1 text-[11px] tabular-nums text-dash-dim">
              {formatStamp(message.created_at)}
            </span>
          </div>
        )
      })}
    </div>
  )
}
