import Link from 'next/link'
import {
  Camera,
  KeyRound,
  MessageSquareText,
  Scale,
  ScanBarcode,
  Search,
  ShieldCheck,
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
  MCP_TOOLS,
  MCP_TRIAL_LIMITS,
  annualSavingsUsd,
  mcpEndpoint,
} from '@/lib/mcp/catalog'
import { FOOD_DATABASE_SIZE_LABEL, SITE_NAME } from '@/lib/site'

const USES: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: Search,
    title: 'Search the catalog',
    description: 'Ask for a food by name. The assistant calls search_foods and gets calories, macros, and a food_id.',
  },
  {
    icon: Scale,
    title: 'Scale a real portion',
    description: 'calculate_portion takes that food_id and a gram weight, so 180 g is not the same answer as 100 g.',
  },
  {
    icon: UtensilsCrossed,
    title: 'Total a recipe',
    description: 'Up to 40 ingredients, then per-serving macros. The model should use ids from search, not ones it invents.',
  },
  {
    icon: ScanBarcode,
    title: 'Read a barcode',
    description: 'UPC or EAN digits. If the catalog misses, lookup falls back to Open Food Facts.',
  },
  {
    icon: Target,
    title: 'Set a daily target',
    description: 'Age, sex, weight, height, activity, and goal become calorie and macro targets for the day.',
  },
  {
    icon: Camera,
    title: 'Estimate a photo',
    description: 'analyze_food_photo reads a JPEG, PNG, or WebP you pass as base64. The chat does not attach the file.',
  },
]

const STEPS: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: KeyRound,
    title: 'Start the trial and create a key',
    body: 'Checkout is $29/month or $228/year, with a 7-day trial and a card. The full API key is shown once, in the dashboard.',
  },
  {
    icon: MessageSquareText,
    title: 'Add this server in your assistant',
    body: 'Claude Code and Cursor take the MCP URL plus an X-API-Key header. Paste the config below. Do not email the key.',
  },
  {
    icon: Search,
    title: 'Ask in plain language',
    body: 'You do not call the tools yourself. The assistant searches, then scales, totals, or looks up what you asked.',
  },
]

const TRANSCRIPT: { who: string; text: string; code?: string }[] = [
  {
    who: 'You',
    text: 'How many calories and how much protein are in 180 g of cooked chicken breast?',
  },
  {
    who: 'Tool · search_foods',
    text: 'The assistant searches the catalog before it names a number.',
    code: `{
  "query": "cooked chicken breast",
  "food_id": "<id from this search>",
  "per_100g": { "kcal": 165, "protein_g": 31, "fat_g": 3.6, "carbs_g": 0 }
}`,
  },
  {
    who: 'Tool · calculate_portion',
    text: 'It then scales that same food_id to 180 g.',
    code: `{
  "grams": 180,
  "kcal": 297,
  "protein_g": 55.8,
  "fat_g": 6.5,
  "carbs_g": 0
}`,
  },
  {
    who: 'Assistant',
    text: '180 g of cooked chicken breast is about 297 kcal and 56 g of protein. The per-100 g row came from the catalog; the portion tool did the scaling.',
  },
]

export function McpLanding() {
  const endpoint = mcpEndpoint()
  const savings = annualSavingsUsd(MCP_MONTHLY_USD, MCP_ANNUAL_USD)

  return (
    <div className="marketing-page pb-24 lg:pb-0">
      <MarketingImageHero centered waveTone="elevated">
        <p className="marketing-hero-badge mb-4 inline-flex">Nutrition MCP</p>
        <h1 className="font-display text-4xl md:text-6xl text-ink text-balance">
          Your nutrition database, inside Claude.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-ink-muted leading-relaxed">
          {SITE_NAME} MCP is a nutrition server for assistants. Claude Code and Cursor call it to
          search foods, scale a portion, total a recipe, look up a barcode, or estimate a photo.
          The catalog answers. The model does not invent the macros.
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
          ${MCP_MONTHLY_USD}/month or ${MCP_ANNUAL_USD}/year
          {savings > 0 ? ` · save $${savings} on annual` : ''}
        </p>
        <McpEndpointBar endpoint={endpoint} />
        <div className="mt-6">
          <MarketingTrustPills items={['Claude Code and Cursor', 'Personal use', '7-day trial, card required']} />
        </div>
      </MarketingImageHero>

      <section className="section-pad-sm bg-surface-elevated" aria-label="Catalog and plan facts">
        <div className="container-narrow">
          <Reveal>
            <div className="rounded-brand border border-brand/15 bg-brand-muted/40 px-4 py-8 sm:px-6 md:px-8 md:py-10">
              <MarketingStatStrip
                stats={[
                  { value: FOOD_DATABASE_SIZE_LABEL, label: 'foods the tools can search' },
                  { value: '8 tools', label: 'search, portions, recipes, photos' },
                  { value: 'UPC + EAN', label: 'barcode lookup with fallback' },
                  { value: `${MCP_PAID_LIMITS.perMinute}/min`, label: 'paid calls, for one person' },
                ]}
              />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section-pad bg-white" aria-labelledby="mcp-what-heading">
        <div className="container-narrow grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
          <Reveal className="min-w-0 space-y-4 text-ink-muted leading-relaxed">
            <p className="marketing-section-label">The service</p>
            <h2 id="mcp-what-heading" className="font-display text-3xl md:text-4xl tracking-tight text-ink text-balance">
              An assistant that can look food up, instead of guessing.
            </h2>
            <p>
              Model Context Protocol is how Claude and Cursor call a tool. This server is that
              tool: a fixed set of nutrition calls against the {SITE_NAME} catalog. You ask in the
              chat. The assistant decides which tool to run, sends the arguments, and reads the
              JSON that comes back.
            </p>
            <p>
              That is a different product from the REST API. There is no playground request for you
              to write, and this plan cannot call REST search, foods, calc, or vision. Those routes
              return 403. Billing and your API keys still live in the dashboard.
            </p>
            <p>
              A typical meal log is two calls. Search returns a food_id and macros per 100 g.
              Portion, recipe, or barcode tools use that id or the digits you typed. If the model
              skips the search and invents an id, the next call fails. Ask it to search first.
            </p>
          </Reveal>
          <Reveal delay={120}>
            <ol className="space-y-4">
              {STEPS.map((step, index) => (
                <li key={step.title} className={index === 0 ? 'marketing-card card-hairline p-5' : 'marketing-card p-5'}>
                  <div className="flex gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-semibold text-ink">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold text-ink">{step.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-ink-muted">{step.body}</p>
                      {index === 0 ? (
                        <Link href="/mcp/pricing" className="mt-3 inline-flex text-sm font-medium text-brand-strong underline underline-offset-2">
                          Start the trial
                        </Link>
                      ) : null}
                      {index === 1 ? (
                        <a href="#connect" className="mt-3 inline-flex text-sm font-medium text-brand-strong underline underline-offset-2">
                          Copy a config
                        </a>
                      ) : null}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>

      <section id="connect" className="section-pad scroll-mt-28 bg-surface-elevated" aria-labelledby="mcp-connect-heading">
        <div className="container-narrow">
          <MarketingSectionHeader
            id="mcp-connect-heading"
            label="Connect"
            title="Add the server URL."
            description="Claude Code and Cursor need an API key from the dashboard. Browser sign-in for Claude apps stays off until the API enables OAuth."
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
            label="What you can ask"
            title="The same jobs a food log does, from the chat."
            description="Eight tools. You never see the request unless you want to. The docs list every argument."
          />
          <RevealGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-5" itemClassName="h-full min-w-0">
            {USES.map((item) => (
              <MarketingFeatureCard
                key={item.title}
                icon={item.icon}
                title={item.title}
                description={item.description}
              />
            ))}
          </RevealGroup>
        </div>
      </section>

      <section className="section-pad bg-surface-elevated" aria-labelledby="mcp-session-heading">
        <div className="container-narrow">
          <MarketingSectionHeader
            id="mcp-session-heading"
            label="Example session"
            title="Search, then scale. The numbers come from the tools."
            description="A scripted reply so you can see the shape. Your catalog hit can differ. This is not a live call."
          />
          <Reveal>
            <ol className="mx-auto max-w-3xl space-y-3">
              {TRANSCRIPT.map((turn) => {
                const isYou = turn.who === 'You'
                const isAssistant = turn.who === 'Assistant'
                return (
                  <li key={turn.who} className={isYou ? 'flex justify-end' : ''}>
                    <div
                      className={
                        isYou
                          ? 'max-w-[90%] rounded-brand rounded-br-md bg-brand px-4 py-3 text-ink'
                          : isAssistant
                            ? 'max-w-[90%] rounded-brand rounded-bl-md border border-brand/20 bg-brand-muted/50 px-4 py-3'
                            : 'rounded-brand border border-surface-border bg-white p-4 shadow-glass'
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

      <section className="section-pad bg-white" aria-labelledby="mcp-tools-heading">
        <div className="container-narrow">
          <MarketingSectionHeader
            id="mcp-tools-heading"
            label="Tools"
            title="Every call the assistant can make."
            description="search_foods is the source of food_id. Portion, recipe, and the full nutrient list need that id."
          />
          <div className="overflow-x-auto rounded-brand border border-surface-border">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-surface-elevated text-ink-dim">
                <tr>
                  <th className="px-4 py-3 font-medium">Tool</th>
                  <th className="px-4 py-3 font-medium">Returns</th>
                  <th className="px-4 py-3 font-medium">Arguments</th>
                </tr>
              </thead>
              <tbody>
                {MCP_TOOLS.map((tool) => (
                  <tr key={tool.name} className="border-t border-surface-border">
                    <td className="px-4 py-3 font-mono text-ink">{tool.name}</td>
                    <td className="px-4 py-3 text-ink-muted">{tool.summary}</td>
                    <td className="px-4 py-3 font-mono text-xs text-ink">{tool.args}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="section-pad bg-surface-elevated" aria-labelledby="mcp-photo-heading">
        <div className="container-narrow grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
          <Reveal className="space-y-4 text-ink-muted leading-relaxed">
            <p className="marketing-section-label">Photos</p>
            <h2 id="mcp-photo-heading" className="font-display text-3xl md:text-4xl tracking-tight text-ink text-balance">
              A photo works only if the image is in the tool call.
            </h2>
            <p>
              Dropping a picture into Claude or Cursor does not send it to analyze_food_photo.
              MCP clients do not forward that attachment. You, or the agent, pass image_base64:
              raw base64, no data: prefix. JPEG, PNG, or WebP. Decoded size up to 2 MB. A URL is
              not accepted.
            </p>
            <p>
              Paid accounts get {MCP_PAID_LIMITS.visionMonth} photo calls a month and{' '}
              {MCP_PAID_LIMITS.visionDay} a day. The trial includes {MCP_TRIAL_LIMITS.visionTotal}{' '}
              photo calls total.
            </p>
          </Reveal>
          <Reveal delay={120} className="marketing-card p-6">
            <div className="mb-4 flex items-center gap-3">
              <span className="marketing-feature-icon">
                <Camera className="h-6 w-6 text-brand-strong" aria-hidden />
              </span>
              <h3 className="text-lg font-semibold text-ink">What you send</h3>
            </div>
            <pre className="overflow-x-auto rounded-brand bg-ink px-4 py-3 font-mono text-xs leading-relaxed text-white">
              {`{
  "image_base64": "<raw base64, no data: prefix>",
  "content_type": "image/jpeg"
}`}
            </pre>
            <p className="mt-4 text-sm leading-relaxed text-ink-muted">
              Compress anything over 2 MB before you encode it. The error tells you the file is too
              large. It does not include a stack trace.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section-pad bg-white" aria-labelledby="mcp-limits-heading">
        <div className="container-narrow">
          <MarketingSectionHeader
            id="mcp-limits-heading"
            label="Limits"
            title="Built for you, not for scraping the catalog."
            description="Personal use in your own assistant. A product other people pay for needs a REST plan and a commercial license."
          />
          <RevealGroup className="grid gap-4 md:grid-cols-3" itemClassName="h-full min-w-0">
            <div className="marketing-card h-full p-6">
              <ShieldCheck className="mb-4 h-6 w-6 text-brand-strong" aria-hidden />
              <h3 className="text-lg font-semibold text-ink">Paid</h3>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-ink-muted">
                <li>{MCP_PAID_LIMITS.perMinute} calls per minute</li>
                <li>{MCP_PAID_LIMITS.perMonth.toLocaleString('en-US')} successful calls per month</li>
                <li>{MCP_PAID_LIMITS.results} foods per search</li>
                <li>
                  {MCP_PAID_LIMITS.visionMonth} photos per month, {MCP_PAID_LIMITS.visionDay} per day
                </li>
              </ul>
            </div>
            <div className="marketing-card card-hairline flex h-full flex-col p-6 ring-2 ring-brand/30">
              <KeyRound className="mb-4 h-6 w-6 text-brand-strong" aria-hidden />
              <h3 className="text-lg font-semibold text-ink">Trial</h3>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-ink-muted">
                <li>{MCP_TRIAL_LIMITS.days} days, card required</li>
                <li>{MCP_TRIAL_LIMITS.perMinute} calls per minute</li>
                <li>{MCP_TRIAL_LIMITS.totalCalls} calls total, not reset on the 1st</li>
                <li>
                  {MCP_TRIAL_LIMITS.results} foods per search, {MCP_TRIAL_LIMITS.visionTotal} photos total
                </li>
              </ul>
              <Link href="/mcp/pricing" className="btn-brand mt-5 h-11 w-full">
                Start 7-day trial
              </Link>
            </div>
            <div className="marketing-card h-full p-6">
              <ScanBarcode className="mb-4 h-6 w-6 text-brand-strong" aria-hidden />
              <h3 className="text-lg font-semibold text-ink">Not this plan</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                Shipping the data inside an app, reselling it, or calling the REST API. Those need{' '}
                <Link href="/pricing" className="font-medium text-brand-strong underline underline-offset-2">
                  a REST plan
                </Link>{' '}
                and, for a paid product, a{' '}
                <Link
                  href="/commercial-license"
                  className="font-medium text-brand-strong underline underline-offset-2"
                >
                  commercial license
                </Link>
                .
              </p>
            </div>
          </RevealGroup>
        </div>
      </section>

      <section className="section-pad bg-surface-elevated" id="faq" aria-labelledby="mcp-faq-heading">
        <div className="container-narrow">
          <MarketingSectionHeader
            id="mcp-faq-heading"
            label="Questions"
            title="What this plan is, and what it is not."
          />
          <FaqList items={MCP_PAGE_FAQS} />
        </div>
      </section>

      <MarketingCtaBand
        title="Put the catalog in Claude or Cursor."
        description="$29/month or $228/year. 7-day trial, card required. MCP tools only. Cancel before the trial ends if you do not want to be charged."
        primaryHref="/mcp/pricing"
        primaryLabel="Start 7-day trial"
        secondaryHref="/docs/mcp"
        secondaryLabel="Read the docs"
      />
      <McpTrialBar />
    </div>
  )
}
