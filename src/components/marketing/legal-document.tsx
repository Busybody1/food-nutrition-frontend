import Link from 'next/link'
import { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'
import { MarketingHero } from './marketing-hero'
import { Reveal } from './reveal'
import { LegalToc } from './legal-toc'

export type LegalBlock =
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }

export type LegalSection = {
  id?: string
  title: string
  blocks: LegalBlock[]
}

/** Single source of truth for the disclaimer shown under every legal document. */
export const LEGAL_DISCLAIMER =
  'These documents are templates and do not constitute legal advice. Please consult a qualified attorney.'

/**
 * Numbered sub-clauses ("2.1 Account Registration", "3.2 Attribution", ...)
 * are stored as plain paragraph blocks in the content files. Detect them so
 * they can carry sub-heading *styling* (visual only — they stay <p> elements,
 * the document outline is frozen).
 */
const SUBCLAUSE_PATTERN = /^\d+\.\d+\s/

/**
 * Cookie-inventory leads look like `session_id - ...` / `_ga, _gid (Google
 * Analytics) - ...`. Wrap the leading identifier in a mono <code> chip.
 * Rendered characters stay byte-identical: token + qualifier + rest === item.
 * Leads starting with an uppercase letter (vendor names, "Privacy Team - ...")
 * are left untouched.
 */
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
      <code className="rounded border border-surface-border/70 bg-surface-elevated px-1.5 py-0.5 font-mono text-[13px] text-ink">
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
  /** Cookie policy only: style leading cookie identifiers in lists as code chips. */
  codeListLeads?: boolean
}) {
  return (
    <div className="legal-document divide-y divide-surface-border/60">
      {sections.map((section) => (
        <section
          key={section.id ?? section.title}
          id={section.id}
          className="scroll-mt-24 py-8 first:pt-0 last:pb-0"
        >
          <h2 className="font-display text-xl md:text-2xl tracking-tight text-ink mb-4">
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
                        ? 'pt-3 font-semibold text-ink'
                        : 'text-ink-muted'
                    )}
                  >
                    {block.text}
                  </p>
                )
              }
              return (
                <ul
                  key={i}
                  className="list-disc pl-4 sm:pl-5 space-y-2 text-[15px] md:text-base text-ink-muted leading-relaxed"
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
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2 rounded-sm'

export function LegalPageShell({
  title,
  tagline,
  effectiveDate,
  path,
  sections,
  footerNote = LEGAL_DISCLAIMER,
  codeListLeads,
}: {
  title: string
  tagline: string
  effectiveDate: string
  /** Route of the current page — highlights the matching pill in the legal nav. */
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
      <MarketingHero
        title={title}
        subtitle={tagline}
        compact
        badge={`Food Database API · Effective ${effectiveDate}`}
      >
        <nav
          aria-label="Legal pages"
          className="flex flex-wrap items-center justify-center gap-2"
        >
          {LEGAL_NAV.map((item) => {
            const active = item.href === path
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'inline-flex h-9 cursor-pointer items-center rounded-pill border px-4 text-sm font-medium transition-colors duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2',
                  active
                    ? 'border-brand/40 bg-brand-muted text-brand-strong'
                    : 'border-surface-border/80 bg-white/70 text-ink-muted hover:border-brand/30 hover:text-brand-strong'
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
      </MarketingHero>

      <section className="pt-8 md:pt-12 pb-20 md:pb-28">
        <div className="container-narrow">
          <div className="lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[16rem_minmax(0,1fr)] xl:gap-14">
            <div className="hidden lg:block">
              <LegalToc
                items={tocItems}
                className="sticky top-[calc(var(--site-header-offset)+1.5rem)] max-h-[calc(100vh-var(--site-header-offset)-3rem)] overflow-y-auto pr-1"
              />
            </div>
            <div className="min-w-0">
              <Reveal>
                <article className="glass-panel card-hairline mx-auto w-full max-w-3xl p-6 md:p-10 lg:mx-0">
                  <LegalDocumentBody sections={sections} codeListLeads={codeListLeads} />
                </article>
              </Reveal>
              <div className="mx-auto max-w-3xl lg:mx-0">
                {footerNote && (
                  <p className="mt-6 text-center text-sm text-ink-muted leading-relaxed">
                    {footerNote}
                  </p>
                )}
                <p className="mt-4 text-center text-sm text-ink-muted">
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
      </section>
    </div>
  )
}
