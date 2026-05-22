import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/metadata'

export const metadata: Metadata = buildPageMetadata({
  title: 'Account',
  description: 'Sign in or create an account for the Calorie API developer dashboard.',
  path: '/auth/login',
  noIndex: true,
})

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children
}
