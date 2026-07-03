import { ArrowRight, Braces, CreditCard, ShieldCheck, Sparkles } from 'lucide-react'
import { TrackedCtaLink } from '@/components/analytics/tracked-cta-link'
import { MarketingImageHero } from './marketing-image-hero'

const TRUST_ITEMS = [
  { icon: CreditCard, label: 'No credit card for free tier' },
  { icon: Braces, label: 'REST + JSON' },
  { icon: ShieldCheck, label: '99.9% uptime target' },
] as const

export function HomeHero() {
  return (
    <MarketingImageHero waveTone="elevated">
      <p className="marketing-hero-badge mb-6 lg:mb-8 inline-flex gap-1.5 animate-rise stagger-1">
        <Sparkles className="h-3.5 w-3.5 shrink-0 text-accent-orange" aria-hidden />
        Food calorie API for developers
      </p>
      <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.25rem] xl:text-[3.5rem] text-ink leading-[1.05] tracking-tight text-balance animate-rise stagger-2">
        Food Calorie API for production health apps
      </h1>
      <p className="mt-5 md:mt-6 text-lg md:text-xl text-ink-muted leading-relaxed animate-rise stagger-3">
        Ship meal tracking, macro logging, and barcode scan features faster with our nutrition API,
        food database API, and verified calorie data built for production health apps.
      </p>
      <div className="mt-8 md:mt-10 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start animate-rise stagger-4">
        <TrackedCtaLink
          href="/auth/register"
          eventLabel="Get API Key Free"
          className="btn-brand h-12 px-8 text-base group"
        >
          Get API Key Free
          <ArrowRight
            className="ml-2 h-4 w-4 shrink-0 transition-transform duration-200 motion-safe:group-hover:translate-x-0.5"
            aria-hidden
          />
        </TrackedCtaLink>
        <TrackedCtaLink href="/docs" eventLabel="Read documentation" className="btn-brand-outline">
          Read documentation
        </TrackedCtaLink>
      </div>

      <ul className="mt-8 md:mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-2.5 text-sm text-ink-muted animate-rise stagger-5">
        {TRUST_ITEMS.map(({ icon: Icon, label }) => (
          <li
            key={label}
            className="flex items-center gap-2 rounded-pill border border-surface-border/70 bg-white/70 px-3.5 py-1.5 font-medium backdrop-blur-sm"
          >
            <Icon className="h-4 w-4 shrink-0 text-brand-strong" aria-hidden />
            <span>{label}</span>
          </li>
        ))}
      </ul>
    </MarketingImageHero>
  )
}
