import type { Metadata } from 'next'
import { McpLanding } from '@/components/marketing/mcp-landing'
import { JsonLdScript } from '@/components/seo/structured-data'
import { buildPageMetadata } from '@/lib/metadata'
import { MCP_PAGE_FAQS } from '@/lib/mcp/catalog'
import { buildFaqPageJsonLd } from '@/lib/faq-data'
import { buildBreadcrumbJsonLd } from '@/lib/seo-jsonld'

export const metadata: Metadata = buildPageMetadata({
  title: 'Nutrition MCP',
  description:
    'Nutrition MCP server for Claude Code and Cursor. The catalog answers food search, portions, recipes, barcodes, and photos. $29/month or $19/month. $120 USD Off on annual. 7-day trial.',
  keywords: [
    'nutrition mcp server',
    'claude code mcp',
    'cursor mcp nutrition',
    'food database mcp',
  ],
  path: '/mcp',
  hasDedicatedOgImage: true,
})

export default function McpPage() {
  return (
    <>
      <JsonLdScript id="mcp-faq" data={buildFaqPageJsonLd(MCP_PAGE_FAQS)} />
      <JsonLdScript
        id="mcp-breadcrumb"
        data={buildBreadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'MCP', path: '/mcp' },
        ])}
      />
      <McpLanding />
    </>
  )
}
