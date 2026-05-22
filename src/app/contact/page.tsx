'use client'

import { Suspense, useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MarketingImageHero } from '@/components/marketing/marketing-image-hero'
import { marketingCardClass } from '@/components/marketing/marketing-shell'
import { SUPPORT_EMAIL } from '@/lib/site'
import {
  Mail,
  Send,
  CheckCircle,
  Clock,
  Building2,
  BookOpen,
  MessageSquare,
} from 'lucide-react'

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

  useEffect(() => {
    const inquiry = searchParams.get('inquiry')
    if (inquiry === 'enterprise') {
      setFormData((prev) => ({
        ...prev,
        inquiryType: 'enterprise',
        subject: prev.subject || 'Enterprise / Custom plan inquiry',
      }))
    }
  }, [searchParams])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    await new Promise((r) => setTimeout(r, 1500))
    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  const labelClass = 'block text-sm font-medium text-ink mb-1.5'
  const fieldClass =
    'w-full bg-white border-surface-border text-ink rounded-brand focus:border-brand focus:ring-brand h-11'

  return (
    <div className="marketing-page">
      <MarketingImageHero compact centered waveTone="white">
        <p className="marketing-hero-badge mb-6 inline-flex items-center gap-2">
          <MessageSquare className="h-4 w-4" aria-hidden />
          Get in touch
        </p>
        <h1 className="font-display text-4xl md:text-5xl text-ink mb-4 text-balance">
          Let&apos;s build something amazing together
        </h1>
        <p className="text-lg text-ink-muted leading-relaxed max-w-xl mx-auto">
          Questions about the API, custom volume, or enterprise plans — we typically respond within
          one business day.
        </p>
      </MarketingImageHero>

      <section className="section-pad -mt-1 bg-white">
        <div className="container-narrow">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-10">
            <aside className="lg:col-span-4 space-y-4">
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
                  className="text-brand-strong font-medium hover:text-brand transition-colors break-all"
                >
                  {SUPPORT_EMAIL}
                </a>
              </div>

              <div className={`${marketingCardClass} p-6 border-brand/25 bg-brand-muted/20`}>
                <div className="flex h-10 w-10 items-center justify-center rounded-brand bg-brand/15 mb-4">
                  <Building2 className="h-5 w-5 text-brand-strong" aria-hidden />
                </div>
                <h2 className="text-lg font-semibold text-ink mb-1">Enterprise &amp; Custom</h2>
                <p className="text-sm text-ink-muted mb-3">
                  Custom quotas, SLAs, white-label, and on-premise options for large teams.
                </p>
                <p className="text-xs text-ink-dim">
                  Select <strong className="text-ink-muted">Enterprise</strong> in the form or email
                  us with your expected volume.
                </p>
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
                className={`${marketingCardClass} p-5 flex items-center gap-3 hover:border-brand/30 transition-colors group`}
              >
                <BookOpen className="h-5 w-5 text-brand-strong shrink-0" aria-hidden />
                <span className="text-sm font-medium text-ink group-hover:text-brand-strong">
                  Read API documentation
                </span>
              </Link>
            </aside>

            <div className="lg:col-span-8">
              <div className={`${marketingCardClass} p-6 md:p-8`}>
                <div className="mb-6">
                  <h2 className="font-display text-2xl text-ink mb-2">Send a message</h2>
                  <p className="text-sm text-ink-muted">
                    Fill out the form and we&apos;ll get back to you. You can also email{' '}
                    <a href={`mailto:${SUPPORT_EMAIL}`} className="text-brand-strong hover:underline">
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
                    <Button variant="outline" onClick={() => setIsSubmitted(false)}>
                      Send another message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className={labelClass}>
                          Full name *
                        </label>
                        <Input
                          id="name"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleInputChange}
                          className={fieldClass}
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
                          value={formData.email}
                          onChange={handleInputChange}
                          className={fieldClass}
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
                          value={formData.company}
                          onChange={handleInputChange}
                          className={fieldClass}
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
                          className={`${fieldClass} px-3`}
                        >
                          <option value="general">General</option>
                          <option value="technical">Technical support</option>
                          <option value="sales">Sales</option>
                          <option value="enterprise">Enterprise / Custom plan</option>
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
                        className={fieldClass}
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
                        className={`${fieldClass} min-h-[140px] py-3 px-3 resize-y`}
                      />
                    </div>
                    <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
                      {isSubmitting ? (
                        'Sending…'
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" aria-hidden />
                          Send message
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </div>

              <p className="text-center text-sm text-ink-dim mt-6">
                See also our{' '}
                <Link href="/faq" className="text-brand-strong hover:underline">
                  FAQ
                </Link>{' '}
                and{' '}
                <Link href="/pricing" className="text-brand-strong hover:underline">
                  pricing
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default function ContactPage() {
  return (
    <Suspense
      fallback={
        <div className="marketing-page min-h-[50vh] flex items-center justify-center text-ink-muted">
          Loading…
        </div>
      }
    >
      <ContactPageContent />
    </Suspense>
  )
}
