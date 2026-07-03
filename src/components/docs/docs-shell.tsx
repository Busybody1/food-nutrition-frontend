import Link from 'next/link'
import { DocsSidebar } from '@/components/docs/docs-sidebar'
import { buildDocsNavGroups } from '@/lib/docs/nav'

const FOOTER_LINK_CLASS =
  'rounded-lg font-medium text-brand-strong underline decoration-brand/40 underline-offset-2 hover:decoration-brand-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2'

/** Shared docs chrome: sidebar + main column. Server component; sidebar hydrates on the client. */
export function DocsShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="docs-layout bg-white">
      <DocsSidebar groups={buildDocsNavGroups()} />
      <main className="docs-main">
        {children}
        <footer className="mt-12 border-t border-surface-border/60 pt-8">
          <div className="rounded-brand border border-surface-border/70 bg-surface-elevated/70 px-6 py-8 text-center text-ink-muted">
            <p className="mb-3">Need help? Contact our support team or check our FAQ.</p>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
              <Link href="/contact" className={FOOTER_LINK_CLASS}>Support</Link>
              <Link href="/faq" className={FOOTER_LINK_CLASS}>FAQ</Link>
              <Link href="/api-status" className={FOOTER_LINK_CLASS}>Status</Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
