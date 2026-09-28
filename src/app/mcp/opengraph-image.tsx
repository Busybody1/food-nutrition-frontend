import { buildOgImage, OG_SIZE } from '@/lib/og-template'

export const size = OG_SIZE
export const contentType = 'image/png'
export const alt = 'Nutrition MCP for Claude Code and Cursor'

export default function OgImage() {
  return buildOgImage({
    label: 'MCP',
    title: 'Your nutrition database, inside Claude.',
    subtitle: 'Claude Code and Cursor. Personal use. 7-day trial.',
  })
}
