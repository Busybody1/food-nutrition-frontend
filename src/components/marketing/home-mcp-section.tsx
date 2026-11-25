import { Camera, Scale, ScanBarcode, Search, Sparkles, Target, UtensilsCrossed } from 'lucide-react'
import { TrackedCtaLink } from '@/components/analytics/tracked-cta-link'
import { MarketingIconDisc, discToneAt } from '@/components/marketing/marketing-shell'
import { MarketingSheet, MarketingSplit, MarketingSplitCopy } from '@/components/marketing/marketing-sheet'
import { McpTranscript } from '@/components/marketing/mcp-transcript'
import { Reveal } from '@/components/marketing/reveal'
import { MCP_ANNUAL_USD, MCP_FEATURE_TITLES, MCP_MONTHLY_USD, MCP_PRODUCT_NAME } from '@/lib/mcp/catalog'
import { FOOD_DATABASE_SIZE_LABEL } from '@/lib/site'

const FEATURE_ICONS = [Search, Camera, Scale, UtensilsCrossed, ScanBarcode, Target]

export function HomeMcpSection() {
  return (
    <MarketingSheet aria-labelledby="home-mcp-heading">
      <div className="container-narrow">
        <MarketingSplit
          reverse
          copy={
            <Reveal>
              <p className="marketing-hero-badge mb-5">
                <Sparkles className="h-3.5 w-3.5 text-mk-violet" aria-hidden />
                {MCP_PRODUCT_NAME}
              </p>
              <MarketingSplitCopy
                titleId="home-mcp-heading"
                title="Calorie data inside Claude and Cursor"
                description={`A calorie MCP lets Claude Code and Cursor look up calories and macros instead of guessing. The catalog covers ${FOOD_DATABASE_SIZE_LABEL}.`}
                actions={
                  <>
                    <TrackedCtaLink href="/mcp/pricing" eventLabel="Start trial" className="btn-brand">
                      Start trial
                    </TrackedCtaLink>
                    <TrackedCtaLink href="/mcp" eventLabel="Explore Calorie MCP" className="btn-brand-outline">
                      Explore Calorie MCP
                    </TrackedCtaLink>
                  </>
                }
              >
                <ul className="mt-7 grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
                  {MCP_FEATURE_TITLES.map((title, index) => (
                    <li key={title} className="flex items-center gap-3 text-[15px] font-medium text-mk-ink">
                      <MarketingIconDisc
                        icon={FEATURE_ICONS[index] ?? Search}
                        tone={discToneAt(index)}
                        className="h-8 w-8 [&>svg]:h-4 [&>svg]:w-4"
                      />
                      {title}
                    </li>
                  ))}
                </ul>
                <p className="mt-6 text-sm text-mk-muted">
                  Personal use is ${MCP_MONTHLY_USD} a month or ${MCP_ANNUAL_USD} a year.
                </p>
              </MarketingSplitCopy>
            </Reveal>
          }
          aside={
            <Reveal delay={120}>
              <div className="marketing-callout px-4 py-8 sm:px-8 md:py-12">
                <McpTranscript />
              </div>
            </Reveal>
          }
        />
      </div>
    </MarketingSheet>
  )
}
