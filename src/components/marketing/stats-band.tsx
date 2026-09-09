import { MarketingStatStrip } from '@/components/marketing/marketing-shell'
import { Reveal } from '@/components/marketing/reveal'
import { FOOD_DATABASE_SIZE_LABEL } from '@/lib/site'

export function StatsBand() {
  const uptime = process.env.NEXT_PUBLIC_STAT_UPTIME?.trim()
  const latency = process.env.NEXT_PUBLIC_STAT_LATENCY?.trim()

  const stats = [
    { value: FOOD_DATABASE_SIZE_LABEL, label: 'foods in database' },
    { value: 'UPC + EAN', label: 'barcode lookup with fallback' },
    ...(latency ? [{ value: latency, label: 'median response time' }] : []),
    ...(uptime ? [{ value: uptime, label: 'uptime' }] : []),
    { value: 'Free', label: 'developer tier, no card required' },
  ].slice(0, 4)

  return (
    <section className="section-pad-sm bg-white" aria-label="Platform stats">
      <div className="container-narrow">
        <Reveal>
          <div className="rounded-brand border border-brand/15 bg-brand-muted/40 px-4 py-8 sm:px-6 md:px-8 md:py-10">
            <MarketingStatStrip stats={stats} />
          </div>
        </Reveal>
      </div>
    </section>
  )
}
