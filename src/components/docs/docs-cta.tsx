import Link from 'next/link'
import { FlaskConical } from 'lucide-react'

export function DocsCta() {
  return (
    <aside
      aria-label="Try the API playground"
      className="mt-12 rounded-[22px] border border-mk-hair bg-white p-6 text-center shadow-card md:p-8"
    >
      <Link href="/playground" className="btn-brand">
        <FlaskConical className="h-4 w-4" aria-hidden />
        Open API playground
      </Link>
    </aside>
  )
}
