import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/metadata'
import { getPublicPageSeo, type PublicPagePath } from '@/lib/public-page-seo'

export function buildPublicPageMetadata(
  path: PublicPagePath,
  overrides?: { noIndex?: boolean }
): Metadata {
  const seo = getPublicPageSeo(path)
  return buildPageMetadata({
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    path,
    noIndex: overrides?.noIndex,
  })
}
