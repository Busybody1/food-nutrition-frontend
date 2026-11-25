import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Join a team',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
}

export default function TeamAcceptLayout({ children }: { children: React.ReactNode }) {
  return children
}
