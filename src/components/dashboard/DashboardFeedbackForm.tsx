'use client'

import { useState, type FormEvent } from 'react'
import { usePathname } from 'next/navigation'
import { CheckCircle, MessageSquareText, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/hooks/use-auth'
import { ApiError } from '@/types/api'
import { cn } from '@/lib/utils/cn'
import {
  DASHBOARD_ICON_STROKE,
  DashboardAlert,
  DashboardPanelBody,
  DashboardPanelHeader,
} from '@/components/dashboard/dashboard-shell'

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
      <DashboardPanelHeader
        title={<span id="dashboard-feedback-title">Feedback & errors</span>}
        icon={MessageSquareText}
        description={
          isSubmitted ? undefined : 'Drop product feedback or errors here. We read every message.'
        }
      />
      <DashboardPanelBody>
        {isSubmitted ? (
          <div className="flex flex-col items-center rounded-xl bg-dash-hover px-6 py-8 text-center">
            <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-dash-positive-soft text-dash-positive">
              <CheckCircle className="h-5 w-5" strokeWidth={DASHBOARD_ICON_STROKE} aria-hidden />
            </span>
            <p className="text-sm font-semibold text-dash-ink">Thanks — we got it</p>
            <p className="mt-1 max-w-sm text-[13px] text-dash-muted">
              Your note was sent to the team. We typically reply within one business day.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4 h-9"
              onClick={() => {
                setIsSubmitted(false)
                setSubmitError(null)
              }}
            >
              Send another
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
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
            {submitError && <DashboardAlert variant="error">{submitError}</DashboardAlert>}
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
                className="dashboard-textarea min-h-[112px] resize-y"
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs tabular-nums text-dash-dim">
                {message.trim().length}/{MAX_MESSAGE_LENGTH}
              </p>
              <Button type="submit" size="sm" disabled={isSubmitting} className="h-9 gap-1.5">
                <Send className="h-4 w-4" strokeWidth={DASHBOARD_ICON_STROKE} aria-hidden />
                {isSubmitting ? 'Sending…' : 'Send'}
              </Button>
            </div>
          </form>
        )}
      </DashboardPanelBody>
    </section>
  )
}
