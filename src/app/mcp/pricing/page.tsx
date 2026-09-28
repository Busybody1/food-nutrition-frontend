import type { Metadata } from 'next'
import Link from 'next/link'
import { McpPricingCard } from '@/components/marketing/mcp-pricing-card'
import { FaqList } from '@/components/marketing/faq-section'
import { MarketingSectionHeader } from '@/components/marketing/marketing-shell'
import { JsonLdScript } from '@/components/seo/structured-data'
import { buildPageMetadata } from '@/lib/metadata'
import { fetchPublicPlans } from '@/lib/pricing/fetch-plans'
import { MCP_ANNUAL_USD, MCP_FAQS, MCP_MONTHLY_USD } from '@/lib/mcp/catalog'
import { buildFaqPageJsonLd } from '@/lib/faq-data'
import { buildPricingProductJsonLdFromInput } from '@/lib/pricing-product-jsonld'
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL, absoluteUrl } from '@/lib/site'

const BILLING_FAQS = MCP_FAQS.filter((item) =>
  ['Does this plan include the REST API?', 'What are the trial limits?', 'Will I be charged when the trial ends?', 'Is this for a commercial app?', 'How is annual billing priced?', 'What does personal use mean?'].includes(item.q)
)

export const metadata: Metadata = buildPageMetadata({
  title: 'MCP pricing',
  description:
    'MCP plan for Claude Code and Cursor: $29 per month or $228 per year. 7-day card-required trial at reduced limits. MCP tools only, no REST API.',
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
      <section className="section-pad">
        <div className="container-narrow">
          <MarketingSectionHeader
            label="Pricing"
            title="MCP plan"
            description="$29 per month, or $228 per year. 7-day trial. This plan calls MCP tools only."
          />
          <McpPricingCard plan={plan} />
          <p className="mx-auto mt-8 max-w-xl text-center text-sm text-ink-muted">
            Building an app?{' '}
            <Link href="/pricing" className="text-brand-strong underline">
              API pricing
            </Link>{' '}
            is a separate product.
          </p>
        </div>
      </section>
      <section className="section-pad bg-surface-elevated" id="faq" aria-labelledby="mcp-billing-faq">
        <div className="container-narrow">
          <MarketingSectionHeader id="mcp-billing-faq" title="Billing" />
          <FaqList items={BILLING_FAQS} />
        </div>
      </section>
    </div>
  )
}
