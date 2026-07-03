import { DocsCodeBlock } from '@/components/docs/docs-code-block'
import { FaqList } from '@/components/marketing/faq-section'
import type { DocsBlock } from '@/lib/docs/types'
import type { FaqItem } from '@/lib/faq-data'

export function DocsBlockRenderer({ blocks }: { blocks: DocsBlock[] }) {
  return (
    <>
      {blocks.map((block, i) => {
        switch (block.kind) {
          case 'p':
            return (
              <p key={i} className="text-ink-muted leading-relaxed mb-6 max-w-3xl">
                {block.text}
              </p>
            )
          case 'h2':
            return (
              <h2
                key={i}
                id={block.id}
                className="font-display text-2xl md:text-3xl tracking-tight text-ink mt-10 mb-4 scroll-mt-24"
              >
                {block.text}
              </h2>
            )
          case 'h3':
            return (
              <h3
                key={i}
                id={block.id}
                className="text-xl font-semibold text-ink mt-8 mb-3 scroll-mt-24"
              >
                {block.text}
              </h3>
            )
          /* Requests and JSON responses share one dark code treatment
             (title text moves into the panel header, unchanged). */
          case 'code':
          case 'json':
            return (
              <div key={i} className="mb-6 max-w-3xl">
                <DocsCodeBlock title={block.title} code={block.code} copyable />
              </div>
            )
          case 'params':
            return (
              <div key={i} className="mb-6 max-w-3xl">
                <p className="font-semibold text-ink mb-2">{block.title}</p>
                <div className="space-y-0 text-sm">
                  {block.rows.map((row) => (
                    <div key={row.name} className="docs-param-row">
                      <code className="text-brand-strong shrink-0">{row.name}</code>
                      <span className="text-ink-muted">{row.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          case 'list':
            return (
              <ul key={i} className="text-ink-muted space-y-2 list-disc pl-5 mb-6 max-w-3xl">
                {block.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )
        }
      })}
    </>
  )
}

export function DocsFaqBlock({ faqs }: { faqs: readonly FaqItem[] }) {
  if (faqs.length === 0) return null
  return (
    <section className="mt-12 border-t border-surface-border/60 pt-8" aria-label="Section FAQ">
      <h2 className="font-display text-2xl md:text-3xl tracking-tight text-ink mb-6">
        Frequently asked questions
      </h2>
      <div className="max-w-3xl [&>div]:mx-0 [&>div]:max-w-none">
        <FaqList items={faqs} openFirst={false} />
      </div>
    </section>
  )
}
