'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AuthShell } from '@/components/marketing/auth-shell'
import { api } from '@/lib/api/client'
import { ApiError } from '@/types/api'
import { Loader2 } from 'lucide-react'

const GENERIC_SENT =
  'If an account exists for that email, a password reset link has been sent.'

const linkClass =
  'text-brand-strong underline decoration-brand/40 underline-offset-2 hover:decoration-brand-strong rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    try {
      await api.auth.forgotPassword(email.trim())
      setSent(true)
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) {
        setError(err.message)
      } else if (!(err instanceof ApiError) || err.status === 0 || err.status >= 500) {
        setError('Could not send a reset email. Please try again.')
      } else {
        setSent(true)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthShell
      title="Forgot password"
      subtitle={
        <>
          Remembered it?{' '}
          <Link href="/auth/login" className={linkClass}>
            Sign in
          </Link>
        </>
      }
    >
      {sent ? (
        <div className="space-y-4">
          <p className="text-sm text-mk-muted">{GENERIC_SENT}</p>
          <Link href="/auth/login" className="btn-brand-outline w-full">
            Back to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div
              role="alert"
              className="bg-error-500/10 border border-error-500/30 text-error-500 px-4 py-3 rounded-xl text-sm"
            >
              {error}
            </div>
          )}
          <div>
            <label htmlFor="email" className="marketing-label">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="marketing-input"
            />
          </div>
          <button
            type="submit"
            className="btn-brand w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Sending…
              </>
            ) : (
              'Send reset link'
            )}
          </button>
        </form>
      )}
    </AuthShell>
  )
}
