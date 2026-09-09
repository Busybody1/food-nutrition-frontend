const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const REVALIDATE_SECONDS = 300

export type PublicTestimonial = {
  quote: string
  author_name: string
  author_role?: string | null
  company?: string | null
  avatar_url?: string | null
}

export async function getPublicTestimonials(): Promise<PublicTestimonial[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/public/testimonials`, {
      headers: { Accept: 'application/json' },
      next: { revalidate: REVALIDATE_SECONDS, tags: ['testimonials'] },
    })
    if (!res.ok) return []
    const data = (await res.json()) as { items?: PublicTestimonial[] }
    return Array.isArray(data.items) ? data.items : []
  } catch {
    return []
  }
}
