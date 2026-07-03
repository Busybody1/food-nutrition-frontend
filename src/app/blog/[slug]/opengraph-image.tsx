import { buildOgImage, OG_SIZE } from '@/lib/og-template'
import { getBlogPost } from '@/lib/api/blog'

export const size = OG_SIZE
export const contentType = 'image/png'
export const alt = 'Blog article'

export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getBlogPost(slug).catch(() => null)
  return buildOgImage({
    label: 'Developer Blog',
    title: post?.title ?? 'Blog',
    subtitle: post?.excerpt ?? undefined,
  })
}
