export type BlogJsonLdSite = {
  siteName: string
  siteUrl: string
  logoUrl: string
  absoluteUrl: (path: string) => string
}

export function buildBlogPostingJsonLdFromInput(
  site: BlogJsonLdSite,
  {
    title,
    description,
    path,
    datePublished,
    dateModified,
    image,
    keywords,
    wordCount,
  }: {
    title: string
    description: string
    path: string
    datePublished?: string | null
    dateModified?: string | null
    image?: string | null
    keywords?: string[] | null
    wordCount?: number
  }
) {
  const url = site.absoluteUrl(path)
  const keywordText = keywords?.filter(Boolean).join(', ') || undefined

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': url,
    headline: title,
    description,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    url,
    inLanguage: 'en-US',
    isAccessibleForFree: true,
    articleSection: 'Developer guides',
    ...(datePublished ? { datePublished } : {}),
    dateModified: dateModified || datePublished || undefined,
    author: { '@type': 'Organization', name: site.siteName, url: site.siteUrl },
    publisher: {
      '@type': 'Organization',
      name: site.siteName,
      url: site.siteUrl,
      logo: { '@type': 'ImageObject', url: site.logoUrl },
    },
    ...(image ? { image: [image] } : {}),
    ...(keywordText ? { keywords: keywordText } : {}),
    ...(wordCount && wordCount > 0 ? { wordCount } : {}),
  }
}

export function buildBlogItemListJsonLdFromInput(
  site: BlogJsonLdSite,
  posts: { slug: string; title: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${site.siteName} Blog`,
    itemListOrder: 'https://schema.org/ItemListOrderDescending',
    numberOfItems: posts.length,
    itemListElement: posts.map((post, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: post.title,
      url: site.absoluteUrl(`/blog/${post.slug}`),
    })),
  }
}
