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
    <div className="marketing-page flex min-h-[calc(100svh-var(--site-header-offset))] items-start justify-center px-3 pb-16 pt-[calc(var(--site-header-offset)+2.5rem)] sm:px-4">
      <div className="w-full max-w-md animate-rise rounded-[24px] border border-mk-hair bg-white p-6 shadow-sheet sm:p-8 md:p-10">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2.5 rounded-full">
            <span className="relative block h-8 w-8 shrink-0">
              <Image
                src="/logos/busybody-logo.png"
                alt={`${SITE_NAME} logo`}
                fill
                sizes="32px"
                className="object-contain"
              />
            </span>
            <span className="text-[15px] font-semibold tracking-[-0.01em] text-mk-ink">{SITE_NAME}</span>
          </Link>
          <h1 className="mt-6 text-balance text-[1.75rem] font-semibold leading-tight tracking-[-0.03em] text-mk-ink md:text-[2rem]">
            {title}
          </h1>
          <p className="mt-2 text-sm text-mk-muted">{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  )
}
