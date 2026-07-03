import type { Metadata } from 'next'

/** Shared auth shell, per-route canonicals live in login/register layouts. */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children
}
