import Link from 'next/link'
import { BarcodeIcon, CameraIcon, ForkKnifeIcon, MagnifyingGlassIcon, ScalesIcon, TargetIcon } from '@phosphor-icons/react/ssr'
import type { MarketingIcon } from '@/components/marketing/marketing-shell'
import {
  MarketingCtaBand,
  MarketingFeatureGrid,
  MarketingIconDisc,
  MarketingSectionHeader,
  MarketingTrustPills,
} from '@/components/marketing/marketing-shell'
import {
  MarketingSheet,
  MarketingSheetHero,
  MarketingSplit,
  MarketingSplitCopy,
} from '@/components/marketing/marketing-sheet'
import { MarketingFloatCard } from '@/components/marketing/marketing-cards'
import { Reveal, RevealGroup } from '@/components/marketing/reveal'
import { FaqList } from '@/components/marketing/faq-section'
import { McpConnectPanel } from '@/components/marketing/mcp-connect-panel'
import { McpEndpointBar } from '@/components/marketing/mcp-endpoint-bar'
import { McpTrialBar } from '@/components/marketing/mcp-trial-bar'
import { McpTranscript } from '@/components/marketing/mcp-transcript'
import {
  MCP_ANNUAL_USD,
  MCP_CONNECT_STEPS,
  MCP_FEATURE_TITLES,
  MCP_LANDING_H1,
  MCP_MONTHLY_USD,
  MCP_PAGE_FAQS,
  mcpLandingLead,
  MCP_PAID_LIMITS,
  MCP_TRIAL_LIMITS,
  annualAsMonthlyUsd,
  annualSavingsUsd,
  mcpEndpoint,
} from '@/lib/mcp/catalog'
import { FOOD_DATABASE_SIZE_LABEL } from '@/lib/site'

const USES: { icon: MarketingIcon; title: string; description: string }[] = [
  { icon: MagnifyingGlassIcon, title: MCP_FEATURE_TITLES[0], description: 'Name a food. Get calories and a food_id.' },
  { icon: CameraIcon, title: MCP_FEATURE_TITLES[1], description: 'You pass image_base64. The chat does not attach it.' },
  { icon: ScalesIcon, title: MCP_FEATURE_TITLES[2], description: 'Scale that food to the grams you ate.' },
  { icon: ForkKnifeIcon, title: MCP_FEATURE_TITLES[3], description: 'Total the ingredients, then split per serving.' },
  { icon: BarcodeIcon, title: MCP_FEATURE_TITLES[4], description: 'UPC or EAN. A fallback if the catalog misses.' },
  { icon: TargetIcon, title: MCP_FEATURE_TITLES[5], description: 'Calories from age, weight, and goal.' },
]

export function McpLanding() {
  const endpoint = mcpEndpoint()
  const savings = annualSavingsUsd(MCP_MONTHLY_USD, MCP_ANNUAL_USD)
  const annualMonthly = annualAsMonthlyUsd(MCP_ANNUAL_USD)
  const faqs = MCP_PAGE_FAQS

  return (
    <div className="marketing-page pb-24 lg:pb-0">
      <MarketingSheetHero
        badge="Calorie MCP"
        title={MCP_LANDING_H1}
        lead={mcpLandingLead(FOOD_DATABASE_SIZE_LABEL)}
        leadId="mcp-answer"
        leadClassName="aeo-answer"
        actions={
          <Link href="/mcp/pricing" className="btn-brand">
            Start 7-day trial
          </Link>
        }
      >
        <McpEndpointBar endpoint={endpoint} />
        <div className="mt-6">
          <MarketingTrustPills items={['Claude Code, GPT, and Cursor', 'Cancel anytime']} />
        </div>
      </MarketingSheetHero>

      <MarketingSheet aria-labelledby="mcp-steps-heading">
        <div className="container-narrow">
          <MarketingSectionHeader id="mcp-steps-heading" title="How to connect a calorie MCP server" />
          <RevealGroup className="grid gap-x-10 gap-y-10 md:grid-cols-3" itemClassName="h-full min-w-0">
            {MCP_CONNECT_STEPS.map((step, index) => (
              <div key={step.name} className="h-full">
                <span className="marketing-step-number h-9 w-9">{index + 1}</span>
                <h3 className="mt-4 text-base font-semibold tracking-[-0.01em] text-mk-ink">{step.name}</h3>
                <p className="mt-1.5 text-[15px] leading-relaxed text-mk-muted">{step.text}</p>
              </div>
            ))}
          </RevealGroup>
        </div>
      </MarketingSheet>

      <section id="connect" className="marketing-canvas-pad" aria-labelledby="mcp-connect-heading">
        <div className="container-narrow">
          <MarketingSectionHeader
            id="mcp-connect-heading"
            title="Connect Claude Code and Cursor"
            description="Paste this calorie MCP config into Claude Code or Cursor. Replace YOUR_KEY after checkout."
          />
          <Reveal className="mx-auto max-w-3xl">
            <McpConnectPanel initialTab="claude-code" appearance="marketing" />
          </Reveal>
        </div>
      </section>

      <MarketingSheet aria-labelledby="mcp-uses-heading">
        <div className="container-narrow">
          <MarketingSectionHeader
            id="mcp-uses-heading"
            title="Calorie MCP server tools"
            description={
              <>
                Eight calls. The{' '}
                <Link
                  href="/docs/mcp"
                  className="rounded-sm font-medium text-brand-strong underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                >
                  docs
                </Link>{' '}
                list every argument.
              </>
            }
          />
          <MarketingFeatureGrid items={USES} />
        </div>
      </MarketingSheet>

      <MarketingSheet aria-labelledby="mcp-session-heading">
        <div className="container-narrow space-y-20 md:space-y-28">
          <MarketingSplit
            copy={<MarketingSplitCopy titleId="mcp-session-heading" title="Track calories with Claude from a catalog lookup" />}
            aside={
              <Reveal>
                <div className="marketing-callout px-4 py-8 sm:px-8 md:py-10">
                  <McpTranscript />
                </div>
              </Reveal>
            }
          />

          <section aria-labelledby="mcp-photo-heading">
            <MarketingSplit
              reverse
              copy={
                <MarketingSplitCopy
                  titleId="mcp-photo-heading"
                  title="Estimate calories from a food photo."
                  description="Dropping a picture into the chat does not send it. Pass raw base64, no data: prefix. JPEG, PNG, or WebP, up to 2 MB."
                />
              }
              aside={
                <Reveal>
                  <div className="marketing-callout px-4 py-8 sm:px-8 md:py-10">
                    <MarketingFloatCard className="mx-auto max-w-md p-5">
                      <div className="mb-4 flex items-center gap-3">
                        <MarketingIconDisc icon={CameraIcon} tone="violet" />
                        <h3 className="font-mono text-[15px] font-semibold text-mk-ink">analyze_food_photo</h3>
                      </div>
                      <pre className="overflow-x-auto rounded-xl bg-[#0f172a] px-4 py-3 font-mono text-xs leading-relaxed text-slate-200">
                        {`{
  "image_base64": "<raw base64>",
  "content_type": "image/jpeg"
}`}
                      </pre>
                    </MarketingFloatCard>
                  </div>
                </Reveal>
              }
            />
          </section>
        </div>
      </MarketingSheet>

      <section className="marketing-canvas-pad" aria-labelledby="mcp-limits-heading">
        <div className="container-narrow">
          <MarketingSectionHeader id="mcp-limits-heading" title="Calorie MCP server limits" />
          <div className="mx-auto grid max-w-4xl gap-5 md:grid-cols-2">
            <div className="flex h-full flex-col rounded-[22px] border border-mk-hair bg-white p-6 shadow-card-strong md:p-8">
              <p className="text-base font-semibold text-mk-ink">7-day trial</p>
              <ul className="mt-4 flex-1 space-y-2.5 text-[15px] text-mk-ink">
                <li>{MCP_TRIAL_LIMITS.perMinute} calls per minute</li>
                <li>{MCP_TRIAL_LIMITS.totalCalls} calls total</li>
                <li>{MCP_TRIAL_LIMITS.results} foods per search</li>
                <li>{MCP_TRIAL_LIMITS.visionTotal} photos</li>
              </ul>
              <Link href="/mcp/pricing" className="btn-brand mt-6 w-full">
                Start 7-day trial
              </Link>
            </div>
            <div className="flex h-full flex-col rounded-[22px] border border-mk-hair bg-white p-6 shadow-card md:p-8">
              <p className="text-base font-semibold text-mk-ink">After the trial</p>
              <ul className="mt-4 space-y-2.5 text-[15px] text-mk-ink">
                <li>{MCP_PAID_LIMITS.perMinute} calls per minute</li>
                <li>{MCP_PAID_LIMITS.perMonth.toLocaleString('en-US')} calls a month</li>
                <li>{MCP_PAID_LIMITS.results} foods per search</li>
                <li>
                  {MCP_PAID_LIMITS.visionMonth} photos a month, {MCP_PAID_LIMITS.visionDay} a day
                </li>
              </ul>
              <p className="mt-6 text-[15px] leading-relaxed text-mk-muted">
                An app or a resale needs{' '}
                <Link
                  href="/pricing"
                  className="rounded-sm font-medium text-brand-strong underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                >
                  a REST plan
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-14 md:pb-20" id="faq" aria-labelledby="mcp-faq-heading">
        <div className="container-narrow">
          <MarketingSectionHeader id="mcp-faq-heading" title="Calorie MCP questions" />
          <FaqList items={faqs} />
        </div>
      </section>

      <MarketingCtaBand
        title="Start a calorie MCP trial"
        description={
          <>
            ${MCP_MONTHLY_USD}/month or ${annualMonthly}/month.
            {savings > 0 ? (
              <span className="font-semibold text-red-700"> ${savings} USD Off.</span>
            ) : null}{' '}
            Card required.
          </>
        }
        primaryHref="/mcp/pricing"
        primaryLabel="Start 7-day trial"
        secondaryHref="/docs/mcp"
        secondaryLabel="Read the docs"
      />
      <McpTrialBar />
    </div>
  )
}
