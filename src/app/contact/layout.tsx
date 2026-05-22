import type { Metadata } from 'next'
import { SITE_NAME } from '@/lib/site'
import { buildPageMetadata } from '@/lib/metadata'

export const metadata: Metadata = buildPageMetadata({
  title: 'Contact',
  description: `Contact ${SITE_NAME} for API support, sales, and enterprise plans.`,
  path: '/contact',
})

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
