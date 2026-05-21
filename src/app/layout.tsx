import type { Metadata } from 'next'
import { Inter, EB_Garamond } from 'next/font/google'
import './globals.css'
import { ConditionalLayout } from '@/components/layout/conditional-layout'
import { StructuredData } from '@/components/seo/structured-data'
import { StripeProvider } from '@/contexts/StripeContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, SUPPORT_EMAIL, absoluteUrl } from '@/lib/site'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })
const garamond = EB_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-display',
})

const ogImage = absoluteUrl('/opengraph-image')

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Food & Nutrition Database API`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  authors: [{ name: 'BusyBody FIT LTD', url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Food & Nutrition Database API`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — Nutrition API for developers`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — Food & Nutrition Database API`,
    description: SITE_DESCRIPTION,
    images: [ogImage],
  },
  alternates: {
    canonical: SITE_URL,
  },
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
  category: 'technology',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`h-full ${inter.variable} ${garamond.variable}`}>
      <head>
        <StructuredData type="organization" />
        <StructuredData type="website" />
      </head>
      <body className="h-full font-sans">
        <ErrorBoundary>
          <AuthProvider>
            <StripeProvider>
              <ConditionalLayout>{children}</ConditionalLayout>
            </StripeProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
