import { buildOgImage, OG_SIZE } from '@/lib/og-template'

export const size = OG_SIZE
export const contentType = 'image/png'
export const alt = 'Nutrition MCP server pricing'

export default function OgImage() {
  return buildOgImage({
    label: 'Pricing',
    title: 'Nutrition MCP server pricing',
    subtitle: '$29/month or $19/month annual. 7-day trial. MCP tools only.',
  })
}
