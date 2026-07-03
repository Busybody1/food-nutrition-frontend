import Link from 'next/link'
import { ArrowRight, FlaskConical } from 'lucide-react'

/**
 * Compact conversion band for docs subpages. Reuses the existing
 * "Open API playground" CTA from /docs verbatim — no new copy.
 * Server component; safe below metadata-exporting pages.
 */
export function DocsCta() {
  return (
    <aside
      aria-label="Try the API playground"
      className="card-hairline mt-12 rounded-brand border border-brand/15 bg-gradient-to-br from-brand-muted/70 via-white to-white p-6 text-center shadow-glass md:p-8"
    >
      <div
        className="pointer-events-none absolute -bottom-24 left-1/2 h-48 w-80 -translate-x-1/2 rounded-full bg-brand/10 blur-3xl"
        aria-hidden
      />
      <Link href="/playground" className="btn-brand relative">
        <FlaskConical className="mr-2 h-4 w-4" aria-hidden />
        Open API playground
        <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
      </Link>
    </aside>
  )
}
