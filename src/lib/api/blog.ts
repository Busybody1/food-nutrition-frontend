

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const REVALIDATE_SECONDS = 300
const BLOG_FETCH_ATTEMPTS = 3
const BLOG_FETCH_RETRY_BASE_MS = 200
const HTTP_NOT_FOUND = 404
const HTTP_REQUEST_TIMEOUT = 408
const HTTP_TOO_MANY_REQUESTS = 429
const HTTP_SERVER_ERROR_MIN = 500

type BlogFetchResult =
  | { kind: 'response'; response: Response }
  | { kind: 'network'; detail: string }
  | { kind: 'upstream'; status: number }

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

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

function networkErrorDetail(err: unknown): string {
  if (!(err instanceof Error)) return String(err)
  const cause = err.cause
  if (cause && typeof cause === 'object' && 'code' in cause && typeof cause.code === 'string') {
    return `${err.message} (${cause.code})`
  }
  if (cause instanceof Error && cause.message) {
    return `${err.message} (${cause.message})`
  }
  return err.message
}

function retryableStatus(status: number): boolean {
  return status === HTTP_REQUEST_TIMEOUT || status === HTTP_TOO_MANY_REQUESTS || status >= HTTP_SERVER_ERROR_MIN
}

// Retry before failing prerender. A signal on later attempts bypasses Next's memoized failure.
async function fetchBlogWithRetry(path: string): Promise<BlogFetchResult> {
  const url = `${API_BASE_URL}/api/v1/public/blog${path}`
  let networkDetail = 'unknown'
  let upstreamStatus = 0

  for (let attempt = 0; attempt < BLOG_FETCH_ATTEMPTS; attempt += 1) {
    if (attempt > 0) {
      await sleep(BLOG_FETCH_RETRY_BASE_MS * 2 ** (attempt - 1))
    }
    try {
      const response = await fetch(url, {
        headers: { Accept: 'application/json' },
        next: { revalidate: REVALIDATE_SECONDS, tags: ['blog'] },
        signal: attempt === 0 ? undefined : new AbortController().signal,
      })
      if (response.ok || response.status === HTTP_NOT_FOUND || !retryableStatus(response.status)) {
        return { kind: 'response', response }
      }
      upstreamStatus = response.status
    } catch (err) {
      networkDetail = networkErrorDetail(err)
      upstreamStatus = 0
    }
  }

  if (upstreamStatus) return { kind: 'upstream', status: upstreamStatus }
  return { kind: 'network', detail: networkDetail }
}

async function blogFetch<T>(path: string): Promise<T | null> {
  const result = await fetchBlogWithRetry(path)
  if (result.kind !== 'response' || !result.response.ok) return null
  return (await result.response.json()) as T
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

export async function getBlogPosts(limit = 100): Promise<BlogListItem[]> {
  const page = await getBlogPostsPage({ limit, skip: 0 })
  return page.items
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const result = await fetchBlogWithRetry(`/${encodeURIComponent(slug)}`)
  if (result.kind === 'network') {
    throw new Error(`getBlogPost("${slug}") network error: ${result.detail}`)
  }
  if (result.kind === 'upstream') {
    throw new Error(`getBlogPost("${slug}") upstream error: HTTP ${result.status}`)
  }
  if (result.response.status === HTTP_NOT_FOUND) return null
  if (!result.response.ok) {
    throw new Error(`getBlogPost("${slug}") upstream error: HTTP ${result.response.status}`)
  }
  return (await result.response.json()) as BlogPost
}

export async function getBlogSlugs(): Promise<BlogSlug[]> {
  const slugs = await blogFetch<BlogSlug[]>('/slugs')
  return slugs ?? []
}
