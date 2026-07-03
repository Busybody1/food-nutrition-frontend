import { buildOgImage, OG_SIZE } from '@/lib/og-template'
import { getGuide } from '@/lib/docs/guides-data'

export const size = OG_SIZE
export const contentType = 'image/png'
export const alt = 'Integration guide'

export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const guide = getGuide(slug)
  return buildOgImage({
    label: `${guide?.framework ?? 'Integration'} Guide`,
    title: guide?.title ?? 'Integration Guides',
    subtitle: guide?.summary,
  })
}
