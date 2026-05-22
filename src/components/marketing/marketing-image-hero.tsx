import Image from 'next/image'
import { ReactNode } from 'react'
import { HERO_IMAGE_SRC } from '@/lib/site'
import { cn } from '@/lib/utils/cn'

type MarketingImageHeroProps = {
  children: ReactNode
  compact?: boolean
  centered?: boolean
  /** Tailwind text-* color for the bottom wave fill (e.g. text-white, text-surface-elevated). */
  waveTone?: 'elevated' | 'white'
}

const WAVE_TONE_CLASS = {
  elevated: 'text-surface-elevated',
  white: 'text-white',
} as const

export function MarketingImageHero({
  children,
  compact = false,
  centered = false,
  waveTone = 'elevated',
}: MarketingImageHeroProps) {
  return (
    <section
      className={cn(
        'hero-home',
        compact && 'hero-home--compact',
        centered && 'hero-home--center'
      )}
    >
      <div className="absolute inset-0" aria-hidden>
        <Image
          src={HERO_IMAGE_SRC}
          alt=""
          fill
          priority
          sizes="100vw"
          className="hero-home__image"
        />
      </div>

      <div className="hero-home__overlay absolute inset-0 z-[1]" aria-hidden />
      <div className="hero-home__glow absolute inset-0 z-[1] pointer-events-none" aria-hidden />

      <div
        className={cn(
          'container-narrow relative z-10 flex min-h-[inherit] items-center',
          centered && 'justify-center'
        )}
      >
        <div
          className={cn(
            'w-full',
            compact ? 'py-14 md:py-20' : 'py-20 md:py-28 lg:py-32',
            centered
              ? 'max-w-2xl mx-auto text-center'
              : 'max-w-xl lg:max-w-2xl text-center lg:text-left'
          )}
        >
          {children}
        </div>
      </div>

      <svg
        className={cn(
          'absolute bottom-0 left-0 z-[2] w-full h-14 md:h-20 pointer-events-none',
          WAVE_TONE_CLASS[waveTone]
        )}
        viewBox="0 0 1440 96"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          fill="currentColor"
          d="M0,56 C240,96 480,24 720,48 C960,72 1200,88 1440,64 L1440,96 L0,96 Z"
        />
      </svg>
    </section>
  )
}
