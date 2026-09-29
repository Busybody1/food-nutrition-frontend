import { buildOgImage, OG_SIZE } from '@/lib/og-template'

export const size = OG_SIZE
export const contentType = 'image/png'
export const alt = 'Nutrition MCP server for Claude and Cursor'

export default function OgImage() {
  return buildOgImage({
    label: 'Nutrition MCP',
    title: 'Nutrition MCP server for Claude and Cursor',
    subtitle: 'Catalog lookups for calories, macros, barcodes, and photos.',
  })
}
