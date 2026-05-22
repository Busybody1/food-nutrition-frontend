import type { Metadata } from 'next'
import { SITE_NAME } from '@/lib/site'
import { buildPageMetadata } from '@/lib/metadata'

export const metadata: Metadata = buildPageMetadata({
  title: 'Pricing',
  description: `Transparent API pricing for ${SITE_NAME} — free tier, growth plans, and enterprise.`,
  path: '/pricing',
})

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
