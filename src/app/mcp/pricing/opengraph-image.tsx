import { buildOgImage, OG_SIZE } from '@/lib/og-template'

export const size = OG_SIZE
export const contentType = 'image/png'
export const alt = 'MCP pricing'

export default function OgImage() {
  return buildOgImage({
    label: 'Pricing',
    title: '$29/month or $228/year',
    subtitle: '7-day trial. MCP tools only. Personal use.',
  })
}
