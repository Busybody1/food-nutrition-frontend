import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/metadata'
import { CapabilityPageView } from '@/components/marketing/capability-page'
import { getCapabilityPage, capabilityPath } from '@/lib/capability-pages-data'

const page = getCapabilityPage('nutrition-analysis-api')!

export const metadata: Metadata = buildPageMetadata({
  title: page.metaTitle,
  description: page.description,
  keywords: page.keywords,
  path: capabilityPath(page.slug),
  hasDedicatedOgImage: true,
})

export default function NutritionAnalysisApiPage() {
  return <CapabilityPageView page={page} />
}
