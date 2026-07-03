import { buildOgImage, OG_SIZE } from '@/lib/og-template'
import { getSolutionPage } from '@/lib/solutions-data'

export const size = OG_SIZE
export const contentType = 'image/png'
export const alt = 'Solutions'

export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const page = getSolutionPage(slug)
  return buildOgImage({
    label: 'Solutions',
    title: page?.h1 ?? 'Solutions',
    subtitle: page?.summary,
  })
}
