import { MarketingStatStrip } from '@/components/marketing/marketing-shell'
import { FOOD_DATABASE_SIZE_LABEL } from '@/lib/site'

/**
 * Trust stats: catalog facts always show; performance claims (uptime, latency)
 * only render when set via env so we never publish unmeasured numbers.
 * NEXT_PUBLIC_STAT_UPTIME e.g. "99.9%" · NEXT_PUBLIC_STAT_LATENCY e.g. "120ms"
 */
export function StatsBand() {
  const uptime = process.env.NEXT_PUBLIC_STAT_UPTIME?.trim()
  const latency = process.env.NEXT_PUBLIC_STAT_LATENCY?.trim()

  const stats = [
    { value: FOOD_DATABASE_SIZE_LABEL, label: 'foods in database' },
    { value: 'UPC + EAN', label: 'barcode lookup with fallback' },
    ...(latency ? [{ value: latency, label: 'median response time' }] : []),
    ...(uptime ? [{ value: uptime, label: 'uptime' }] : []),
    { value: 'Free', label: 'developer tier — no card required' },
  ].slice(0, 4)

  return (
    <section className="section-pad bg-white border-t border-surface-border/60" aria-label="Platform stats">
      <div className="container-narrow">
        <MarketingStatStrip stats={stats} />
      </div>
    </section>
  )
}
