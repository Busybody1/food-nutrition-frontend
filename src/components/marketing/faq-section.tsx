import { ChevronDown } from 'lucide-react'
import { HOME_FAQ_ITEMS, type FaqItem } from '@/lib/faq-data'
import { cn } from '@/lib/utils/cn'
import { MarketingSectionHeader } from './marketing-shell'
import { Reveal } from './reveal'

export function FaqList({
  items,
  openFirst = true,
  className,
}: {
  items: readonly FaqItem[]
  openFirst?: boolean
  className?: string
}) {
  return (
    <div className={cn('marketing-faq-list', className)}>
      {items.map((item, i) => (
        <details key={item.q} className="marketing-faq-item group" open={openFirst && i === 0}>
          <summary className="marketing-faq-trigger marketing-faq-summary min-h-14 px-5 py-4 md:px-6">
            <span className="text-[15px] md:text-base">{item.q}</span>
            <ChevronDown
              className="marketing-faq-chevron h-4 w-4 shrink-0 text-mk-muted transition-transform duration-200"
              aria-hidden
            />
          </summary>
          <div className="motion-safe:group-open:animate-[fade-rise_0.3s_ease-out]">
            <p className="px-5 pb-5 text-base leading-relaxed text-mk-body md:px-6">{item.a}</p>
          </div>
        </details>
      ))}
    </div>
  )
}

export function FaqSection({
  showIntro = true,
  items = HOME_FAQ_ITEMS,
  className,
}: {
  showIntro?: boolean
  items?: readonly FaqItem[]
  className?: string
}) {
  return (
    <section
      className={cn(showIntro ? 'marketing-canvas-pad' : 'pb-14 pt-6 md:pb-20 md:pt-8', className)}
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
              description="Answers for developers evaluating the food calorie API, search, and barcode lookup."
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
