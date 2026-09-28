import Link from 'next/link'
import {
  Camera,
  KeyRound,
  MessageSquareText,
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
  MarketingStatStrip,
  MarketingTrustPills,
} from '@/components/marketing/marketing-shell'
import { Reveal, RevealGroup } from '@/components/marketing/reveal'
import { FaqList } from '@/components/marketing/faq-section'
import { McpConnectPanel } from '@/components/marketing/mcp-connect-panel'
import { McpEndpointBar } from '@/components/marketing/mcp-endpoint-bar'
import { McpTrialBar } from '@/components/marketing/mcp-trial-bar'
import {
  MCP_ANNUAL_USD,
  MCP_MONTHLY_USD,
  MCP_PAGE_FAQS,
  MCP_PAID_LIMITS,
  MCP_TRIAL_LIMITS,
  annualAsMonthlyUsd,
  annualSavingsUsd,
  mcpEndpoint,
} from '@/lib/mcp/catalog'
import { FOOD_DATABASE_SIZE_LABEL } from '@/lib/site'

const USES: { icon: LucideIcon; title: string; description: string }[] = [
  { icon: Search, title: 'Search', description: 'Name a food. Get calories and a food_id.' },
  { icon: Scale, title: 'Portion', description: 'Scale that food to the grams you ate.' },
  { icon: UtensilsCrossed, title: 'Recipe', description: 'Total the ingredients, then split per serving.' },
  { icon: ScanBarcode, title: 'Barcode', description: 'UPC or EAN. A fallback if the catalog misses.' },
  { icon: Target, title: 'Daily target', description: 'Calories from age, weight, and goal.' },
  { icon: Camera, title: 'Photo', description: 'You pass image_base64. The chat does not attach it.' },
]

const STEPS = [
  { icon: KeyRound, title: 'Start the trial', body: 'A card is required. The key is shown once.' },
  { icon: MessageSquareText, title: 'Paste the config', body: 'Claude Code and Cursor take the URL and the key.' },
  { icon: Search, title: 'Ask in the chat', body: 'The assistant calls the tools. You do not.' },
]

const ON_PAGE_FAQ = [
  'Which clients work?',
  'Does this include the REST API?',
  'Will I be charged when the trial ends?',
  'Where do I get the API key?',
]

const TRANSCRIPT: { who: string; text: string; code?: string }[] = [
  { who: 'You', text: 'How many calories and how much protein are in 180 g of cooked chicken breast?' },
  {
    who: 'search_foods',
    text: 'The catalog answers before any number is named.',
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
  const faqs = MCP_PAGE_FAQS.filter((item) => ON_PAGE_FAQ.includes(item.q))

  return (
    <div className="marketing-page pb-24 lg:pb-0">
      <MarketingImageHero centered waveTone="elevated">
        <p className="marketing-hero-badge mb-4 inline-flex">Nutrition MCP</p>
        <h1 className="font-display text-4xl text-ink text-balance md:text-6xl">
          Your nutrition database, inside Claude.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-ink-muted">
          Ask in the chat. The catalog returns the macros.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/mcp/pricing" className="btn-brand h-12 px-8 text-base">
            Start 7-day trial
          </Link>
          <Link href="#connect" className="btn-brand-outline h-12 px-8 text-base">
            Connect
          </Link>
        </div>
        <p className="mt-4 text-sm font-medium text-ink">
          ${MCP_MONTHLY_USD}/month or ${annualMonthly}/month
          {savings > 0 ? (
            <span className="font-semibold text-red-600"> · ${savings} USD Off</span>
          ) : null}
        </p>
        <McpEndpointBar endpoint={endpoint} />
        <div className="mt-6">
          <MarketingTrustPills items={['Claude Code and Cursor', 'Personal use', 'Cancel anytime']} />
        </div>
      </MarketingImageHero>

      <section className="section-pad-sm bg-surface-elevated" aria-label="Catalog and plan facts">
        <div className="container-narrow">
          <Reveal>
            <div className="rounded-brand border border-brand/15 bg-white px-4 py-8 shadow-glass sm:px-6 md:px-8 md:py-10">
              <MarketingStatStrip
                stats={[
                  { value: FOOD_DATABASE_SIZE_LABEL, label: 'foods' },
                  { value: '8 tools', label: 'search through photos' },
                  { value: 'UPC + EAN', label: 'barcode lookup' },
                  { value: `$${annualMonthly}/month`, label: 'if you buy annual' },
                ]}
              />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section-pad bg-white" aria-labelledby="mcp-steps-heading">
        <div className="container-narrow">
          <MarketingSectionHeader id="mcp-steps-heading" label="How it works" title="Three steps. Then you ask." />
          <RevealGroup className="grid gap-4 md:grid-cols-3" itemClassName="h-full min-w-0">
            {STEPS.map((step, index) => (
              <div key={step.title} className={index === 0 ? 'marketing-card card-hairline h-full p-6' : 'marketing-card h-full p-6'}>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-sm font-semibold text-ink">
                  {index + 1}
                </span>
                <h3 className="mt-4 text-lg font-semibold text-ink">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{step.body}</p>
              </div>
            ))}
          </RevealGroup>
        </div>
      </section>

      <section id="connect" className="section-pad scroll-mt-28 bg-surface-elevated" aria-labelledby="mcp-connect-heading">
        <div className="container-narrow">
          <MarketingSectionHeader
            id="mcp-connect-heading"
            label="Connect"
            title="Add the server."
            description="Paste this into Claude Code or Cursor. Replace YOUR_KEY after checkout."
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
            label="Tools"
            title="The jobs a food log already does."
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
            label="A real ask"
            title="Search first. Then scale."
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
                      <p className="text-xs font-semibold uppercase tracking-wide text-ink-dim">{turn.who}</p>
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
            <p className="marketing-section-label">Photos</p>
            <h2 id="mcp-photo-heading" className="mt-3 font-display text-3xl tracking-tight text-ink text-balance md:text-4xl">
              The image has to be in the call.
            </h2>
            <p className="mt-4 max-w-md leading-relaxed text-ink-muted">
              Dropping a picture into the chat does not send it. Pass raw base64, no data: prefix.
              JPEG, PNG, or WebP, up to 2 MB.
            </p>
            <p className="mt-3 text-sm text-ink-muted">
              Trial: {MCP_TRIAL_LIMITS.visionTotal} photos. Paid: {MCP_PAID_LIMITS.visionMonth} a month.
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
          <MarketingSectionHeader id="mcp-limits-heading" label="Limits" title="Sized for one person." />
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
          <MarketingSectionHeader id="mcp-faq-heading" title="Before you start" />
          <FaqList items={faqs} />
        </div>
      </section>

      <MarketingCtaBand
        title="Put the catalog in Claude."
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
