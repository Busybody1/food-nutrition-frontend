'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MarketingImageHero } from '@/components/marketing/marketing-image-hero'
import { marketingCardClass, MarketingPageLoading } from '@/components/marketing/marketing-shell'
import { Reveal, RevealGroup } from '@/components/marketing/reveal'
import { SUPPORT_EMAIL } from '@/lib/site'
import { submitContactForm } from '@/lib/contact/submit-contact'
import {
  Mail,
  Send,
  CheckCircle,
  Clock,
  Building2,
  BookOpen,
  MessageSquare,
} from 'lucide-react'

const inlineLinkClass =
  'text-brand-strong underline decoration-brand/40 underline-offset-2 transition-colors duration-200 hover:decoration-brand-strong rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2'

function ContactPageContent() {
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: '',
    message: '',
    inquiryType: 'general',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [honeypot, setHoneypot] = useState('')

  // ?inquiry=enterprise deep-link: adjust state during render (React-docs pattern,
  // replaces the previous setState-in-effect) so the preselection is flash-free.
  const inquiry = searchParams.get('inquiry')
  const [appliedInquiry, setAppliedInquiry] = useState<string | null>(null)
  if (inquiry !== appliedInquiry) {
    setAppliedInquiry(inquiry)
    if (inquiry === 'enterprise') {
      setFormData((prev) => ({
        ...prev,
        inquiryType: 'enterprise',
        subject: prev.subject || 'Enterprise plan inquiry',
      }))
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  // Mirrors the ?inquiry=enterprise deep-link: preselect Enterprise and bring the form into view.
  const handleEnterpriseSelect = () => {
    setFormData((prev) => ({
      ...prev,
      inquiryType: 'enterprise',
      subject: prev.subject || 'Enterprise plan inquiry',
    }))
    const reduceMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    document
      .getElementById('contact-form')
      ?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
    document.getElementById('name')?.focus({ preventScroll: true })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    setIsSubmitting(true)
    try {
      await submitContactForm({
        name: formData.name.trim(),
        email: formData.email.trim(),
        company: formData.company.trim() || undefined,
        subject: formData.subject.trim(),
        message: formData.message.trim(),
        inquiry_type: formData.inquiryType,
        website: honeypot,
      })
      setIsSubmitted(true)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Could not send your message.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const labelClass = 'block text-sm font-medium text-ink mb-1.5'
  const fieldBaseClass =
    'w-full border border-surface-border bg-white text-ink rounded-brand px-3 transition-[border-color,box-shadow] duration-200 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/40'
  const inputClass = `${fieldBaseClass} h-11`

  return (
    <div className="marketing-page">
      <MarketingImageHero compact centered waveTone="elevated">
        <p className="marketing-hero-badge mb-6 inline-flex items-center gap-2">
          <MessageSquare className="h-4 w-4" aria-hidden />
          Get in touch
        </p>
        <h1 className="font-display text-4xl md:text-5xl tracking-tight text-ink mb-4 text-balance">
          Let&apos;s build something amazing together
        </h1>
        <p className="text-lg text-ink-muted leading-relaxed max-w-xl mx-auto">
          Questions about the API, custom volume, or enterprise plans, we typically respond within
          one business day.
        </p>
      </MarketingImageHero>

      <section className="section-pad bg-surface-elevated">
        <div className="container-narrow">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-10">
            <Reveal className="lg:col-span-8 lg:order-2 min-w-0">
              <div
                id="contact-form"
                className="glass-panel p-6 md:p-8 transition-[border-color,box-shadow] duration-200 focus-within:border-brand/40 focus-within:shadow-glow"
              >
                <div className="mb-6">
                  <h2 className="font-display text-2xl text-ink mb-2">Send a message</h2>
                  <p className="text-sm text-ink-muted">
                    Fill out the form and we&apos;ll get back to you. You can also email{' '}
                    <a href={`mailto:${SUPPORT_EMAIL}`} className={inlineLinkClass}>
                      {SUPPORT_EMAIL}
                    </a>{' '}
                    directly.
                  </p>
                </div>

                {isSubmitted ? (
                  <div className="text-center py-12 rounded-brand bg-surface-elevated/60 border border-surface-border/60">
                    <CheckCircle className="h-12 w-12 text-brand-strong mx-auto mb-4" aria-hidden />
                    <h3 className="text-xl font-semibold text-ink mb-2">Message sent</h3>
                    <p className="text-ink-muted mb-6 max-w-sm mx-auto">
                      Thanks for reaching out. We&apos;ll reply within one business day.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsSubmitted(false)
                        setSubmitError(null)
                      }}
                    >
                      Send another message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
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
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className={labelClass}>
                          Full name *
                        </label>
                        <Input
                          id="name"
                          name="name"
                          required
                          autoComplete="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className={labelClass}>
                          Work email *
                        </label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          required
                          autoComplete="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className={inputClass}
                        />
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="company" className={labelClass}>
                          Company
                        </label>
                        <Input
                          id="company"
                          name="company"
                          autoComplete="organization"
                          value={formData.company}
                          onChange={handleInputChange}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label htmlFor="inquiryType" className={labelClass}>
                          Inquiry type
                        </label>
                        <select
                          id="inquiryType"
                          name="inquiryType"
                          value={formData.inquiryType}
                          onChange={handleInputChange}
                          className={`${fieldBaseClass} h-11 cursor-pointer`}
                        >
                          <option value="general">General</option>
                          <option value="technical">Technical support</option>
                          <option value="sales">Sales</option>
                          <option value="enterprise">Enterprise plan</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="subject" className={labelClass}>
                        Subject *
                      </label>
                      <Input
                        id="subject"
                        name="subject"
                        required
                        value={formData.subject}
                        onChange={handleInputChange}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="message" className={labelClass}>
                        Message *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={6}
                        required
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Tell us about your use case, expected API volume, and timeline."
                        className={`${fieldBaseClass} min-h-[140px] py-3 resize-y`}
                      />
                    </div>
                    <button
                      type="submit"
                      className="btn-brand h-12 w-full text-base disabled:pointer-events-none disabled:opacity-60"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        'Sending…'
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" aria-hidden />
                          Send message
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>

              <p className="text-center text-sm text-ink-muted mt-6">
                See also our{' '}
                <Link href="/faq" className={inlineLinkClass}>
                  FAQ
                </Link>{' '}
                and{' '}
                <Link href="/pricing" className={inlineLinkClass}>
                  pricing
                </Link>
                .
              </p>
            </Reveal>

            <RevealGroup
              as="aside"
              className="lg:col-span-4 lg:order-1 space-y-4"
              itemClassName="min-w-0"
              delay={80}
            >
              <div className={`${marketingCardClass} p-6`}>
                <div className="flex h-10 w-10 items-center justify-center rounded-brand bg-brand-muted mb-4">
                  <Mail className="h-5 w-5 text-brand-strong" aria-hidden />
                </div>
                <h2 className="text-lg font-semibold text-ink mb-1">Email us</h2>
                <p className="text-sm text-ink-muted mb-4">
                  Technical support, billing, and partnerships
                </p>
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className={`${inlineLinkClass} font-medium break-all`}
                >
                  {SUPPORT_EMAIL}
                </a>
              </div>

              <div
                className={`${marketingCardClass} card-hairline p-6 border-brand/25 bg-brand-muted/20`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-brand bg-brand/15 mb-4">
                  <Building2 className="h-5 w-5 text-brand-strong" aria-hidden />
                </div>
                <h2 className="text-lg font-semibold text-ink mb-1">Enterprise</h2>
                <p className="text-sm text-ink-muted mb-3">
                  Custom quotas, image-to-calorie API, credits-based usage, SLAs, white-label, and
                  on-premise options for large teams.
                </p>
                <p className="text-xs text-ink-muted">
                  Select <strong className="text-ink-muted">Enterprise</strong> in the form or email
                  us with your expected volume.
                </p>
                <button
                  type="button"
                  onClick={handleEnterpriseSelect}
                  aria-label="Select Enterprise in the form"
                  className="absolute inset-0 z-10 cursor-pointer rounded-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-inset"
                />
              </div>

              <div className={`${marketingCardClass} p-6`}>
                <div className="flex h-10 w-10 items-center justify-center rounded-brand bg-surface-elevated mb-4">
                  <Clock className="h-5 w-5 text-brand-strong" aria-hidden />
                </div>
                <h2 className="text-lg font-semibold text-ink mb-1">Response time</h2>
                <p className="text-sm text-ink-muted">
                  Most messages receive a reply within 24 hours on business days.
                </p>
              </div>

              <Link
                href="/docs"
                className={`${marketingCardClass} p-6 flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2`}
              >
                <BookOpen className="h-5 w-5 text-brand-strong shrink-0" aria-hidden />
                <span className="text-sm font-medium text-ink transition-colors duration-200 group-hover:text-brand-strong">
                  Read API documentation
                </span>
              </Link>
            </RevealGroup>
          </div>
        </div>
      </section>
    </div>
  )
}

export default function ContactPage() {
  return (
    <Suspense fallback={<MarketingPageLoading message="Loading…" />}>
      <ContactPageContent />
    </Suspense>
  )
}
