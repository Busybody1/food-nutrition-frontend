import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Reveal } from '@/components/marketing/reveal'

export type RelatedLink = { label: string; href: string }

function headingIdFor(title: string): string {
  return `related-resources-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`
}

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
      className="marketing-canvas-pad"
      aria-labelledby={headingId}
    >
      <div className="container-prose">
        <Reveal>
          <h2 id={headingId} className="marketing-h3 mb-6">
            {title}
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {links.map((link) => (
              <li key={link.href} className="min-w-0">
                <Link
                  href={link.href}
                  prefetch={false}
                  className="marketing-card group flex h-full items-start gap-3 p-4 text-[15px] font-medium text-mk-ink cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                >
                  <ArrowRight
                    className="w-4 h-4 shrink-0 mt-1 text-mk-muted transition-transform duration-200 motion-safe:group-hover:translate-x-0.5"
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
