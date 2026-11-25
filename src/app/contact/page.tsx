'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { MarketingIconDisc, MarketingPageLoading } from '@/components/marketing/marketing-shell'
import { MarketingSheet, MarketingSheetHero } from '@/components/marketing/marketing-sheet'
import { Reveal, RevealGroup } from '@/components/marketing/reveal'
import { getPublicPageSeo } from '@/lib/public-page-seo'
import { SUPPORT_EMAIL } from '@/lib/site'

const CONTACT_SEO = getPublicPageSeo('/contact')
import { submitContactForm } from '@/lib/contact/submit-contact'
import { CalendlyInlineEmbed } from '@/components/marketing/calendly-embed'
import {
  Mail,
  Send,
  CheckCircle,
  Clock,
  Building2,
  BookOpen,
  MessageSquare,
  Calendar,
} from 'lucide-react'

const inlineLinkClass =
  'text-brand-strong underline decoration-brand/40 underline-offset-2 transition-colors duration-200 hover:decoration-brand-strong rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2'

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
  const [showScheduler, setShowScheduler] = useState(false)

  const inquiry = searchParams.get('inquiry')
  const [appliedInquiry, setAppliedInquiry] = useState<string | null>(null)
  if (inquiry !== appliedInquiry) {
    setAppliedInquiry(inquiry)
    if (inquiry === 'enterprise') {
      setShowScheduler(true)
      setFormData((prev) => ({
        ...prev,
        inquiryType: 'enterprise',
        subject: prev.subject || 'Enterprise plan inquiry',
      }))
    }
  }

  const scrollToScheduler = () => {
    const reduceMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    document
      .getElementById('schedule-call')
      ?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    if (e.target.name === 'inquiryType' && e.target.value === 'enterprise') {
      setShowScheduler(true)
      scrollToScheduler()
    }
  }

  const handleEnterpriseSelect = () => {
    setShowScheduler(true)
    setFormData((prev) => ({
      ...prev,
      inquiryType: 'enterprise',
      subject: prev.subject || 'Enterprise plan inquiry',
    }))
    scrollToScheduler()
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

  const labelClass = 'marketing-label'
  const inputClass = 'marketing-input'
  const panelHeadingClass = 'mb-2 text-xl font-semibold tracking-[-0.02em] text-mk-ink'

  return (
    <div className="marketing-page">
      <MarketingSheetHero
        badge={
          <>
            {showScheduler ? (
              <Calendar className="h-3.5 w-3.5" aria-hidden />
            ) : (
              <MessageSquare className="h-3.5 w-3.5" aria-hidden />
            )}
            {showScheduler ? 'Enterprise' : 'Get in touch'}
          </>
        }
        title={CONTACT_SEO.title}
        lead={
          showScheduler
            ? 'Schedule an enterprise call for custom volume and image-to-calorie access. We respond within one business day.'
            : CONTACT_SEO.description
        }
        leadClassName="aeo-answer"
      />

      <MarketingSheet>
        <div className="container-narrow">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
            <Reveal className="lg:col-span-8 lg:order-2 min-w-0">
              <div id="schedule-call">
              {showScheduler && (
                <div className="glass-panel mb-6 p-5 sm:p-6 md:p-8">
                  <div className="mb-4">
                    <h2 className={panelHeadingClass}>Schedule a call</h2>
                    <p className="text-sm text-mk-muted">
                      Choose a 30-minute slot. Prefer email? Use the form below or write{' '}
                      <a href={`mailto:${SUPPORT_EMAIL}`} className={inlineLinkClass}>
                        {SUPPORT_EMAIL}
                      </a>
                      .
                    </p>
                  </div>
                  <CalendlyInlineEmbed />
                </div>
              )}

              <div id="contact-form" className="glass-panel p-5 sm:p-6 md:p-8">
                <div className="mb-6">
                  <h2 className={panelHeadingClass}>
                    {showScheduler ? 'Or send a message' : 'Send a message'}
                  </h2>
                  <p className="text-sm text-mk-muted">
                    Fill out the form and we&apos;ll get back to you. You can also email{' '}
                    <a href={`mailto:${SUPPORT_EMAIL}`} className={inlineLinkClass}>
                      {SUPPORT_EMAIL}
                    </a>{' '}
                    directly.
                  </p>
                </div>

                {isSubmitted ? (
                  <div className="rounded-2xl border border-mk-hair bg-mk-stage px-4 py-12 text-center">
                    <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-mk-green-soft text-mk-green">
                      <CheckCircle className="h-6 w-6" aria-hidden />
                    </span>
                    <h3 className="mb-2 text-xl font-semibold text-mk-ink">Message sent</h3>
                    <p className="marketing-body mx-auto mb-6 max-w-sm">
                      Thanks for reaching out. We&apos;ll reply within one business day.
                    </p>
                    <button
                      type="button"
                      className="btn-brand-outline"
                      onClick={() => {
                        setIsSubmitted(false)
                        setSubmitError(null)
                      }}
                    >
                      Send another message
                    </button>
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
                        className="rounded-xl border border-red-200/80 bg-red-50 px-4 py-3 text-sm text-red-800"
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
                        <input
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
                        <input
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
                        <input
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
                          className={`${inputClass} cursor-pointer`}
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
                      <input
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
                        className="marketing-textarea min-h-[140px] resize-y"
                      />
                    </div>
                    <button type="submit" className="btn-brand w-full" disabled={isSubmitting}>
                      {isSubmitting ? (
                        'Sending…'
                      ) : (
                        <>
                          <Send className="h-4 w-4" aria-hidden />
                          Send message
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>

              <p className="mt-6 text-center text-sm text-mk-muted">
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
              </div>
            </Reveal>

            <RevealGroup
              as="aside"
              className="lg:col-span-4 lg:order-1 space-y-2"
              itemClassName="min-w-0"
              delay={80}
            >
              <div className="py-4">
                <MarketingIconDisc icon={Mail} tone="blue" />
                <h2 className="mt-4 text-base font-semibold tracking-[-0.01em] text-mk-ink">Email us</h2>
                <p className="mt-1 text-[15px] text-mk-muted">
                  Technical support, billing, and partnerships
                </p>
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className={`${inlineLinkClass} mt-2 inline-block text-[15px] font-medium break-all`}
                >
                  {SUPPORT_EMAIL}
                </a>
              </div>

              <div className="relative -mx-3 rounded-2xl px-3 py-4 transition-colors duration-200 hover:bg-mk-stage">
                <MarketingIconDisc icon={Building2} tone="violet" />
                <h2 className="mt-4 text-base font-semibold tracking-[-0.01em] text-mk-ink">Enterprise</h2>
                <p className="mt-1 text-[15px] leading-relaxed text-mk-muted">
                  Custom quotas, image-to-calorie API, credits-based usage, SLAs, white-label, and
                  on-premise options for large teams.
                </p>
                <p className="mt-2 text-xs text-mk-muted">
                  Schedule a 30-minute call or email us with your expected volume.
                </p>
                <button
                  type="button"
                  onClick={handleEnterpriseSelect}
                  aria-label="Schedule an Enterprise call"
                  className="absolute inset-0 z-10 cursor-pointer rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-inset"
                />
              </div>

              <div className="py-4">
                <MarketingIconDisc icon={Clock} tone="green" />
                <h2 className="mt-4 text-base font-semibold tracking-[-0.01em] text-mk-ink">Response time</h2>
                <p className="mt-1 text-[15px] text-mk-muted">
                  Most messages receive a reply within 24 hours on business days.
                </p>
              </div>

              <Link
                href="/docs"
                className="group flex min-h-11 items-center gap-3 border-t border-mk-hair pt-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
              >
                <BookOpen className="h-4 w-4 shrink-0 text-mk-muted" aria-hidden />
                <span className="text-[15px] font-medium text-mk-ink transition-colors duration-200 group-hover:text-brand-strong">
                  Read API documentation
                </span>
              </Link>
            </RevealGroup>
          </div>
        </div>
      </MarketingSheet>
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
