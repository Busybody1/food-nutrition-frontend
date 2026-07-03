import { NextResponse } from 'next/server'
import { buildLlmsFullTxt } from '@/lib/llms-full'

export const revalidate = 3600

export async function GET() {
  return new NextResponse(buildLlmsFullTxt(), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
