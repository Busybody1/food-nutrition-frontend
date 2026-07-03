import { ChevronDown } from 'lucide-react'
import { HOME_FAQ_ITEMS, type FaqItem } from '@/lib/faq-data'
import { MarketingSectionHeader } from './marketing-shell'

export function FaqList({ items, openFirst = true }: { items: readonly FaqItem[]; openFirst?: boolean }) {
  return (
    <div className="space-y-3 max-w-2xl mx-auto">
      {items.map((item, i) => (
        <details key={item.q} className="marketing-faq-item group" open={openFirst && i === 0}>
          <summary className="marketing-faq-trigger marketing-faq-summary px-5 py-4 cursor-pointer">
            <span>{item.q}</span>
            <ChevronDown
              className="marketing-faq-chevron h-5 w-5 text-brand shrink-0 transition-transform duration-200"
              aria-hidden
            />
          </summary>
          <p className="px-5 pb-4 pt-0 text-sm text-ink-muted leading-relaxed border-t border-surface-border/50">
            {item.a}
          </p>
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
      className={`section-pad ${showIntro ? 'border-t border-surface-border/60' : 'pt-8 md:pt-10 -mt-1'}`}
      id="faq"
      aria-labelledby="faq-heading"
    >
      <div className="container-narrow">
        {showIntro && (
          <MarketingSectionHeader
            title="Food calorie API — frequently asked questions"
            description="Answers for developers evaluating our food API, nutrition API, and food database API."
          />
        )}
        <FaqList items={items} />
      </div>
    </section>
  )
}
