import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/metadata'

export const metadata: Metadata = buildPageMetadata({
  title: 'Feedback',
  description: 'Private feedback link for Calorie API customers.',
  path: '/feedback',
  noIndex: true,
})

export default function FeedbackLayout({ children }: { children: React.ReactNode }) {
  return children
}
