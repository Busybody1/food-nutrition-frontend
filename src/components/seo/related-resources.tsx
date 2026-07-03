import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Reveal } from '@/components/marketing/reveal'

export type RelatedLink = { label: string; href: string }

function headingIdFor(title: string): string {
  return `related-resources-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`
}

/**
 * Cluster-linking section: descriptive contextual links between docs, guides,
 * capability, solution, comparison, and blog pages.
 */
export function RelatedResources({
  links,
  title = 'Related resources',
}: {
  links: RelatedLink[]
  title?: string
}) {
  if (links.length === 0) return null
  const headingId = headingIdFor(title)
  return (
    <section
      className="section-pad-sm bg-white border-t border-surface-border/60"
      aria-labelledby={headingId}
    >
      <div className="container-prose">
        <Reveal>
          <h2
            id={headingId}
            className="font-display text-3xl md:text-4xl tracking-tight text-ink mb-6"
          >
            {title}
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {links.map((link) => (
              <li key={link.href} className="min-w-0">
                <Link
                  href={link.href}
                  prefetch={false}
                  className="marketing-card group flex h-full items-start gap-3 p-4 text-sm font-medium text-ink cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2"
                >
                  <ArrowRight
                    className="w-4 h-4 shrink-0 mt-0.5 text-brand-strong transition-transform duration-200 motion-safe:group-hover:translate-x-0.5"
                    aria-hidden
                  />
                  <span className="min-w-0">{link.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}
