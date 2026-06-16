import { NextResponse } from 'next/server'
import { getBlogPosts } from '@/lib/api/blog'
import { buildBlogRssXml } from '@/lib/blog-discovery'

export const revalidate = 300

export async function GET() {
  const posts = await getBlogPosts()
  const xml = buildBlogRssXml(posts)

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  })
}
