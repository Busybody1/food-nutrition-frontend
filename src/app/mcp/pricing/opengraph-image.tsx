import { buildOgImage, OG_SIZE } from '@/lib/og-template'

export const size = OG_SIZE
export const contentType = 'image/png'
export const alt = 'MCP pricing'

export default function OgImage() {
  return buildOgImage({
    label: 'Pricing',
    title: '$29/month or $19/month',
    subtitle: '$120 USD Off on annual. 7-day trial. MCP tools only.',
  })
}
