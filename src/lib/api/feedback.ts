export type FeedbackContext = {
  first_name: string
  already_submitted: boolean
  expired: boolean
}

export type FeedbackSubmitPayload = {
  overall_rating: 1 | 2 | 3 | 4 | 5
  ease_of_use_rating: 1 | 2 | 3 | 4 | 5
  documentation_rating: 1 | 2 | 3 | 4 | 5
  data_quality_rating: 1 | 2 | 3 | 4 | 5
  would_recommend: boolean
  message: string
  website?: string
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:8000'

async function parseError(res: Response, fallback: string): Promise<string> {
  try {
    const data = await res.json()
    if (typeof data?.detail === 'string') return data.detail
    if (Array.isArray(data?.detail)) {
      const first = data.detail[0]
      if (first?.msg) return String(first.msg)
    }
  } catch {
    /* use fallback */
  }
  return fallback
}

export async function fetchFeedbackContext(token: string): Promise<FeedbackContext> {
  const res = await fetch(`${API_BASE}/api/v1/public/feedback/${encodeURIComponent(token)}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  })
  if (!res.ok) {
    throw new Error(await parseError(res, 'This feedback link is invalid or has expired.'))
  }
  return res.json()
}

export async function submitFeedback(token: string, payload: FeedbackSubmitPayload): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/public/feedback/${encodeURIComponent(token)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (res.ok) return
  throw new Error(await parseError(res, 'Could not submit your feedback. Please try again.'))
}
