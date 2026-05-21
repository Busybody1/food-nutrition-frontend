'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MarketingHero } from '@/components/marketing/marketing-hero'
import { marketingCardClass } from '@/components/marketing/marketing-shell'
import { SUPPORT_EMAIL } from '@/lib/site'
import { Mail, Send, CheckCircle, MessageSquare } from 'lucide-react'

export default function ContactPage() {
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

  const labelClass = 'block text-sm font-medium text-ink-muted mb-2'
  const fieldClass =
    'w-full bg-white border-surface-border text-ink rounded-card focus:border-brand focus:ring-brand'

  return (
    <div className="marketing-page">
      <MarketingHero
        badge={
          <>
            <MessageSquare className="w-4 h-4 mr-2 inline" />
            Get in touch
          </>
        }
        title={
          <>
            Let&apos;s build something{' '}
            <span className="text-gradient-brand">amazing together</span>
          </>
        }
        subtitle="Questions about the API, enterprise plans, or integration help — our team typically responds within one business day."
      />

      <section className="section-pad bg-surface-elevated">
        <div className="container-narrow max-w-2xl mx-auto text-center">
          <Card className={marketingCardClass}>
            <CardContent className="p-10">
              <Mail className="h-12 w-12 text-brand mx-auto mb-6" />
              <h2 className="font-display text-2xl text-ink mb-3">Email support</h2>
              <p className="text-ink-muted mb-6">Technical questions, billing, and partnerships</p>
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="text-xl font-medium text-brand hover:text-brand-soft"
              >
                {SUPPORT_EMAIL}
              </a>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-narrow max-w-2xl mx-auto">
          <Card className={marketingCardClass}>
            <CardHeader>
              <CardTitle className="text-ink text-2xl">Send a message</CardTitle>
              <CardDescription className="text-ink-dim">
                Or email us directly at{' '}
                <a href={`mailto:${SUPPORT_EMAIL}`} className="text-brand hover:underline">
                  {SUPPORT_EMAIL}
                </a>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isSubmitted ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-accent-green mx-auto mb-4" />
                  <h3 className="text-xl text-ink mb-2">Message sent</h3>
                  <p className="text-ink-muted mb-6">We&apos;ll reply within 24 hours on business days.</p>
                  <Button variant="outline" onClick={() => setIsSubmitted(false)}>
                    Send another
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className={labelClass}>Full name *</label>
                      <Input id="name" name="name" required value={formData.name} onChange={handleInputChange} className={fieldClass} />
                    </div>
                    <div>
                      <label htmlFor="email" className={labelClass}>Email *</label>
                      <Input id="email" name="email" type="email" required value={formData.email} onChange={handleInputChange} className={fieldClass} />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="company" className={labelClass}>Company</label>
                      <Input id="company" name="company" value={formData.company} onChange={handleInputChange} className={fieldClass} />
                    </div>
                    <div>
                      <label htmlFor="inquiryType" className={labelClass}>Inquiry type</label>
                      <select
                        id="inquiryType"
                        name="inquiryType"
                        value={formData.inquiryType}
                        onChange={handleInputChange}
                        className={`${fieldClass} px-3 py-2`}
                      >
                        <option value="general">General</option>
                        <option value="technical">Technical</option>
                        <option value="sales">Sales</option>
                        <option value="enterprise">Enterprise</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="subject" className={labelClass}>Subject *</label>
                    <Input id="subject" name="subject" required value={formData.subject} onChange={handleInputChange} className={fieldClass} />
                  </div>
                  <div>
                    <label htmlFor="message" className={labelClass}>Message *</label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      required
                      value={formData.message}
                      onChange={handleInputChange}
                      className={`${fieldClass} px-3 py-2 resize-none`}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Sending…' : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send message
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
          <p className="text-center text-sm text-ink-dim mt-8">
            See also our <Link href="/faq" className="text-brand hover:underline">FAQ</Link> and{' '}
            <Link href="/docs" className="text-brand hover:underline">API documentation</Link>.
          </p>
        </div>
      </section>
    </div>
  )
}
