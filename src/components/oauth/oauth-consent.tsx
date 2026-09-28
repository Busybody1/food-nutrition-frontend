'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/use-auth'
import { isSafeOAuthRedirect } from '@/lib/mcp/catalog'

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '')

const SCOPE_LABELS: Record<string, string> = {
  'nutrition:read': 'Search foods, portions, recipes, and barcodes',
  'nutrition:vision': 'Estimate calories from photos you send',
  offline_access: 'Stay connected after you close the window',
}

type Preview = {
  client_name: string
  redirect_host: string
  scopes: string[]
}

function requestIdFromLocation(): string {
  if (typeof window === 'undefined') return ''
  const value = new URLSearchParams(window.location.search).get('request') || ''
  return /^[A-Za-z0-9_-]{20,128}$/.test(value) ? value : ''
}

export function OAuthConsent() {
  const router = useRouter()
  const { isAuthenticated, loading } = useAuth()
  const [requestId, setRequestId] = useState('')
  const [preview, setPreview] = useState<Preview | null>(null)
  const [error, setError] = useState('')
  const [needsPlan, setNeedsPlan] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setRequestId(requestIdFromLocation())
    setReady(true)
  }, [])

  useEffect(() => {
    if (loading || !requestId) return
    if (!isAuthenticated) {
      const next = `/oauth/consent?request=${encodeURIComponent(requestId)}`
      router.replace(`/auth/login?next=${encodeURIComponent(next)}`)
    }
  }, [isAuthenticated, loading, requestId, router])

  useEffect(() => {
    if (!requestId || !isAuthenticated) return
    let cancelled = false
    const load = async () => {
      try {
        const response = await fetch(`${API_BASE}/oauth/requests/${requestId}`)
        const body = await response.json()
        if (!response.ok) {
          if (!cancelled) setError('This approval link has expired. Start the connection again from Claude.')
          return
        }
        if (!cancelled) {
          setPreview({
            client_name: String(body.client_name || 'MCP client'),
            redirect_host: String(body.redirect_host || ''),
            scopes: Array.isArray(body.scopes) ? body.scopes.map(String) : [],
          })
        }
      } catch {
        if (!cancelled) setError('The approval service is unavailable. Try again in a moment.')
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [isAuthenticated, requestId])

  const decide = async (approve: boolean) => {
    if (!preview || submitting) return
    setSubmitting(true)
    setError('')
    setNeedsPlan(false)
    const token = window.localStorage.getItem('access_token')
    if (!token) {
      const next = `/oauth/consent?request=${encodeURIComponent(requestId)}`
      router.replace(`/auth/login?next=${encodeURIComponent(next)}`)
      return
    }
    try {
      const response = await fetch(`${API_BASE}/oauth/authorize/decision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ request_id: requestId, approve }),
      })
      const body = await response.json()
      if (!response.ok) {
        setNeedsPlan(response.status === 403)
        setError(String(body.error_description || body.detail || 'The connection was not approved.'))
        setSubmitting(false)
        return
      }
      const target = String(body.redirect_to || '')
      if (!isSafeOAuthRedirect(target, preview.redirect_host)) {
        setError('The return address is not the client that started this request.')
        setSubmitting(false)
        return
      }
      window.location.assign(target)
    } catch {
      setError('The approval service is unavailable. Try again in a moment.')
      setSubmitting(false)
    }
  }

  if (!ready) return null

  if (!requestId) {
    return (
      <section className="section-pad">
        <div className="container-narrow max-w-lg">
          <h1 className="font-display text-3xl text-ink">Approval link is not valid</h1>
          <p className="mt-3 text-ink-muted">Start the connection again from Claude.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="section-pad">
      <div className="container-narrow max-w-lg">
        <p className="marketing-section-label mb-3">MCP</p>
        <h1 className="font-display text-3xl text-ink">Connect {preview?.client_name || 'an MCP client'}</h1>
        <p className="mt-3 text-ink-muted leading-relaxed">
          This lets the client call your BusyBody MCP tools. It does not receive your API key or
          password.
        </p>
        {preview ? (
          <div className="mt-6 rounded-brand border border-brand/15 bg-surface-elevated p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">Returns to</p>
            <p className="mt-1 break-all text-base font-medium text-ink">{preview.redirect_host}</p>
            <p className="mt-3 text-sm text-ink-muted">
              Approve only if you started this connection and you recognize that host.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-ink">
              {preview.scopes.map((scope) => (
                <li key={scope}>{SCOPE_LABELS[scope] || scope}</li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="mt-6 text-sm text-ink-muted">{error || 'Loading the request.'}</p>
        )}
        {error && preview ? <p className="mt-4 text-sm text-ink">{error}</p> : null}
        {needsPlan ? (
          <p className="mt-3 text-sm">
            <Link href="/mcp/pricing" className="text-brand-strong underline">
              See MCP pricing
            </Link>
          </p>
        ) : null}
        {preview ? (
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              className="btn-brand h-11 px-5"
              disabled={submitting}
              onClick={() => void decide(true)}
            >
              Approve
            </button>
            <button
              type="button"
              className="btn-brand-outline h-11 px-5"
              disabled={submitting}
              onClick={() => void decide(false)}
            >
              Deny
            </button>
          </div>
        ) : null}
      </div>
    </section>
  )
}
