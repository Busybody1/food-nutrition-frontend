export type ContactFormPayload = {
  name: string
  email: string
  company?: string
  subject: string
  message: string
  inquiry_type: string
  website?: string
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:8000'

export async function submitContactForm(payload: ContactFormPayload): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/public/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: payload.name,
      email: payload.email,
      company: payload.company || null,
      subject: payload.subject,
      message: payload.message,
      inquiry_type: payload.inquiry_type,
      website: payload.website || null,
    }),
  })

  if (res.ok) return

  let detail = 'Could not send your message. Please try again or email support directly.'
  try {
    const data = await res.json()
    if (typeof data?.detail === 'string') detail = data.detail
    else if (Array.isArray(data?.detail)) {
      const first = data.detail[0]
      if (first?.msg) detail = String(first.msg)
    }
  } catch {
    /* use default message */
  }
  throw new Error(detail)
}
