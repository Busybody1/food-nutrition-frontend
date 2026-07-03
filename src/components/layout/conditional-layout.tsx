'use client'

import { usePathname } from 'next/navigation'
import { Header } from './header'
import { Footer } from './footer'

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname()
  
  // App shells provide their own chrome (no marketing header/footer)
  const isAppShell =
    pathname?.startsWith('/dashboard') || pathname?.startsWith('/admin')

  if (isAppShell) {
    return <>{children}</>
  }
  
  return (
    <div className="site-layout">
      <Header />
      <main id="main-content" tabIndex={-1} className="site-layout__main outline-none">
        {children}
      </main>
      <Footer />
    </div>
  )
}
