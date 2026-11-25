import Link from 'next/link'
import { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'
import { MarketingSheet, MarketingSheetHero } from './marketing-sheet'
import { LegalToc } from './legal-toc'
import { LegalMobileNav } from './legal-mobile-nav'
import { BackToTop } from './back-to-top'

export type LegalBlock =
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }

export type LegalSection = {
  id?: string
  title: string
  blocks: LegalBlock[]
}

const SUBCLAUSE_PATTERN = /^\d+\.\d+\s/

function renderInventoryItem(item: string): ReactNode {
  const sepIndex = item.indexOf(' - ')
  if (sepIndex === -1 || !/^[a-z_]/.test(item)) return item
  const lead = item.slice(0, sepIndex)
  const rest = item.slice(sepIndex)
  const parenIndex = lead.indexOf(' (')
  const token = parenIndex === -1 ? lead : lead.slice(0, parenIndex)
  const qualifier = parenIndex === -1 ? '' : lead.slice(parenIndex)
  return (
    <>
      <code className="rounded-md border border-mk-hair bg-mk-stage px-1.5 py-0.5 font-mono text-[13px] text-mk-ink">
        {token}
      </code>
      {qualifier}
      {rest}
    </>
  )
}

export function LegalDocumentBody({
  sections,
  codeListLeads,
}: {
  sections: LegalSection[]

  codeListLeads?: boolean
}) {
  return (
    <div className="legal-document divide-y divide-mk-hair">
      {sections.map((section) => (
        <section
          key={section.id ?? section.title}
          id={section.id}
          className="scroll-mt-4 py-8 first:pt-0 last:pb-0"
        >
          <h2 className="mb-4 text-xl font-semibold tracking-[-0.02em] text-mk-ink md:text-2xl">
            {section.title}
          </h2>
          <div className="space-y-3">
            {section.blocks.map((block, i) => {
              if (block.type === 'p') {
                return (
                  <p
                    key={i}
                    className={cn(
                      'text-[15px] md:text-base leading-relaxed',
                      SUBCLAUSE_PATTERN.test(block.text)
                        ? 'pt-3 font-semibold text-mk-ink'
                        : 'text-mk-muted'
                    )}
                  >
                    {block.text}
                  </p>
                )
              }
              return (
                <ul
                  key={i}
                  className="list-disc pl-4 sm:pl-5 space-y-2 text-[15px] md:text-base text-mk-muted leading-relaxed"
                >
                  {block.items.map((item) => (
                    <li key={item} className="break-words">
                      {codeListLeads ? renderInventoryItem(item) : item}
                    </li>
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

const LEGAL_NAV = [
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms' },
  { href: '/cookies', label: 'Cookies' },
  { href: '/commercial-license', label: 'Commercial License' },
] as const

type LegalPath = (typeof LEGAL_NAV)[number]['href']

const CROSS_LINK_CLASS =
  'text-brand-strong underline decoration-brand/40 underline-offset-2 hover:decoration-brand-strong ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 rounded-sm'

export function LegalPageShell({
  title,
  tagline,
  effectiveDate,
  path,
  sections,
  footerNote,
  codeListLeads,
}: {
  title: string
  tagline: string
  effectiveDate: string

  path: LegalPath
  sections: LegalSection[]
  footerNote?: ReactNode
  codeListLeads?: boolean
}) {
  const tocItems = sections.flatMap((section) =>
    section.id ? [{ id: section.id, title: section.title }] : []
  )

  return (
    <div className="marketing-page">
      <MarketingSheetHero
        marks={[]}
        badge={`Food Database API · Effective ${effectiveDate}`}
        title={title}
        lead={tagline}
      >
        <nav aria-label="Legal pages" className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {LEGAL_NAV.map((item) => {
            const active = item.href === path
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'inline-flex h-9 cursor-pointer items-center rounded-full border px-4 text-sm font-medium transition-colors duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2',
                  active
                    ? 'border-brand bg-brand text-mk-ink'
                    : 'border-mk-line bg-white text-mk-muted hover:bg-mk-stage hover:text-mk-ink'
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
      </MarketingSheetHero>

      <MarketingSheet aria-label={title}>
        <div className="container-narrow">
          <div className="lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[16rem_minmax(0,1fr)] xl:gap-14">
            <div className="hidden lg:block">
              <LegalToc
                items={tocItems}
                className="sticky top-[calc(var(--site-header-offset)+1.5rem)] max-h-[calc(100vh-var(--site-header-offset)-3rem)] overflow-y-auto pr-1"
              />
            </div>
            <div className="min-w-0">
              <article className="mx-auto w-full max-w-3xl lg:mx-0">
                <LegalDocumentBody sections={sections} codeListLeads={codeListLeads} />
              </article>
              <div className="mx-auto mt-10 max-w-3xl border-t border-mk-hair pt-6 lg:mx-0">
                {footerNote && (
                  <p className="mb-4 text-center text-sm leading-relaxed text-mk-muted">
                    {footerNote}
                  </p>
                )}
                <p className="text-center text-sm text-mk-muted">
                  See also{' '}
                  <Link href="/privacy" className={CROSS_LINK_CLASS}>
                    Privacy Policy
                  </Link>
                  ,{' '}
                  <Link href="/terms" className={CROSS_LINK_CLASS}>
                    Terms
                  </Link>
                  ,{' '}
                  <Link href="/cookies" className={CROSS_LINK_CLASS}>
                    Cookies
                  </Link>
                  , and{' '}
                  <Link href="/commercial-license" className={CROSS_LINK_CLASS}>
                    Commercial License
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </MarketingSheet>

      <LegalMobileNav items={tocItems} />
      <BackToTop />
    </div>
  )
}
