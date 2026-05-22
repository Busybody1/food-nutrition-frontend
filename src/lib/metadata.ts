import type { Metadata } from 'next'
import {
  SITE_NAME,
  SITE_TITLE,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  OG_IMAGE_URL,
  OG_IMAGE_ALT,
  absoluteUrl,
} from '@/lib/site'

type PageMetaInput = {
  title?: string
  description?: string
  path: string
  noIndex?: boolean
}

export function buildPageMetadata({
  title,
  description,
  path,
  noIndex = false,
}: PageMetaInput): Metadata {
  const canonical = absoluteUrl(path)
  const pageTitle = title ?? SITE_TITLE
  const pageDescription = description ?? SITE_DESCRIPTION

  return {
    title: title ? { absolute: `${title} | ${SITE_NAME}` } : undefined,
    description: pageDescription,
    keywords: SITE_KEYWORDS,
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
          type: 'image/jpeg',
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
