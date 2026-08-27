'use client'

import { useRef, type FormEvent, type KeyboardEvent } from 'react'
import { Paperclip, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'

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
    <form onSubmit={handleSubmit} className="border-t border-surface-border/70 bg-white p-3">
      {cannedReplies && cannedReplies.length > 0 ? (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {cannedReplies.map((reply) => (
            <button
              key={reply.label}
              type="button"
              disabled={busy}
              onClick={() => onChange(reply.text)}
              className="rounded-full border border-surface-border/80 px-2.5 py-1 text-[11px] font-medium text-ink-muted hover:border-brand/30 hover:text-ink"
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
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 shrink-0"
              disabled={busy}
              onClick={() => fileRef.current?.click()}
              aria-label="Attach screenshot"
              title="Attach screenshot"
            >
              <Paperclip className="h-4 w-4" />
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
          className={cn(
            'flex-1 min-h-[44px] max-h-32 resize-none rounded-brand border border-surface-border bg-white px-3 py-2 text-sm text-ink',
            'placeholder:text-ink-dim focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30'
          )}
        />
        <Button type="submit" size="sm" className="h-9 shrink-0" disabled={busy}>
          <Send className="h-4 w-4" />
          <span className="sr-only">Send</span>
        </Button>
      </div>
      {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
      {attaching ? <p className="mt-2 text-xs text-ink-muted">Uploading screenshot…</p> : null}
    </form>
  )
}
