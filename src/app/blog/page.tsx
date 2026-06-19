import type { Metadata } from 'next'
import { buildPublicPageMetadata } from '@/lib/build-public-metadata'
import { PublicPageSchema } from '@/components/seo/public-page-schema'
import { getBlogPosts } from '@/lib/api/blog'
import { BlogSeoContent } from '@/components/seo/public-page-seo-content'
import { buildBlogItemListJsonLd } from '@/lib/seo-jsonld'
import { absoluteUrl } from '@/lib/site'
import { BlogIndex } from '@/components/blog/blog-index'
import { MarketingCtaBand } from '@/components/marketing/marketing-shell'

const blogMetadata = buildPublicPageMetadata('/blog')

export const metadata: Metadata = {
  ...blogMetadata,
  alternates: {
    ...blogMetadata.alternates,
    types: {
      'application/rss+xml': [{ url: absoluteUrl('/blog/feed.xml'), title: 'Calorie API Blog RSS' }],
    },
  },
}

export const revalidate = 300

export default async function BlogIndexPage() {
  const posts = await getBlogPosts()
  const blogItemListJsonLd = buildBlogItemListJsonLd(posts)

  return (
    <div className="marketing-page">
      <PublicPageSchema
        path="/blog"
        pageName="Blog"
        extraJsonLd={[blogItemListJsonLd]}
      />

      <BlogIndex posts={posts} />

      <MarketingCtaBand
        title="Ready to integrate?"
        description="Get your free API key and start building food search, barcode lookup, and macro logging in minutes."
        primaryHref="/auth/register"
        primaryLabel="Get API key free"
        secondaryHref="/docs"
        secondaryLabel="View documentation"
      />

      <BlogSeoContent />
    </div>
  )
}
