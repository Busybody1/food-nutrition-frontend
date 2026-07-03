import Link from 'next/link'
import { DocsSidebar } from '@/components/docs/docs-sidebar'
import { buildDocsNavGroups } from '@/lib/docs/nav'

/** Shared docs chrome: sidebar + main column. Server component; sidebar hydrates on the client. */
export function DocsShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="docs-layout bg-white -mt-1">
      <DocsSidebar groups={buildDocsNavGroups()} />
      <main className="docs-main">
        {children}
        <footer className="border-t border-gray-200 pt-8 mt-12">
          <div className="text-center text-ink-muted">
            <p className="mb-2">Need help? Contact our support team or check our FAQ.</p>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
              <Link href="/contact" className="text-brand-strong hover:underline">Support</Link>
              <Link href="/faq" className="text-brand-strong hover:underline">FAQ</Link>
              <Link href="/api-status" className="text-brand-strong hover:underline">Status</Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
