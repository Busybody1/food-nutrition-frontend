import {
  Activity,
  Braces,
  Check,
  Database,
  Scale,
  ScanBarcode,
  Search,
  Sparkles,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react'
import { TrackedCtaLink } from '@/components/analytics/tracked-cta-link'
import { getPublicPageSeo } from '@/lib/public-page-seo'
import { cn } from '@/lib/utils/cn'
import { discToneClass, type DiscTone } from './marketing-shell'
import { ExampleResponseStack } from './example-foods'

const HOME_SEO = getPublicPageSeo('/')

const TRUST_ITEMS = ['No credit card for free tier', '99.9% uptime target'] as const

const ORBIT_RINGS = [
  { size: 280, opacity: 1, visibility: '' },
  { size: 480, opacity: 1, visibility: 'hidden md:block' },
  { size: 700, opacity: 0.9, visibility: 'hidden md:block' },
  { size: 940, opacity: 0.75, visibility: 'hidden lg:block' },
  { size: 1180, opacity: 0.6, visibility: 'hidden lg:block' },
  { size: 1420, opacity: 0.45, visibility: 'hidden lg:block' },
] as const

type OrbitMark = { icon: LucideIcon; ring: 2 | 3; angle: number; tone: DiscTone }

const ORBIT_MARKS: OrbitMark[] = [
  { icon: Search, ring: 2, angle: 200, tone: 'blue' },
  { icon: ScanBarcode, ring: 2, angle: 340, tone: 'coral' },
  { icon: Braces, ring: 2, angle: 110, tone: 'violet' },
  { icon: Database, ring: 2, angle: 270, tone: 'green' },
  { icon: Scale, ring: 3, angle: 235, tone: 'violet' },
  { icon: Sparkles, ring: 3, angle: 5, tone: 'blue' },
  { icon: UtensilsCrossed, ring: 3, angle: 150, tone: 'coral' },
  { icon: Activity, ring: 3, angle: 60, tone: 'green' },
]

const ORBIT_SPIN_GROUPS = [
  { ring: 2, className: 'marketing-orbit-spin--outer' },
  { ring: 3, className: 'marketing-orbit-spin--far' },
] as const

function markPosition(mark: OrbitMark) {
  const radius = ORBIT_RINGS[mark.ring].size / 2
  const radians = (mark.angle * Math.PI) / 180
  return {
    left: `calc(50% + ${(Math.cos(radians) * radius).toFixed(1)}px)`,
    top: `calc(50% + ${(Math.sin(radians) * radius).toFixed(1)}px)`,
  }
}

function OrbitBackdrop() {
  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2 h-0 w-0" aria-hidden>
      {ORBIT_RINGS.map(({ size, opacity, visibility }) => (
        <span
          key={size}
          className={cn('marketing-orbit-ring', visibility)}
          style={{ width: size, height: size, opacity }}
        />
      ))}
      {ORBIT_SPIN_GROUPS.map(({ ring, className }) => (
        <div key={ring} className={cn('marketing-orbit-spin hidden lg:block', className)}>
          {ORBIT_MARKS.filter((mark) => mark.ring === ring).map((mark) => {
            const Icon = mark.icon
            const toneText = discToneClass(mark.tone).split(' ')[1]
            return (
              <span key={mark.angle} className="marketing-orbit-mark" style={markPosition(mark)}>
                <span className="marketing-orbit-face">
                  <Icon className={cn('h-[18px] w-[18px]', toneText)} strokeWidth={1.9} />
                </span>
              </span>
            )
          })}
        </div>
      ))}
    </div>
  )
}

export function HomeOrbitHero() {
  return (
    <section data-sheet-hero="">
      <div className="marketing-sheet marketing-sheet--hero">
        <div className="container-narrow relative pb-12 pt-14 text-center md:pb-16 md:pt-20">
          <div className="relative">
            <OrbitBackdrop />
            <div className="relative z-10">
              <h1 className="marketing-display mx-auto max-w-3xl animate-rise-paint">{HOME_SEO.title}</h1>
              <p className="aeo-answer marketing-lead mt-5 animate-rise-paint">{HOME_SEO.description}</p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3 animate-rise stagger-3">
                <TrackedCtaLink href="/auth/register" eventLabel="Get API Key Free" className="btn-brand">
                  Get API Key Free
                </TrackedCtaLink>
                <TrackedCtaLink href="/docs" eventLabel="Read documentation" className="btn-brand-outline">
                  Read documentation
                </TrackedCtaLink>
              </div>
              <ul className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-sm text-mk-muted animate-rise stagger-4">
                {TRUST_ITEMS.map((item) => (
                  <li key={item} className="flex items-center gap-1.5">
                    <Check className="h-4 w-4 shrink-0 text-mk-green" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="relative z-10 mt-10 animate-rise stagger-5 md:mt-12">
            <ExampleResponseStack />
          </div>
        </div>
      </div>
    </section>
  )
}
