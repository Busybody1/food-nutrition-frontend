import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { buildPageMetadata } from '@/lib/metadata'
import { ComparisonPageView } from '@/components/marketing/comparison-page'
import {
  COMPARISON_PAGES,
  getComparisonPage,
  comparisonPath,
} from '@/lib/comparisons-data'

export const dynamicParams = false

export function generateStaticParams() {
  return COMPARISON_PAGES.map((p) => ({ slug: p.slug }))
}

type PageProps = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const page = getComparisonPage(slug)
  if (!page) return {}
  return buildPageMetadata({
    title: page.metaTitle,
    description: page.description,
    keywords: page.keywords,
    path: comparisonPath(page.slug),
    hasDedicatedOgImage: true,
  })
}

export default async function ComparePage({ params }: PageProps) {
  const { slug } = await params
  const page = getComparisonPage(slug)
  if (!page) notFound()
  return <ComparisonPageView page={page} />
}
