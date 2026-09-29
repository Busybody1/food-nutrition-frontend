import type { Metadata } from 'next'
import { McpPricingCard } from '@/components/marketing/mcp-pricing-card'
import { FaqList } from '@/components/marketing/faq-section'
import { MarketingImageHero } from '@/components/marketing/marketing-image-hero'
import { MarketingCtaBand, MarketingSectionHeader } from '@/components/marketing/marketing-shell'
import { JsonLdScript } from '@/components/seo/structured-data'
import { buildPageMetadata } from '@/lib/metadata'
import { fetchPublicPlans } from '@/lib/pricing/fetch-plans'
import {
  MCP_ANNUAL_USD,
  MCP_FAQS,
  MCP_MONTHLY_USD,
  MCP_PRICING_H1,
  annualAsMonthlyUsd,
  annualSavingsUsd,
  mcpPricingLead,
} from '@/lib/mcp/catalog'
import { buildMcpPricingJsonLd } from '@/lib/mcp/landing-jsonld'
import { ORGANIZATION_ID, SITE_NAME, SITE_URL, absoluteUrl } from '@/lib/site'

const DESCRIPTION = mcpPricingLead()

const BILLING_FAQS = MCP_FAQS.filter((item) =>
  [
    'Does the nutrition MCP plan include the REST API?',
    'What are the nutrition MCP server trial limits?',
    'Will I be charged when the nutrition MCP trial ends?',
    'Can I use a nutrition MCP server in a commercial app?',
    'How much does nutrition MCP server pricing cost per year?',
    'What does personal use mean for a nutrition MCP server?',
  ].includes(item.q)
)

export const metadata: Metadata = buildPageMetadata({
  title: MCP_PRICING_H1,
  description: DESCRIPTION,
  keywords: [
    'nutrition mcp server pricing',
    'mcp pricing',
    'nutrition mcp server price',
    'claude code nutrition',
  ],
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
  const product = buildMcpPricingJsonLd({
    pageUrl: absoluteUrl('/mcp/pricing'),
    pageName: MCP_PRICING_H1,
    siteName: SITE_NAME,
    siteUrl: SITE_URL,
    organizationId: ORGANIZATION_ID,
    description: DESCRIPTION,
    imageUrl: absoluteUrl('/mcp/pricing/opengraph-image'),
    monthlyPrice: monthly,
    annualPrice: annual,
    priceValidUntil: '2027-12-31',
    faqs: BILLING_FAQS,
  })

  return (
    <div className="marketing-page">
      <JsonLdScript id="mcp-pricing-product" data={product} />
      <MarketingImageHero compact centered waveTone="elevated" className="!min-h-0">
        <h1 className="font-display text-4xl text-ink text-balance md:text-6xl">
          {MCP_PRICING_H1}
        </h1>
        <p id="mcp-pricing-answer" className="aeo-answer mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-ink-muted">
          {DESCRIPTION}
        </p>
      </MarketingImageHero>

      <section className="bg-surface-elevated pb-20 pt-6 md:pb-28 md:pt-8" aria-labelledby="mcp-choose-plan">
        <div className="container-narrow">
          <h2 id="mcp-choose-plan" className="sr-only">
            Nutrition MCP server monthly and annual pricing
          </h2>
          <McpPricingCard plan={plan} />
        </div>
      </section>

      <section className="section-pad bg-white" id="faq" aria-labelledby="mcp-billing-faq">
        <div className="container-narrow">
          <MarketingSectionHeader id="mcp-billing-faq" title="Nutrition MCP pricing questions" />
          <FaqList items={BILLING_FAQS} />
        </div>
      </section>

      <MarketingCtaBand
        title="Start a nutrition MCP server trial"
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
