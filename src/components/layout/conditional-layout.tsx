'use client'

import { usePathname } from 'next/navigation'
import { Header } from './header'
import { Footer } from './footer'

const PLAIN_CANVAS_PREFIXES = ['/checkout', '/oauth', '/team', '/feedback']

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname()

  const isAppShell =
    pathname?.startsWith('/dashboard') || pathname?.startsWith('/admin')

  if (isAppShell) {
    return <>{children}</>
  }

  const usesPlainCanvas = PLAIN_CANVAS_PREFIXES.some(
    (prefix) => pathname === prefix || pathname?.startsWith(`${prefix}/`)
  )

  return (
    <div className={usesPlainCanvas ? 'site-layout' : 'site-layout site-layout--canvas'}>
      <Header />
      <main id="main-content" tabIndex={-1} className="site-layout__main outline-none">
        {children}
      </main>
      <Footer />
    </div>
  )
}
