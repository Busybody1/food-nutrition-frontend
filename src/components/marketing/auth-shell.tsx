import Link from 'next/link'
import Image from 'next/image'
import { ReactNode } from 'react'
import { SITE_NAME } from '@/lib/site'

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: ReactNode
  children: ReactNode
}) {
  return (
    <div className="marketing-page hero-glow min-h-[80vh] flex items-center justify-center py-16 px-4">
      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <span className="relative block h-10 w-10 shrink-0">
              <Image
                src="/logos/busybody-logo.png"
                alt={`${SITE_NAME} logo`}
                fill
                sizes="40px"
                className="object-contain"
              />
            </span>
            <span className="font-semibold text-lg text-ink tracking-tight">{SITE_NAME}</span>
          </Link>
          <h1 className="mt-8 font-display text-3xl text-ink tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-ink-muted">{subtitle}</p>
        </div>
        <div className="glass-panel p-6 md:p-8 shadow-glass-lg">{children}</div>
      </div>
    </div>
  )
}
