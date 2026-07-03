import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export type RelatedLink = { label: string; href: string }

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
  return (
    <section
      className="section-pad bg-white border-t border-surface-border/60"
      aria-label={title}
    >
      <div className="container-narrow max-w-3xl">
        <h2 className="font-display text-2xl md:text-3xl text-ink mb-6">{title}</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                prefetch={false}
                className="inline-flex items-center gap-2 text-sm font-medium text-brand-strong hover:underline"
              >
                <ArrowRight className="w-4 h-4 shrink-0" aria-hidden />
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
