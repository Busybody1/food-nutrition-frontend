'use client'

import { usePathname } from 'next/navigation'
import { Header } from './header'
import { Footer } from './footer'

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname()
  
  // Don't show header and footer for dashboard pages
  const isDashboardPage = pathname?.startsWith('/dashboard')
  
  if (isDashboardPage) {
    return <>{children}</>
  }
  
  return (
    <div className="min-h-full flex flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}
