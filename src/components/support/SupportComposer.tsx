'use client'

import { useRef, type FormEvent, type KeyboardEvent } from 'react'
import { Paperclip, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'
import { DASHBOARD_ICON_STROKE } from '@/components/dashboard/dashboard-shell'

const MAX_MESSAGE_LENGTH = 4000

export function SupportComposer({
  value,
  onChange,
  onSend,
  onAttach,
  disabled,
  sending,
  attaching,
  error,
  cannedReplies,
  placeholder = 'Write a message…',
  className,
}: {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  onAttach?: (file: File) => void
  disabled?: boolean
  sending?: boolean
  attaching?: boolean
  error?: string | null
  cannedReplies?: { label: string; text: string }[]
  placeholder?: string
  className?: string
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const busy = Boolean(disabled || sending || attaching)

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (busy) return
    onSend()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      if (!busy) onSend()
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cn('border-t border-dash-border bg-white px-4 py-3', className)}>
      {cannedReplies && cannedReplies.length > 0 ? (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {cannedReplies.map((reply) => (
            <button
              key={reply.label}
              type="button"
              disabled={busy}
              onClick={() => onChange(reply.text)}
              className="inline-flex h-7 items-center rounded-md border border-dash-border bg-white px-2.5 text-xs font-medium text-dash-body transition-colors hover:border-dash-border-strong hover:bg-dash-hover hover:text-dash-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 disabled:opacity-50"
            >
              {reply.label}
            </button>
          ))}
        </div>
      ) : null}
      <div className="flex items-end gap-2">
        {onAttach ? (
          <>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0]
                event.target.value = ''
                if (file) onAttach(file)
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 w-9 shrink-0 p-0"
              disabled={busy}
              onClick={() => fileRef.current?.click()}
              aria-label="Attach screenshot"
              title="Attach screenshot"
            >
              <Paperclip className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} aria-hidden />
            </Button>
          </>
        ) : null}
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value.slice(0, MAX_MESSAGE_LENGTH))}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={busy}
          rows={2}
          maxLength={MAX_MESSAGE_LENGTH}
          className="dashboard-textarea max-h-32 min-h-[44px] flex-1 resize-none"
        />
        <Button type="submit" size="sm" className="h-9 shrink-0 gap-1.5" disabled={busy}>
          <Send className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} aria-hidden />
          Send
        </Button>
      </div>
      {error ? <p className="mt-2 text-xs text-dash-negative">{error}</p> : null}
      {attaching ? <p className="mt-2 text-xs text-dash-muted">Uploading screenshot…</p> : null}
    </form>
  )
}
