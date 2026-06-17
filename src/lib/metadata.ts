import type { Metadata } from 'next'
import {
  SITE_NAME,
  SITE_TITLE,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  OG_IMAGE_URL,
  OG_IMAGE_ALT,
  absoluteUrl,
  ogImageMimeType,
} from '@/lib/site'

type PageMetaInput = {
  title?: string
  description?: string
  keywords?: string[]
  path: string
  noIndex?: boolean
}

export function buildPageMetadata({
  title,
  description,
  keywords,
  path,
  noIndex = false,
}: PageMetaInput): Metadata {
  const canonical = absoluteUrl(path)
  const pageTitle = title ? `${title} | ${SITE_NAME}` : SITE_TITLE
  const pageDescription = description ?? SITE_DESCRIPTION
  const pageKeywords = keywords?.length ? keywords : [...SITE_KEYWORDS]

  const titleMeta: Metadata['title'] =
    path === '/' && !title
      ? { absolute: SITE_TITLE }
      : title
        ? { absolute: pageTitle }
        : { absolute: SITE_TITLE }

  return {
    title: titleMeta,
    description: pageDescription,
    keywords: pageKeywords,
    alternates: { canonical },
    openGraph: {
      type: 'website',
      url: canonical,
      title: pageTitle,
      description: pageDescription,
      siteName: SITE_NAME,
      images: [
        {
          url: OG_IMAGE_URL,
          width: 1200,
          height: 630,
          alt: OG_IMAGE_ALT,
          type: ogImageMimeType(OG_IMAGE_URL),
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      images: [{ url: OG_IMAGE_URL, alt: OG_IMAGE_ALT }],
    },
    robots: noIndex ? { index: false, follow: false } : undefined,
  }
}
