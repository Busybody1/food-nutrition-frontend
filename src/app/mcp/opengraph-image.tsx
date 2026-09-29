import { buildOgImage, OG_SIZE } from '@/lib/og-template'

export const size = OG_SIZE
export const contentType = 'image/png'
export const alt = 'Nutrition MCP for Claude Code and Cursor'

export default function OgImage() {
  return buildOgImage({
    label: 'MCP',
    title: 'Make your agent a personal fitness coach.',
    subtitle: 'Ask for calories. Claude returns verified macros.',
  })
}
