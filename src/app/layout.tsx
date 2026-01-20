import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ConditionalLayout } from "@/components/layout/conditional-layout"
import { StructuredData } from "@/components/seo/structured-data"
import { StripeProvider } from "@/contexts/StripeContext"
import { AuthProvider } from "@/contexts/AuthContext"
import { ErrorBoundary } from "@/components/ui/error-boundary"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "Busybody - Comprehensive Food & Nutrition Database API",
    template: "%s | Busybody"
  },
  description: "Access comprehensive nutrition data with advanced search capabilities. Perfect for developers building health, fitness, and nutrition applications. 900K+ food items, 28 nutrients, 99.9% uptime.",
  keywords: [
    "food api", "nutrition api", "food database", "nutrition data", "health api", "fitness api",
    "food search api", "nutritional information", "calorie data", "food ingredients", "diet api",
    "health tech", "wellness api", "food tracking", "meal planning", "nutrition analysis"
  ],
  authors: [{ name: "Busybody Team", url: "https://busybody.com" }],
  creator: "Busybody",
  publisher: "Busybody",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://busybody.com",
    siteName: "Busybody",
    title: "Busybody - Comprehensive Food & Nutrition Database API",
    description: "Access comprehensive nutrition data with advanced search capabilities. Perfect for developers building health, fitness, and nutrition applications.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Busybody - Food & Nutrition Database API",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@busybody",
    creator: "@busybody",
    title: "Busybody - Comprehensive Food & Nutrition Database API",
    description: "Access comprehensive nutrition data with advanced search capabilities. Perfect for developers building health, fitness, and nutrition applications.",
    images: ["/twitter-image.jpg"],
  },
  verification: {
    google: "your-google-verification-code",
  },
  alternates: {
    canonical: "https://busybody.com",
  },
  category: "technology",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <StructuredData type="organization" />
        <StructuredData type="website" />
      </head>
      <body className={`${inter.className} h-full antialiased`}>
        <ErrorBoundary>
          <AuthProvider>
            <StripeProvider>
              <ConditionalLayout>
                {children}
              </ConditionalLayout>
            </StripeProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}