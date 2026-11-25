import { MarketingStatStrip } from '@/components/marketing/marketing-shell'
import { Reveal } from '@/components/marketing/reveal'
import { FOOD_DATABASE_SIZE_LABEL } from '@/lib/site'
import { cn } from '@/lib/utils/cn'

type PlatformStatKey = 'size' | 'barcode' | 'latency' | 'uptime' | 'free'

function platformStats(): { key: PlatformStatKey; value: string; label: string }[] {
  const uptime = process.env.NEXT_PUBLIC_STAT_UPTIME?.trim()
  const latency = process.env.NEXT_PUBLIC_STAT_LATENCY?.trim()

  return [
    { key: 'size' as const, value: FOOD_DATABASE_SIZE_LABEL, label: 'foods in database' },
    { key: 'barcode' as const, value: 'UPC + EAN', label: 'barcode lookup with fallback' },
    ...(latency ? [{ key: 'latency' as const, value: latency, label: 'median response time' }] : []),
    ...(uptime ? [{ key: 'uptime' as const, value: uptime, label: 'uptime' }] : []),
    { key: 'free' as const, value: 'Free', label: 'developer tier, no card required' },
  ].slice(0, 4)
}

export function StatsBand({
  only,
  variant = 'section',
}: {
  only?: PlatformStatKey[]
  variant?: 'section' | 'inline'
}) {
  const stats = platformStats()
    .filter((stat) => !only || only.includes(stat.key))
    .map(({ value, label }) => ({ value, label }))

  if (stats.length === 0) return null

  if (variant === 'inline') {
    return (
      <div className="mt-10 border-t border-mk-hair pt-8 md:mt-12" aria-label="Platform stats">
        <MarketingStatStrip stats={stats} />
      </div>
    )
  }

  return (
    <section className={cn('marketing-canvas-pad')} aria-label="Platform stats">
      <div className="container-narrow">
        <Reveal>
          <MarketingStatStrip stats={stats} />
        </Reveal>
      </div>
    </section>
  )
}
