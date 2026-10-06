import { MCP_LANDING_H1, MCP_PRODUCT_NAME } from '@/lib/mcp/catalog'
import { buildOgImage, OG_SIZE } from '@/lib/og-template'

export const size = OG_SIZE
export const contentType = 'image/png'
export const alt = MCP_LANDING_H1

export default function OgImage() {
  return buildOgImage({
    label: MCP_PRODUCT_NAME,
    title: MCP_LANDING_H1,
    subtitle: 'Catalog lookups for calories, macros, barcodes, and photos.',
  })
}
