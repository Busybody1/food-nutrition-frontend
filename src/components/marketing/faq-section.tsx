import { ChevronDown } from 'lucide-react'
import { FAQ_ITEMS } from '@/lib/faq-data'
import { MarketingSectionHeader } from './marketing-shell'

export function FaqSection({ showIntro = true }: { showIntro?: boolean }) {
  return (
    <section
      className={`section-pad ${showIntro ? 'border-t border-surface-border/60' : 'pt-8 md:pt-10 -mt-1'}`}
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
            <details key={item.q} className="marketing-faq-item group" open={i === 0}>
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
      </div>
    </section>
  )
}
