/**
 * Public blog data access for Server Components.
 * Reads published posts from the backend; never sends auth credentials.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const REVALIDATE_SECONDS = 300

export interface BlogFaqItem {
  question: string
  answer: string
}

export interface BlogListItem {
  slug: string
  title: string
  excerpt?: string | null
  meta_description?: string | null
  keywords?: string | null
  cover_image_url?: string | null
  published_at?: string | null
  updated_at?: string | null
}

export interface BlogPost {
  slug: string
  title: string
  excerpt?: string | null
  content: string
  meta_title?: string | null
  meta_description?: string | null
  keywords?: string | null
  cover_image_url?: string | null
  faq: BlogFaqItem[]
  published_at?: string | null
  updated_at?: string | null
}

export interface BlogSlug {
  slug: string
  updated_at?: string | null
}

async function blogFetch<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/public/blog${path}`, {
      headers: { Accept: 'application/json' },
      next: { revalidate: REVALIDATE_SECONDS, tags: ['blog'] },
    })
    if (!res.ok) {
      return null
    }
    return (await res.json()) as T
  } catch {
    return null
  }
}

export async function getBlogPosts(limit = 100): Promise<BlogListItem[]> {
  const posts = await blogFetch<BlogListItem[]>(`?limit=${limit}`)
  return posts ?? []
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  return blogFetch<BlogPost>(`/${encodeURIComponent(slug)}`)
}

export async function getBlogSlugs(): Promise<BlogSlug[]> {
  const slugs = await blogFetch<BlogSlug[]>('/slugs')
  return slugs ?? []
}
