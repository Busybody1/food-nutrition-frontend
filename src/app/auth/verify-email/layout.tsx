import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/metadata'

export const metadata: Metadata = buildPageMetadata({
  title: 'Verify email',
  description: 'Enter the 6-digit code we emailed you to verify your Calorie API account.',
  path: '/auth/verify-email',
  noIndex: true,
})

export default function VerifyEmailLayout({ children }: { children: React.ReactNode }) {
  return children
}
