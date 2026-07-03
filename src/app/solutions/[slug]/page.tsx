import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { buildPageMetadata } from '@/lib/metadata'
import { SolutionPageView } from '@/components/marketing/solution-page'
import { SOLUTION_PAGES, getSolutionPage, solutionPath } from '@/lib/solutions-data'

export const dynamicParams = false

export function generateStaticParams() {
  return SOLUTION_PAGES.map((p) => ({ slug: p.slug }))
}

type PageProps = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const page = getSolutionPage(slug)
  if (!page) return {}
  return buildPageMetadata({
    title: page.metaTitle,
    description: page.description,
    keywords: page.keywords,
    path: solutionPath(page.slug),
    hasDedicatedOgImage: true,
  })
}

export default async function SolutionPage({ params }: PageProps) {
  const { slug } = await params
  const page = getSolutionPage(slug)
  if (!page) notFound()
  return <SolutionPageView page={page} />
}
