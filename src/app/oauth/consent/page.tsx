import type { Metadata } from 'next'
import { OAuthConsent } from '@/components/oauth/oauth-consent'

export const metadata: Metadata = {
  title: 'Approve MCP access',
  robots: { index: false, follow: false },
}

export default function OAuthConsentPage() {
  return <OAuthConsent />
}
