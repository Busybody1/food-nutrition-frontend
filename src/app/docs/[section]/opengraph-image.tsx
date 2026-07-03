import { buildOgImage, OG_SIZE } from '@/lib/og-template'
import { getDocsSectionMeta } from '@/lib/docs/registry'

export const size = OG_SIZE
export const contentType = 'image/png'
export const alt = 'API documentation'

export default async function OgImage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params
  const meta = getDocsSectionMeta(section)
  return buildOgImage({
    label: 'API Documentation',
    title: meta?.title ?? 'API Reference',
    subtitle: meta?.summary,
  })
}
