import { MCP_PRICING_H1 } from '@/lib/mcp/catalog'
import { buildOgImage, OG_SIZE } from '@/lib/og-template'

export const size = OG_SIZE
export const contentType = 'image/png'
export const alt = MCP_PRICING_H1

export default function OgImage() {
  return buildOgImage({
    label: 'Pricing',
    title: MCP_PRICING_H1,
    subtitle: '$29/month or $19/month annual. 7-day trial. MCP tools only.',
  })
}
