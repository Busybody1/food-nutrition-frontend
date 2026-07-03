import { ChevronDown } from 'lucide-react'
import { HOME_FAQ_ITEMS, type FaqItem } from '@/lib/faq-data'
import { MarketingSectionHeader } from './marketing-shell'
import { Reveal } from './reveal'

export function FaqList({ items, openFirst = true }: { items: readonly FaqItem[]; openFirst?: boolean }) {
  return (
    <div className="space-y-3 max-w-3xl mx-auto">
      {items.map((item, i) => (
        <details
          key={item.q}
          className="marketing-faq-item group open:border-brand/30 open:shadow-glass-lg"
          open={openFirst && i === 0}
        >
          <summary className="marketing-faq-trigger marketing-faq-summary px-5 py-4 cursor-pointer">
            <span className="group-open:text-brand-strong transition-colors duration-200">
              {item.q}
            </span>
            <ChevronDown
              className="marketing-faq-chevron h-5 w-5 text-brand shrink-0 transition-transform duration-200"
              aria-hidden
            />
          </summary>
          <div className="motion-safe:group-open:animate-[fade-rise_0.3s_ease-out]">
            <p className="px-5 pb-4 pt-3 text-sm text-ink-muted leading-relaxed border-t border-surface-border/50">
              {item.a}
            </p>
          </div>
        </details>
      ))}
    </div>
  )
}

export function FaqSection({
  showIntro = true,
  items = HOME_FAQ_ITEMS,
}: {
  showIntro?: boolean
  items?: readonly FaqItem[]
}) {
  return (
    <section
      className={showIntro ? 'section-pad border-t border-surface-border/60' : 'section-pad pt-8 md:pt-10'}
      id="faq"
      aria-labelledby={showIntro ? 'faq-heading' : undefined}
      aria-label={showIntro ? undefined : 'Food calorie API: frequently asked questions'}
    >
      <div className="container-narrow">
        {showIntro && (
          <Reveal>
            <MarketingSectionHeader
              id="faq-heading"
              title="Food calorie API: frequently asked questions"
              description="Answers for developers evaluating our food API, nutrition API, and food database API."
            />
          </Reveal>
        )}
        <Reveal delay={showIntro ? 120 : 0}>
          <FaqList items={items} />
        </Reveal>
      </div>
    </section>
  )
}
