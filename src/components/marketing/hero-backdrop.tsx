import {
  BarcodeIcon,
  BracketsCurlyIcon,
  DatabaseIcon,
  ForkKnifeIcon,
  MagnifyingGlassIcon,
  SparkleIcon,
} from '@phosphor-icons/react/ssr'
import { cn } from '@/lib/utils/cn'
import { discToneClass, type DiscTone, type MarketingIcon } from '@/components/marketing/marketing-shell'

export type HeroMark = { icon: MarketingIcon; tone: DiscTone }

export const DEFAULT_HERO_MARKS: readonly HeroMark[] = [
  { icon: MagnifyingGlassIcon, tone: 'blue' },
  { icon: BarcodeIcon, tone: 'coral' },
  { icon: BracketsCurlyIcon, tone: 'violet' },
  { icon: DatabaseIcon, tone: 'green' },
  { icon: SparkleIcon, tone: 'blue' },
  { icon: ForkKnifeIcon, tone: 'coral' },
]

const RINGS = [
  { size: 300, opacity: 1, visibility: '' },
  { size: 540, opacity: 0.9, visibility: 'hidden md:block' },
  { size: 780, opacity: 0.75, visibility: 'hidden md:block' },
  { size: 1040, opacity: 0.6, visibility: 'hidden lg:block' },
  { size: 1300, opacity: 0.45, visibility: 'hidden lg:block' },
  { size: 1560, opacity: 0.3, visibility: 'hidden lg:block' },
] as const

const ORBIT_RADIUS = 620
const MARK_COUNT = 8
const MARK_ANGLES = Array.from({ length: MARK_COUNT }, (_, index) => 20 + index * (360 / MARK_COUNT))

function markPosition(angle: number) {
  const radians = (angle * Math.PI) / 180
  return {
    left: `${(Math.cos(radians) * ORBIT_RADIUS).toFixed(1)}px`,
    top: `${(Math.sin(radians) * ORBIT_RADIUS).toFixed(1)}px`,
  }
}

function orbitSlots(marks: readonly HeroMark[]): readonly HeroMark[] {
  if (marks.length === 0) return marks
  const extras = DEFAULT_HERO_MARKS.filter((fallback) => !marks.some((mark) => mark.icon === fallback.icon))
  const unique = [...marks, ...extras].slice(0, 6)
  return MARK_ANGLES.map((_, index) => unique[index % unique.length])
}

export function HeroBackdrop({ marks = DEFAULT_HERO_MARKS }: { marks?: readonly HeroMark[] }) {
  const orbitMarks = orbitSlots(marks)
  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-0 w-0" aria-hidden>
      {RINGS.map(({ size, opacity, visibility }) => (
        <span
          key={size}
          className={cn('marketing-orbit-ring', visibility)}
          style={{ width: size, height: size, opacity }}
        />
      ))}
      {orbitMarks.length > 0 && (
        <div className="hero-orbit-flat hidden xl:block">
          <span className="marketing-orbit-ring" style={{ width: ORBIT_RADIUS * 2, height: ORBIT_RADIUS * 2 }} />
          <div className="marketing-orbit-spin marketing-orbit-spin--flat">
            {orbitMarks.map(({ icon: Icon, tone }, index) => (
              <span
                key={MARK_ANGLES[index]}
                className="marketing-orbit-mark"
                style={markPosition(MARK_ANGLES[index])}
              >
                <span className="marketing-orbit-face hero-orbit-face">
                  <Icon weight="fill" className={cn('h-5 w-5', discToneClass(tone))} />
                </span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
