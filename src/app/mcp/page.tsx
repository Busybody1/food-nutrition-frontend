import type { Metadata } from 'next'
import { McpLanding } from '@/components/marketing/mcp-landing'
import { JsonLdScript } from '@/components/seo/structured-data'
import { buildPageMetadata } from '@/lib/metadata'
import {
  MCP_ANNUAL_USD,
  MCP_CONNECT_STEPS,
  MCP_FEATURE_TITLES,
  MCP_LANDING_H1,
  MCP_MONTHLY_USD,
  MCP_PAGE_FAQS,
  mcpLandingLead,
  mcpLandingMetaDescription,
} from '@/lib/mcp/catalog'
import { buildMcpLandingJsonLd } from '@/lib/mcp/landing-jsonld'
import { buildBreadcrumbJsonLd } from '@/lib/seo-jsonld'
import { FOOD_DATABASE_SIZE_LABEL, ORGANIZATION_ID, SITE_NAME, SITE_URL, absoluteUrl } from '@/lib/site'

const DESCRIPTION = mcpLandingMetaDescription()
const LEAD = mcpLandingLead(FOOD_DATABASE_SIZE_LABEL)

export const metadata: Metadata = buildPageMetadata({
  title: MCP_LANDING_H1,
  description: DESCRIPTION,
  keywords: [
    'calorie mcp',
    'calorie mcp server',
    'nutrition mcp server',
    'track calories with claude ai',
    'claude code mcp',
    'cursor mcp nutrition',
    'mcp food database',
  ],
  path: '/mcp',
  hasDedicatedOgImage: true,
})

export default function McpPage() {
  const pageUrl = absoluteUrl('/mcp')
  return (
    <>
      <JsonLdScript
        id="mcp-landing"
        data={buildMcpLandingJsonLd({
          pageUrl,
          pageName: MCP_LANDING_H1,
          siteName: SITE_NAME,
          siteUrl: SITE_URL,
          organizationId: ORGANIZATION_ID,
          description: LEAD,
          monthlyPrice: MCP_MONTHLY_USD,
          annualPrice: MCP_ANNUAL_USD,
          priceValidUntil: '2027-12-31',
          faqs: MCP_PAGE_FAQS,
          steps: MCP_CONNECT_STEPS,
          features: MCP_FEATURE_TITLES,
        })}
      />
      <JsonLdScript
        id="mcp-breadcrumb"
        data={buildBreadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Calorie MCP', path: '/mcp' },
        ])}
      />
      <McpLanding />
    </>
  )
}
