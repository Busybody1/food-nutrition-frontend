import type { Metadata } from 'next'
import { McpPricingCard } from '@/components/marketing/mcp-pricing-card'
import { FaqList } from '@/components/marketing/faq-section'
import { MarketingCtaBand, MarketingSectionHeader } from '@/components/marketing/marketing-shell'
import { JsonLdScript } from '@/components/seo/structured-data'
import { buildPageMetadata } from '@/lib/metadata'
import { fetchPublicPlans } from '@/lib/pricing/fetch-plans'
import {
  MCP_ANNUAL_USD,
  MCP_FAQS,
  MCP_MONTHLY_USD,
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
      <section className="section-pad bg-surface-elevated" aria-labelledby="mcp-choose-plan">
        <div className="container-narrow">
          <h1 id="mcp-choose-plan" className="mb-10 text-center font-display text-4xl text-ink text-balance md:text-5xl">
            Start the 7-day trial.
          </h1>
          <McpPricingCard plan={plan} />
        </div>
      </section>

      <section className="section-pad bg-white" id="faq" aria-labelledby="mcp-billing-faq">
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
