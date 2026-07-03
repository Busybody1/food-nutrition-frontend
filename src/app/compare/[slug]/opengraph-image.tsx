import { buildOgImage, OG_SIZE } from '@/lib/og-template'
import { getComparisonPage } from '@/lib/comparisons-data'
import { SITE_NAME } from '@/lib/site'

export const size = OG_SIZE
export const contentType = 'image/png'
export const alt = 'Nutrition API comparison'

export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const page = getComparisonPage(slug)
  return buildOgImage({
    label: 'Comparison',
    title: page ? `${SITE_NAME} vs ${page.competitor}` : 'Nutrition API Comparison',
    subtitle: page?.summary,
  })
}
