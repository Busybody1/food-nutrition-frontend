export type BlogJsonLdSite = {
  siteName: string
  siteUrl: string
  logoUrl: string
  absoluteUrl: (path: string) => string
}

export function articleSectionForPost(title: string, keywords?: string[] | null): string {
  const blob = `${title} ${(keywords ?? []).join(' ')}`.toLowerCase()
  if (/\bmcp\b|\bclaude\b|\bcursor\b/.test(blob)) return 'Calorie MCP'
  return 'Developer guides'
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
  const organizationId = `${site.siteUrl}/#organization`
  const keywordList = keywords?.filter(Boolean) ?? []
  const keywordText = keywordList.join(', ') || undefined

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${url}#article`,
    headline: title,
    description,
    abstract: description,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    url,
    inLanguage: 'en-US',
    isAccessibleForFree: true,
    articleSection: articleSectionForPost(title, keywordList),
    isPartOf: { '@type': 'WebSite', '@id': `${site.siteUrl}/#website` },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['article h1', '.aeo-answer'],
    },
    ...(keywordList.length
      ? { about: keywordList.slice(0, 3).map((name) => ({ '@type': 'Thing', name })) }
      : {}),
    ...(datePublished ? { datePublished } : {}),
    dateModified: dateModified || datePublished || undefined,
    author: { '@type': 'Organization', '@id': organizationId, name: site.siteName, url: site.siteUrl },
    publisher: {
      '@type': 'Organization',
      '@id': organizationId,
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
