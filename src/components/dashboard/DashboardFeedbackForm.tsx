'use client'

import { useState, type FormEvent } from 'react'
import { usePathname } from 'next/navigation'
import { CheckCircle, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/hooks/use-auth'
import { ApiError } from '@/types/api'
import { cn } from '@/lib/utils/cn'

const MIN_MESSAGE_LENGTH = 10
const MAX_MESSAGE_LENGTH = 4000

type FeedbackCategory = 'feedback' | 'error'

const CATEGORIES: { value: FeedbackCategory; label: string }[] = [
  { value: 'feedback', label: 'Feedback' },
  { value: 'error', label: 'Error' },
]

export function DashboardFeedbackForm() {
  const pathname = usePathname()
  const { isAuthenticated, loading } = useAuth()
  const [category, setCategory] = useState<FeedbackCategory>('feedback')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  if (loading || !isAuthenticated) return null

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setSubmitError(null)
    setIsSubmitting(true)
    try {
      const { api } = await import('@/lib/api/client')
      await api.user.submitFeedback({
        category,
        message: message.trim(),
        page: pathname || '/dashboard',
      })
      setIsSubmitted(true)
      setMessage('')
      setCategory('feedback')
    } catch (err) {
      const fallback = 'Could not send your message. Please try again or email support.'
      setSubmitError(err instanceof ApiError || err instanceof Error ? err.message : fallback)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="dashboard-feedback" className="dashboard-panel" aria-labelledby="dashboard-feedback-title">
      <div className="dashboard-panel-header">
        <h2 id="dashboard-feedback-title" className="dashboard-panel-title">
          Feedback & errors
        </h2>
      </div>
      <div className="dashboard-panel-body">
        {isSubmitted ? (
          <div className="flex flex-col items-center text-center py-4">
            <CheckCircle className="h-8 w-8 text-brand-strong mb-3" aria-hidden />
            <p className="text-sm font-medium text-ink">Thanks — we got it</p>
            <p className="text-xs text-ink-muted mt-1 max-w-sm">
              Your note was sent to the team. We typically reply within one business day.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => {
                setIsSubmitted(false)
                setSubmitError(null)
              }}
            >
              Send another
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-ink-muted">
              Drop product feedback or errors here. We read every message.
            </p>
            <div className="dashboard-segmented" role="group" aria-label="Message type">
              {CATEGORIES.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setCategory(option.value)}
                  className={cn(
                    'dashboard-segmented-btn',
                    category === option.value && 'dashboard-segmented-btn-active'
                  )}
                  aria-pressed={category === option.value}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {submitError && (
              <p
                className="rounded-brand border border-red-200/80 bg-red-50 px-4 py-3 text-sm text-red-800"
                role="alert"
              >
                {submitError}
              </p>
            )}
            <div>
              <label htmlFor="dashboard-feedback-message" className="sr-only">
                {category === 'error' ? 'Describe the error' : 'Your feedback'}
              </label>
              <textarea
                id="dashboard-feedback-message"
                name="message"
                required
                minLength={MIN_MESSAGE_LENGTH}
                maxLength={MAX_MESSAGE_LENGTH}
                rows={4}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder={
                  category === 'error'
                    ? 'What went wrong, which endpoint or page, and what you expected…'
                    : 'What should we improve, add, or fix?'
                }
                className="w-full min-h-[112px] rounded-brand border border-surface-border bg-white px-3 py-2.5 text-sm text-ink placeholder:text-ink-dim resize-y focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/40"
              />
              <p className="mt-1.5 text-xs text-ink-dim tabular-nums">
                {message.trim().length}/{MAX_MESSAGE_LENGTH}
              </p>
            </div>
            <Button type="submit" size="sm" disabled={isSubmitting} className="gap-2">
              <Send className="h-3.5 w-3.5" aria-hidden />
              {isSubmitting ? 'Sending…' : 'Send'}
            </Button>
          </form>
        )}
      </div>
    </section>
  )
}
