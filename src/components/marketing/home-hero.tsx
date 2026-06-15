import Link from 'next/link'
import { Braces, CreditCard, ShieldCheck } from 'lucide-react'
import { MarketingImageHero } from './marketing-image-hero'

const TRUST_ITEMS = [
  { icon: CreditCard, label: 'No credit card for free tier' },
  { icon: Braces, label: 'REST + JSON' },
  { icon: ShieldCheck, label: '99.9% uptime target' },
] as const

export function HomeHero() {
  return (
    <MarketingImageHero waveTone="elevated">
      <p className="marketing-hero-badge mb-6 lg:mb-8 inline-flex">
        Nutrition &amp; food API for developers
      </p>
      <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-[3.25rem] xl:text-[3.5rem] text-ink leading-[1.05] tracking-tight text-balance">
        The ultimate nutrition &amp; food database API
      </h1>
      <p className="mt-5 md:mt-6 text-lg md:text-xl text-ink-muted leading-relaxed">
        Ship meal tracking, macro logging, and barcode scan features faster with search,
        suggest, and verified nutrition data, built for production health apps.
      </p>
      <div className="mt-8 md:mt-10 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
        <Link href="/auth/register" prefetch={false} className="btn-brand">
          Get API Key Free
        </Link>
        <Link href="/docs" prefetch={false} className="btn-brand-outline">
          Read documentation
        </Link>
      </div>

      <ul className="mt-8 md:mt-10 flex flex-col sm:flex-row flex-wrap items-center justify-center lg:justify-start gap-y-3 sm:gap-y-0 text-sm text-ink-muted">
        {TRUST_ITEMS.map(({ icon: Icon, label }, index) => (
          <li
            key={label}
            className={`flex items-center gap-2 ${
              index > 0 ? 'sm:border-l sm:border-surface-border sm:pl-5 sm:ml-5' : ''
            }`}
          >
            <Icon className="h-4 w-4 shrink-0 text-brand-strong" aria-hidden />
            <span>{label}</span>
          </li>
        ))}
      </ul>
    </MarketingImageHero>
  )
}
