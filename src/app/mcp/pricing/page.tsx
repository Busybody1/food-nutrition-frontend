import type { Metadata } from 'next'
import Link from 'next/link'
import { McpPricingCard } from '@/components/marketing/mcp-pricing-card'
import { FaqList } from '@/components/marketing/faq-section'
import { MarketingImageHero } from '@/components/marketing/marketing-image-hero'
import {
  MarketingCtaBand,
  MarketingSectionHeader,
  MarketingTrustPills,
} from '@/components/marketing/marketing-shell'
import { JsonLdScript } from '@/components/seo/structured-data'
import { buildPageMetadata } from '@/lib/metadata'
import { fetchPublicPlans } from '@/lib/pricing/fetch-plans'
import {
  MCP_ANNUAL_USD,
  MCP_FAQS,
  MCP_MONTHLY_USD,
  MCP_PAID_LIMITS,
  MCP_TRIAL_LIMITS,
  annualAsMonthlyUsd,
  annualSavingsUsd,
} from '@/lib/mcp/catalog'
import { buildFaqPageJsonLd } from '@/lib/faq-data'
import { buildPricingProductJsonLdFromInput } from '@/lib/pricing-product-jsonld'
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL, absoluteUrl } from '@/lib/site'

const BILLING_FAQS = MCP_FAQS.filter((item) =>
  [
    'Does this plan include the REST API?',
    'What are the trial limits?',
    'Will I be charged when the trial ends?',
    'Is this for a commercial app?',
    'How is annual billing priced?',
    'What does personal use mean?',
  ].includes(item.q)
)

export const metadata: Metadata = buildPageMetadata({
  title: 'MCP pricing',
  description:
    'MCP plan for Claude Code and Cursor: $29/month, or $19/month if you buy annual. $120 USD Off. 7-day card-required trial at reduced limits. MCP tools only, no REST API.',
  keywords: ['mcp pricing', 'nutrition mcp server price', 'claude code nutrition'],
  path: '/mcp/pricing',
  hasDedicatedOgImage: true,
})

export default async function McpPricingPage() {
  let plan = null
  try {
    const plans = await fetchPublicPlans('mcp')
    plan = plans.find((item) => (item.plan_tier || '').toLowerCase() === 'mcp') ?? null
  } catch (error) {
    console.error('MCP plan fetch failed:', error)
  }

  const monthly = plan && plan.monthly_price > 0 ? plan.monthly_price : MCP_MONTHLY_USD
  const annual = plan?.annual_price && plan.annual_price > 0 ? plan.annual_price : MCP_ANNUAL_USD
  const annualMonthly = annualAsMonthlyUsd(annual)
  const savings = annualSavingsUsd(monthly, annual)
  const product = buildPricingProductJsonLdFromInput({
    siteName: SITE_NAME,
    siteUrl: SITE_URL,
    siteDescription: SITE_DESCRIPTION,
    imageUrl: absoluteUrl('/mcp/pricing/opengraph-image'),
    pricingUrl: absoluteUrl('/mcp/pricing'),
    plans: [
      { name: 'MCP monthly', price: String(monthly) },
      { name: 'MCP annual', price: String(annual) },
    ],
    priceValidUntil: '2027-12-31',
  })

  return (
    <div className="marketing-page">
      <JsonLdScript id="mcp-pricing-product" data={product} />
      <JsonLdScript id="mcp-pricing-faq" data={buildFaqPageJsonLd(BILLING_FAQS)} />
      <MarketingImageHero compact centered waveTone="elevated">
        <p className="marketing-hero-badge mb-4 inline-flex">Pricing</p>
        <h1 className="font-display text-4xl text-ink text-balance md:text-6xl">
          The catalog in Claude, for ${annualMonthly}/month.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-ink-muted">
          ${monthly}/month, or ${annualMonthly}/month if you buy annual.
          {savings > 0 ? (
            <span className="font-semibold text-red-600"> ${savings} USD Off.</span>
          ) : null}{' '}
          Seven days to try it. A card is required.
        </p>
        <div className="mt-6">
          <MarketingTrustPills
            items={['Claude Code and Cursor', 'Cancel anytime', 'MCP tools only']}
          />
        </div>
      </MarketingImageHero>

      <section className="section-pad bg-surface-elevated" aria-labelledby="mcp-choose-plan">
        <div className="container-narrow">
          <h2 id="mcp-choose-plan" className="sr-only">
            Choose annual or monthly
          </h2>
          <McpPricingCard plan={plan} />
        </div>
      </section>

      <section className="section-pad" aria-labelledby="mcp-after-trial">
        <div className="container-narrow">
          <MarketingSectionHeader
            id="mcp-after-trial"
            label="The trial"
            title="Try it for 7 days. Then the paid limits apply."
            description="Cancel from billing before the trial ends if you do not want to be charged."
          />
          <div className="mx-auto grid max-w-4xl gap-5 md:grid-cols-2">
            <div className="rounded-brand border border-brand/30 bg-brand-muted/30 p-6 ring-2 ring-brand/20 md:p-8">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-strong">First 7 days</p>
              <ul className="mt-4 space-y-2 text-sm text-ink">
                <li>{MCP_TRIAL_LIMITS.perMinute} calls per minute</li>
                <li>{MCP_TRIAL_LIMITS.totalCalls} calls total</li>
                <li>{MCP_TRIAL_LIMITS.results} foods per search</li>
                <li>{MCP_TRIAL_LIMITS.visionTotal} photos total</li>
              </ul>
              <Link href="#mcp-choose-plan" className="btn-brand mt-6 h-11 w-full">
                Start 7-day trial
              </Link>
            </div>
            <div className="rounded-brand border border-surface-border/80 bg-white p-6 shadow-glass md:p-8">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">After the trial</p>
              <ul className="mt-4 space-y-2 text-sm text-ink">
                <li>{MCP_PAID_LIMITS.perMinute} calls per minute</li>
                <li>{MCP_PAID_LIMITS.perMonth.toLocaleString()} calls a month</li>
                <li>{MCP_PAID_LIMITS.results} foods per search</li>
                <li>{MCP_PAID_LIMITS.visionMonth} photos a month, {MCP_PAID_LIMITS.visionDay} a day</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad bg-surface-elevated" id="faq" aria-labelledby="mcp-billing-faq">
        <div className="container-narrow">
          <MarketingSectionHeader id="mcp-billing-faq" title="Billing" />
          <FaqList items={BILLING_FAQS} />
        </div>
      </section>

      <MarketingCtaBand
        title="Start the trial. Connect Claude tonight."
        description={
          <>
            ${monthly}/month, or ${annualMonthly}/month if you buy annual.
            {savings > 0 ? (
              <span className="font-semibold text-red-600"> ${savings} USD Off.</span>
            ) : null}{' '}
            The key is shown once, in the dashboard.
          </>
        }
        primaryHref="#mcp-choose-plan"
        primaryLabel="Start 7-day trial"
        secondaryHref="/mcp"
        secondaryLabel="See the server"
      />
    </div>
  )
}
