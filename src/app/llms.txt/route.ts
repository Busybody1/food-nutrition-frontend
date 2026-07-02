import { NextResponse } from 'next/server'
import { getBlogPosts } from '@/lib/api/blog'
import { buildLlmsTxt } from '@/lib/blog-discovery'

export const revalidate = 300

export async function GET() {
  const posts = await getBlogPosts()
  const body = await buildLlmsTxt(posts)

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  })
}
