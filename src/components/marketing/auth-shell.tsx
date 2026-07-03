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
    <div className="marketing-page hero-glow flex min-h-[calc(100svh-var(--site-header-offset))] items-center justify-center px-4 pb-16 pt-[calc(var(--site-header-offset)+2rem)]">
      {/* Decorative depth blobs — clipped by hero-glow's overflow-hidden. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 right-[8%] h-72 w-72 rounded-full bg-brand/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 left-[6%] h-64 w-64 rounded-full bg-accent-orange/10 blur-3xl"
      />
      <div className="relative z-10 w-full max-w-md space-y-8">
        <div className="animate-rise text-center">
          <Link
            href="/"
            className="group inline-flex items-center gap-2.5 rounded-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2"
          >
            <span className="relative block h-10 w-10 shrink-0 transition-transform duration-200 motion-safe:group-hover:-translate-y-0.5">
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
          <h1 className="mt-6 font-display text-3xl md:text-4xl text-ink tracking-tight text-balance">{title}</h1>
          <p className="mt-3 text-sm text-ink-muted">{subtitle}</p>
        </div>
        <div className="glass-panel card-hairline animate-rise stagger-2 p-6 shadow-glass-lg md:p-8">{children}</div>
      </div>
    </div>
  )
}
