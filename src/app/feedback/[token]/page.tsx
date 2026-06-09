'use client'

import { Suspense, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MarketingImageHero } from '@/components/marketing/marketing-image-hero'
import { marketingCardClass } from '@/components/marketing/marketing-shell'
import {
  fetchFeedbackContext,
  submitFeedback,
  type FeedbackSubmitPayload,
} from '@/lib/api/feedback'
import { CheckCircle, MessageSquareHeart, Star, Send } from 'lucide-react'

type RatingField =
  | 'overall_rating'
  | 'ease_of_use_rating'
  | 'documentation_rating'
  | 'data_quality_rating'

const RATING_QUESTIONS: { key: RatingField; label: string; hint: string }[] = [
  {
    key: 'overall_rating',
    label: 'Overall satisfaction',
    hint: 'How satisfied are you with the Food Nutrition API overall?',
  },
  {
    key: 'ease_of_use_rating',
    label: 'Ease of integration',
    hint: 'How easy was it to integrate the API into your product?',
  },
  {
    key: 'documentation_rating',
    label: 'Documentation & support',
    hint: 'How helpful were our docs, examples, and developer experience?',
  },
  {
    key: 'data_quality_rating',
    label: 'Data quality & coverage',
    hint: 'How accurate and comprehensive is the nutrition data for your use case?',
  },
]

function StarRating({
  value,
  onChange,
  name,
}: {
  value: number
  onChange: (v: number) => void
  name: string
}) {
  return (
    <div className="flex gap-1" role="radiogroup" aria-label={name}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          onClick={() => onChange(star)}
          className={`p-1 rounded transition-colors ${
            star <= value ? 'text-brand-strong' : 'text-ink-dim hover:text-brand/70'
          }`}
        >
          <Star className={`h-7 w-7 ${star <= value ? 'fill-current' : ''}`} aria-hidden />
          <span className="sr-only">{star} star{star > 1 ? 's' : ''}</span>
        </button>
      ))}
    </div>
  )
}

function FeedbackPageContent() {
  const params = useParams()
  const token = typeof params.token === 'string' ? params.token : ''

  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [firstName, setFirstName] = useState('there')
  const [alreadySubmitted, setAlreadySubmitted] = useState(false)
  const [expired, setExpired] = useState(false)

  const [ratings, setRatings] = useState<Record<RatingField, number>>({
    overall_rating: 0,
    ease_of_use_rating: 0,
    documentation_rating: 0,
    data_quality_rating: 0,
  })
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null)
  const [message, setMessage] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (!token) {
      setLoadError('Invalid feedback link.')
      setLoading(false)
      return
    }
    fetchFeedbackContext(token)
      .then((ctx) => {
        setFirstName(ctx.first_name)
        setAlreadySubmitted(ctx.already_submitted)
        setExpired(ctx.expired)
      })
      .catch((err) => {
        setLoadError(err instanceof Error ? err.message : 'Could not load feedback form.')
      })
      .finally(() => setLoading(false))
  }, [token])

  const allRatingsSet = RATING_QUESTIONS.every((q) => ratings[q.key] >= 1)
  const canSubmit =
    allRatingsSet && wouldRecommend !== null && message.trim().length >= 10 && !submitting

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit || wouldRecommend === null) return
    setSubmitError(null)
    setSubmitting(true)
    try {
      const payload: FeedbackSubmitPayload = {
        overall_rating: ratings.overall_rating as 1 | 2 | 3 | 4 | 5,
        ease_of_use_rating: ratings.ease_of_use_rating as 1 | 2 | 3 | 4 | 5,
        documentation_rating: ratings.documentation_rating as 1 | 2 | 3 | 4 | 5,
        data_quality_rating: ratings.data_quality_rating as 1 | 2 | 3 | 4 | 5,
        would_recommend: wouldRecommend,
        message: message.trim(),
        website: honeypot,
      }
      await submitFeedback(token, payload)
      setSubmitted(true)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Submission failed.')
    } finally {
      setSubmitting(false)
    }
  }

  const labelClass = 'block text-sm font-medium text-ink mb-1.5'
  const fieldClass =
    'w-full border border-surface-border bg-white text-ink rounded-brand px-3 transition-colors focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/40'

  if (loading) {
    return (
      <div className="marketing-page min-h-[50vh] flex items-center justify-center text-ink-muted">
        Loading feedback form…
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="marketing-page min-h-[50vh] flex items-center justify-center px-4">
        <div className={`${marketingCardClass} p-8 max-w-md text-center`}>
          <p className="text-ink font-medium mb-2">Link unavailable</p>
          <p className="text-sm text-ink-muted mb-6">{loadError}</p>
          <Button asChild variant="outline">
            <Link href="/contact">Contact support</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (expired && !alreadySubmitted && !submitted) {
    return (
      <div className="marketing-page min-h-[50vh] flex items-center justify-center px-4">
        <div className={`${marketingCardClass} p-8 max-w-md text-center`}>
          <p className="text-ink font-medium mb-2">This link has expired</p>
          <p className="text-sm text-ink-muted mb-6">
            Feedback links are valid for 30 days. Please contact us if you&apos;d still like to share
            your thoughts.
          </p>
          <Button asChild variant="outline">
            <Link href="/contact">Contact support</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (alreadySubmitted || submitted) {
    return (
      <div className="marketing-page">
        <MarketingImageHero compact centered waveTone="white">
          <CheckCircle className="h-12 w-12 text-brand-strong mx-auto mb-4" aria-hidden />
          <h1 className="font-display text-3xl text-ink mb-3">Thank you, {firstName}!</h1>
          <p className="text-lg text-ink-muted max-w-lg mx-auto">
            Your feedback helps us improve the Food Nutrition API for developers like you.
          </p>
        </MarketingImageHero>
        <section className="section-pad -mt-1 bg-white">
          <div className="container-narrow text-center pb-12">
            <Button asChild variant="outline">
              <Link href="/docs">Explore API documentation</Link>
            </Button>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="marketing-page">
      <MarketingImageHero compact centered waveTone="white">
        <p className="marketing-hero-badge mb-6 inline-flex items-center gap-2">
          <MessageSquareHeart className="h-4 w-4" aria-hidden />
          API feedback
        </p>
        <h1 className="font-display text-3xl sm:text-4xl text-ink mb-4 text-balance">
          Hi {firstName}, how are we doing?
        </h1>
        <p className="text-lg text-ink-muted leading-relaxed max-w-xl mx-auto">
          Your experience with the BusyBody Food Nutrition API matters. This short survey takes about
          2 minutes.
        </p>
      </MarketingImageHero>

      <section className="section-pad -mt-1 bg-white">
        <div className="container-narrow max-w-2xl">
          <div className={`${marketingCardClass} p-6 md:p-8`}>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="sr-only" aria-hidden>
                <label htmlFor="website">Website</label>
                <input
                  id="website"
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>

              {submitError && (
                <p
                  className="rounded-brand border border-red-200/80 bg-red-50 px-4 py-3 text-sm text-red-800"
                  role="alert"
                >
                  {submitError}
                </p>
              )}

              {RATING_QUESTIONS.map((q) => (
                <div key={q.key} className="pb-6 border-b border-surface-border/60 last:border-0">
                  <p className={labelClass}>{q.label}</p>
                  <p className="text-sm text-ink-muted mb-3">{q.hint}</p>
                  <StarRating
                    name={q.label}
                    value={ratings[q.key]}
                    onChange={(v) => setRatings((prev) => ({ ...prev, [q.key]: v }))}
                  />
                </div>
              ))}

              <div>
                <p className={labelClass}>Would you recommend the API to other developers?</p>
                <div className="flex gap-3 mt-2">
                  <Button
                    type="button"
                    variant={wouldRecommend === true ? 'default' : 'outline'}
                    onClick={() => setWouldRecommend(true)}
                  >
                    Yes
                  </Button>
                  <Button
                    type="button"
                    variant={wouldRecommend === false ? 'default' : 'outline'}
                    onClick={() => setWouldRecommend(false)}
                  >
                    No
                  </Button>
                </div>
              </div>

              <div>
                <label htmlFor="message" className={labelClass}>
                  Additional comments *
                </label>
                <p className="text-sm text-ink-muted mb-2">
                  What&apos;s working well? What could we improve — endpoints, data, docs, or pricing?
                </p>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  required
                  minLength={10}
                  maxLength={5000}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Share specific examples if you can — it helps us prioritize."
                  className={`${fieldClass} min-h-[120px] py-3 resize-y`}
                />
              </div>

              <Button type="submit" className="w-full h-11" disabled={!canSubmit}>
                {submitting ? (
                  'Submitting…'
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" aria-hidden />
                    Submit feedback
                  </>
                )}
              </Button>
            </form>
          </div>

          <p className="text-center text-sm text-ink-dim mt-6">
            Your responses are stored securely and reviewed by our product team only.
          </p>
        </div>
      </section>
    </div>
  )
}

export default function FeedbackPage() {
  return (
    <Suspense
      fallback={
        <div className="marketing-page min-h-[50vh] flex items-center justify-center text-ink-muted">
          Loading…
        </div>
      }
    >
      <FeedbackPageContent />
    </Suspense>
  )
}
