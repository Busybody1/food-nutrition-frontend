import Link from 'next/link'
import {
  Camera,
  Scale,
  ScanBarcode,
  Search,
  Target,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react'
import { MarketingImageHero } from '@/components/marketing/marketing-image-hero'
import {
  MarketingCtaBand,
  MarketingFeatureCard,
  MarketingSectionHeader,
  MarketingTrustPills,
} from '@/components/marketing/marketing-shell'
import { Reveal, RevealGroup } from '@/components/marketing/reveal'
import { FaqList } from '@/components/marketing/faq-section'
import { McpConnectPanel } from '@/components/marketing/mcp-connect-panel'
import { McpEndpointBar } from '@/components/marketing/mcp-endpoint-bar'
import { McpTrialBar } from '@/components/marketing/mcp-trial-bar'
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

const USES: { icon: LucideIcon; title: string; description: string }[] = [
  { icon: Search, title: MCP_FEATURE_TITLES[0], description: 'Name a food. Get calories and a food_id.' },
  { icon: Camera, title: MCP_FEATURE_TITLES[1], description: 'You pass image_base64. The chat does not attach it.' },
  { icon: Scale, title: MCP_FEATURE_TITLES[2], description: 'Scale that food to the grams you ate.' },
  { icon: UtensilsCrossed, title: MCP_FEATURE_TITLES[3], description: 'Total the ingredients, then split per serving.' },
  { icon: ScanBarcode, title: MCP_FEATURE_TITLES[4], description: 'UPC or EAN. A fallback if the catalog misses.' },
  { icon: Target, title: MCP_FEATURE_TITLES[5], description: 'Calories from age, weight, and goal.' },
]

const TRANSCRIPT: { who: string; text: string; code?: string }[] = [
  { who: 'You', text: 'How many calories and how much protein are in 180 g of cooked chicken breast?' },
  {
    who: 'search_foods',
    text: 'Cooked chicken breast, per 100 g.',
    code: '{ "kcal": 165, "protein_g": 31 } per 100 g',
  },
  {
    who: 'calculate_portion',
    text: 'Same food, scaled to 180 g.',
    code: '{ "kcal": 297, "protein_g": 55.8 }',
  },
]

export function McpLanding() {
  const endpoint = mcpEndpoint()
  const savings = annualSavingsUsd(MCP_MONTHLY_USD, MCP_ANNUAL_USD)
  const annualMonthly = annualAsMonthlyUsd(MCP_ANNUAL_USD)
  const faqs = MCP_PAGE_FAQS

  return (
    <div className="marketing-page pb-24 lg:pb-0">
      <MarketingImageHero centered waveTone="elevated">
        <p className="marketing-hero-badge mb-4 inline-flex">Nutrition MCP</p>
        <h1 className="font-display text-4xl text-ink text-balance md:text-6xl">
          {MCP_LANDING_H1}
        </h1>
        <p id="mcp-answer" className="aeo-answer mx-auto mt-5 max-w-xl text-lg leading-relaxed text-ink-muted">
          {mcpLandingLead(FOOD_DATABASE_SIZE_LABEL)}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/mcp/pricing" className="btn-brand h-12 px-8 text-base">
            Start 7-day trial
          </Link>
        </div>
        <McpEndpointBar endpoint={endpoint} />
        <div className="mt-6">
          <MarketingTrustPills items={['Claude Code, GPT, and Cursor', 'Cancel anytime']} />
        </div>
      </MarketingImageHero>

      <section className="section-pad bg-white" aria-labelledby="mcp-steps-heading">
        <div className="container-narrow">
          <MarketingSectionHeader id="mcp-steps-heading" title="How to connect a nutrition MCP server" />
          <RevealGroup className="grid gap-4 md:grid-cols-3" itemClassName="h-full min-w-0">
            {MCP_CONNECT_STEPS.map((step, index) => (
              <div key={step.name} className={index === 0 ? 'marketing-card card-hairline h-full p-6' : 'marketing-card h-full p-6'}>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-sm font-semibold text-ink">
                  {index + 1}
                </span>
                <h3 className="mt-4 text-lg font-semibold text-ink">{step.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{step.text}</p>
              </div>
            ))}
          </RevealGroup>
        </div>
      </section>

      <section id="connect" className="section-pad scroll-mt-28 bg-surface-elevated" aria-labelledby="mcp-connect-heading">
        <div className="container-narrow">
          <MarketingSectionHeader
            id="mcp-connect-heading"
            title="Connect Claude Code and Cursor"
            description="Paste this nutrition MCP server config into Claude Code or Cursor. Replace YOUR_KEY after checkout."
          />
          <Reveal>
            <McpConnectPanel initialTab="claude-code" />
          </Reveal>
        </div>
      </section>

      <section className="section-pad bg-white" aria-labelledby="mcp-uses-heading">
        <div className="container-narrow">
          <MarketingSectionHeader
            id="mcp-uses-heading"
            title="Nutrition MCP server tools"
            description={
              <>
                Eight calls. The{' '}
                <Link href="/docs/mcp" className="font-medium text-brand-strong underline underline-offset-2">
                  docs
                </Link>{' '}
                list every argument.
              </>
            }
          />
          <RevealGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-5" itemClassName="h-full min-w-0">
            {USES.map((item) => (
              <MarketingFeatureCard key={item.title} icon={item.icon} title={item.title} description={item.description} />
            ))}
          </RevealGroup>
        </div>
      </section>

      <section className="section-pad bg-surface-elevated" aria-labelledby="mcp-session-heading">
        <div className="container-narrow">
          <MarketingSectionHeader
            id="mcp-session-heading"
            title="Track calories with Claude from a catalog lookup"
          />
          <Reveal>
            <ol className="mx-auto max-w-2xl space-y-3">
              {TRANSCRIPT.map((turn) => {
                const isYou = turn.who === 'You'
                return (
                  <li key={turn.who} className={isYou ? 'flex justify-end' : ''}>
                    <div
                      className={
                        isYou
                          ? 'max-w-[90%] rounded-brand rounded-br-md bg-brand px-4 py-3 text-ink'
                          : 'max-w-[90%] rounded-brand border border-surface-border bg-white p-4 shadow-glass'
                      }
                    >
                      <p className={isYou ? 'text-sm font-semibold text-ink' : 'text-xs font-semibold uppercase tracking-wide text-ink-dim'}>
                        {turn.who}
                      </p>
                      <p className="mt-1.5 leading-relaxed text-ink">{turn.text}</p>
                      {turn.code ? (
                        <pre className="mt-3 overflow-x-auto rounded-brand bg-ink px-4 py-3 font-mono text-xs leading-relaxed text-white">
                          {turn.code}
                        </pre>
                      ) : null}
                    </div>
                  </li>
                )
              })}
            </ol>
          </Reveal>
        </div>
      </section>

      <section className="section-pad bg-white" aria-labelledby="mcp-photo-heading">
        <div className="container-narrow grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
          <div>
            <h2 id="mcp-photo-heading" className="font-display text-3xl tracking-tight text-ink text-balance md:text-4xl">
              Estimate calories from a food photo.
            </h2>
            <p className="mt-4 max-w-md leading-relaxed text-ink-muted">
              Dropping a picture into the chat does not send it. Pass raw base64, no data: prefix.
              JPEG, PNG, or WebP, up to 2 MB.
            </p>
          </div>
          <Reveal className="marketing-card p-6">
            <div className="mb-4 flex items-center gap-3">
              <span className="marketing-feature-icon mb-0">
                <Camera className="h-6 w-6 text-brand-strong" aria-hidden />
              </span>
              <h3 className="text-lg font-semibold text-ink">analyze_food_photo</h3>
            </div>
            <pre className="overflow-x-auto rounded-brand bg-ink px-4 py-3 font-mono text-xs leading-relaxed text-white">
              {`{
  "image_base64": "<raw base64>",
  "content_type": "image/jpeg"
}`}
            </pre>
          </Reveal>
        </div>
      </section>

      <section className="section-pad bg-surface-elevated" aria-labelledby="mcp-limits-heading">
        <div className="container-narrow">
          <MarketingSectionHeader id="mcp-limits-heading" label="Limits" title="Nutrition MCP server limits" />
          <div className="mx-auto grid max-w-4xl gap-5 md:grid-cols-2">
            <div className="marketing-card card-hairline flex h-full flex-col p-6 ring-2 ring-brand/25">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-strong">7-day trial</p>
              <ul className="mt-4 space-y-2 text-sm text-ink">
                <li>{MCP_TRIAL_LIMITS.perMinute} calls per minute</li>
                <li>{MCP_TRIAL_LIMITS.totalCalls} calls total</li>
                <li>{MCP_TRIAL_LIMITS.results} foods per search</li>
                <li>{MCP_TRIAL_LIMITS.visionTotal} photos</li>
              </ul>
              <Link href="/mcp/pricing" className="btn-brand mt-6 h-11 w-full">
                Start 7-day trial
              </Link>
            </div>
            <div className="marketing-card h-full p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">After the trial</p>
              <ul className="mt-4 space-y-2 text-sm text-ink">
                <li>{MCP_PAID_LIMITS.perMinute} calls per minute</li>
                <li>{MCP_PAID_LIMITS.perMonth.toLocaleString('en-US')} calls a month</li>
                <li>{MCP_PAID_LIMITS.results} foods per search</li>
                <li>
                  {MCP_PAID_LIMITS.visionMonth} photos a month, {MCP_PAID_LIMITS.visionDay} a day
                </li>
              </ul>
              <p className="mt-6 text-sm leading-relaxed text-ink-muted">
                An app or a resale needs{' '}
                <Link href="/pricing" className="font-medium text-brand-strong underline underline-offset-2">
                  a REST plan
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad bg-white" id="faq" aria-labelledby="mcp-faq-heading">
        <div className="container-narrow">
          <MarketingSectionHeader id="mcp-faq-heading" title="Nutrition MCP server questions" />
          <FaqList items={faqs} />
        </div>
      </section>

      <MarketingCtaBand
        title="Start a nutrition MCP server trial"
        description={
          <>
            ${MCP_MONTHLY_USD}/month or ${annualMonthly}/month.
            {savings > 0 ? (
              <span className="font-semibold text-red-600"> ${savings} USD Off.</span>
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
