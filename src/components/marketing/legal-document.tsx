import Link from 'next/link'
import { ReactNode } from 'react'
import { MarketingHero } from './marketing-hero'

export type LegalBlock =
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }

export type LegalSection = {
  id?: string
  title: string
  blocks: LegalBlock[]
}

export function LegalDocumentBody({ sections }: { sections: LegalSection[] }) {
  return (
    <div className="legal-document space-y-8">
      {sections.map((section) => (
        <section key={section.id ?? section.title} id={section.id} className="scroll-mt-24">
          <h2 className="text-base font-semibold text-ink mb-3">{section.title}</h2>
          <div className="space-y-3">
            {section.blocks.map((block, i) => {
              if (block.type === 'p') {
                return (
                  <p key={i} className="text-sm text-ink-muted leading-relaxed">
                    {block.text}
                  </p>
                )
              }
              return (
                <ul key={i} className="list-disc pl-5 space-y-1.5 text-sm text-ink-muted leading-relaxed">
                  {block.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}

export function LegalPageShell({
  title,
  tagline,
  effectiveDate,
  children,
  footerNote,
}: {
  title: string
  tagline: string
  effectiveDate: string
  children: ReactNode
  footerNote?: ReactNode
}) {
  return (
    <div className="marketing-page">
      <MarketingHero title={title} subtitle={tagline} compact />
      <section className="pb-20 md:pb-28 -mt-4">
        <article className="container-narrow w-full">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-strong mb-6 text-center">
            Food Database API · Effective {effectiveDate}
          </p>
          <div className="marketing-card w-full p-6 md:p-10 lg:p-12">{children}</div>
          {footerNote && (
            <p className="mt-6 text-center text-xs text-ink-dim leading-relaxed">{footerNote}</p>
          )}
          <p className="mt-4 text-center text-sm text-ink-muted">
            See also{' '}
            <Link href="/privacy" className="text-brand-strong hover:underline">
              Privacy Policy
            </Link>
            ,{' '}
            <Link href="/terms" className="text-brand-strong hover:underline">
              Terms
            </Link>
            , and{' '}
            <Link href="/cookies" className="text-brand-strong hover:underline">
              Cookies
            </Link>
            .
          </p>
        </article>
      </section>
    </div>
  )
}
