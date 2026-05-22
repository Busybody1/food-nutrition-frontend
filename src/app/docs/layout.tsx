import type { Metadata } from 'next'
import { SITE_NAME } from '@/lib/site'
import { buildPageMetadata } from '@/lib/metadata'

export const metadata: Metadata = buildPageMetadata({
  title: 'API Documentation',
  description: `Integrate ${SITE_NAME}: authentication, search, barcode lookup, rate limits, and code examples.`,
  path: '/docs',
})

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
