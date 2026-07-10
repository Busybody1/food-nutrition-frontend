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

export interface BlogListPage {
  items: BlogListItem[]
  total: number
  limit: number
  skip: number
  q?: string | null
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

export const BLOG_PAGE_SIZE = 12

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

function normalizeListResponse(
  raw: BlogListPage | BlogListItem[] | null,
  limit: number,
  skip: number,
  q?: string
): BlogListPage {
  if (!raw) {
    return { items: [], total: 0, limit, skip, q: q ?? null }
  }
  if (Array.isArray(raw)) {
    return { items: raw, total: raw.length, limit, skip, q: q ?? null }
  }
  return {
    items: raw.items ?? [],
    total: raw.total ?? raw.items?.length ?? 0,
    limit: raw.limit ?? limit,
    skip: raw.skip ?? skip,
    q: raw.q ?? q ?? null,
  }
}

export async function getBlogPostsPage(options?: {
  limit?: number
  skip?: number
  q?: string
}): Promise<BlogListPage> {
  const limit = options?.limit ?? BLOG_PAGE_SIZE
  const skip = options?.skip ?? 0
  const params = new URLSearchParams({
    limit: String(limit),
    skip: String(skip),
  })
  const q = options?.q?.trim()
  if (q) params.set('q', q.slice(0, 100))

  const raw = await blogFetch<BlogListPage | BlogListItem[]>(`?${params.toString()}`)
  return normalizeListResponse(raw, limit, skip, q)
}

/** Fetch up to `limit` posts (used by RSS, llms.txt, and other full feeds). */
export async function getBlogPosts(limit = 100): Promise<BlogListItem[]> {
  const page = await getBlogPostsPage({ limit, skip: 0 })
  return page.items
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  // Unlike the list helpers, a single-post fetch must distinguish a genuine
  // 404 (post doesn't exist → null → the page renders notFound() + noindex,
  // which is correct) from a transient upstream failure (5xx / network /
  // timeout). Returning null on a transient error would emit noindex + 404 on
  // a REAL published post and let a crawler cache that. So we throw on
  // transient errors instead: Next then keeps serving the last-good ISR page
  // rather than baking a bad noindex.
  let res: Response
  try {
    res = await fetch(`${API_BASE_URL}/api/v1/public/blog/${encodeURIComponent(slug)}`, {
      headers: { Accept: 'application/json' },
      next: { revalidate: REVALIDATE_SECONDS, tags: ['blog'] },
    })
  } catch (err) {
    throw new Error(
      `getBlogPost("${slug}") network error: ${err instanceof Error ? err.message : String(err)}`
    )
  }
  if (res.status === 404) return null
  if (!res.ok) {
    throw new Error(`getBlogPost("${slug}") upstream error: HTTP ${res.status}`)
  }
  return (await res.json()) as BlogPost
}

export async function getBlogSlugs(): Promise<BlogSlug[]> {
  const slugs = await blogFetch<BlogSlug[]>('/slugs')
  return slugs ?? []
}
