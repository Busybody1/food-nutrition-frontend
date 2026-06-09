import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/metadata'
import CheckoutShell from './checkout-shell'

export const metadata: Metadata = buildPageMetadata({
  title: 'Checkout',
  description: 'Complete your Calorie API subscription checkout.',
  path: '/checkout',
  noIndex: true,
})

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <CheckoutShell>{children}</CheckoutShell>
}
