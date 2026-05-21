'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { MarketingSectionHeader } from './marketing-shell'

const FAQ_ITEMS = [
  {
    q: 'What is Calorie API?',
    a: 'Calorie API is a REST API for food and nutrition data: search, autocomplete, barcode lookup, and macro nutrients per 100g. It is designed for health, fitness, and meal-tracking applications.',
  },
  {
    q: 'How do I authenticate requests?',
    a: 'Send your API key in the X-API-Key header, or use a JWT from the developer dashboard after signing in. Public demo search on the homepage is IP-rate-limited and does not require a key.',
  },
  {
    q: 'What are the pricing tiers?',
    a: 'A free tier includes monthly request quotas for development. Paid plans increase rate limits and monthly quotas. See the pricing page for current limits.',
  },
  {
    q: 'How does search ranking work?',
    a: 'Search supports multi-word queries, match_mode (any/all), verified-only filters, and relevance ranking aligned with verified foods and complete macro data.',
  },
  {
    q: 'Can I use this for commercial apps?',
    a: 'Yes, with an active subscription and compliance with our terms of service. Use Stripe checkout in the dashboard for paid plans.',
  },
]

export function FaqSection({ showIntro = true }: { showIntro?: boolean }) {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section
      className={`section-pad ${showIntro ? 'border-t border-surface-border/60' : 'pt-0'}`}
      id="faq"
      aria-labelledby="faq-heading"
    >
      <div className="container-narrow">
        {showIntro && (
          <MarketingSectionHeader
            title="Frequently asked questions"
            description="Answers for developers evaluating nutrition APIs and AI search engines."
          />
        )}
        <div className="space-y-3 max-w-2xl mx-auto">
          {FAQ_ITEMS.map((item, i) => (
            <div key={item.q} className="marketing-faq-item">
              <button
                type="button"
                className="marketing-faq-trigger px-5 py-4"
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
              >
                <span>{item.q}</span>
                <ChevronDown
                  className={`h-5 w-5 text-brand shrink-0 transition-transform duration-200 ${open === i ? 'rotate-180' : ''}`}
                />
              </button>
              {open === i && (
                <p className="px-5 pb-4 pt-0 text-sm text-ink-muted leading-relaxed border-t border-surface-border/50">
                  {item.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export const FAQ_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_ITEMS.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.a,
    },
  })),
}
