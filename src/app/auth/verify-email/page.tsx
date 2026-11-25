'use client'

import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { AuthShell } from '@/components/marketing/auth-shell'
import { api } from '@/lib/api/client'
import { safeNextPath } from '@/lib/mcp/catalog'
import { ApiError } from '@/types/api'
import { CheckCircle2, Loader2 } from 'lucide-react'

const RESEND_COOLDOWN_SECONDS = 60

function VerifyEmailForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const emailParam = searchParams.get('email') ?? ''
  const nextPath = safeNextPath(searchParams.get('next'))

  const [email, setEmail] = useState(emailParam)
  const [code, setCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => {
      setCooldown((prev) => (prev <= 1 ? 0 : prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleCodeChange = useCallback((value: string) => {

    setCode(value.replace(/\D/g, '').slice(0, 6))
    setError('')
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setNotice('')

    if (!email.trim()) {
      setError('Enter the email address you signed up with.')
      return
    }
    if (code.length !== 6) {
      setError('Enter the 6-digit code from your email.')
      return
    }

    setIsSubmitting(true)
    try {
      await api.auth.verifyEmailCode({ email: email.trim(), code })
      router.push(nextPath || '/dashboard')
    } catch (err) {
      if (err instanceof ApiError) {

        setError(err.message)
      } else {
        setError('Verification failed. Please try again.')
      }
      setIsSubmitting(false)
    }
  }

  const handleResend = async () => {
    setError('')
    setNotice('')

    if (!email.trim()) {
      setError('Enter the email address you signed up with.')
      return
    }
    if (cooldown > 0) return

    setIsResending(true)
    try {
      const response = await api.auth.resendCode({ email: email.trim() })

      const message =
        (response.data as { message?: string } | undefined)?.message ??
        'If your account needs verification, a new code has been sent.'
      setNotice(message)
      setCooldown(RESEND_COOLDOWN_SECONDS)
    } catch (err) {
      if (err instanceof ApiError) {

        setError(err.message)
        if (err.status === 429) setCooldown(RESEND_COOLDOWN_SECONDS)
      } else {
        setError('Could not resend the code. Please try again.')
      }
    } finally {
      setIsResending(false)
    }
  }

  const labelClass = 'marketing-label'
  const linkClass =
    'text-brand-strong underline decoration-brand/40 underline-offset-2 hover:decoration-brand-strong rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2'

  return (
    <AuthShell
      title="Verify your email"
      subtitle={
        <>
          Enter the 6-digit code we sent
          {email ? (
            <>
              {' '}to <span className="font-medium text-mk-ink">{email}</span>
            </>
          ) : (
            ' to your inbox'
          )}
          .
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div
            role="alert"
            className="bg-error-500/10 border border-error-500/30 text-error-500 px-4 py-3 rounded-xl text-sm"
          >
            {error}
          </div>
        )}

        {notice && (
          <div
            role="status"
            className="flex items-start gap-2 bg-mk-green-soft border border-mk-green/20 text-mk-ink px-4 py-3 rounded-xl text-sm"
          >
            <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-mk-green" />
            <span>{notice}</span>
          </div>
        )}

        {}
        <div>
          <label htmlFor="email" className={labelClass}>Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setError('')
            }}
            className="marketing-input"
          />
        </div>

        <div>
          <label htmlFor="code" className={labelClass}>Verification code</label>
          <input
            ref={inputRef}
            id="code"
            name="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="\d{6}"
            maxLength={6}
            required
            value={code}
            onChange={(e) => handleCodeChange(e.target.value)}
            placeholder="000000"
            className="marketing-input h-14 text-center font-mono text-2xl tracking-[0.5em]"
          />
          <p className="mt-1.5 text-xs text-mk-muted">Check your inbox (and spam) for the code.</p>
        </div>

        <button
          type="submit"
          className="btn-brand w-full"
          disabled={isSubmitting || code.length !== 6}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Verifying…
            </>
          ) : (
            'Verify email'
          )}
        </button>
      </form>

      <div className="mt-6 border-t border-mk-hair pt-5 text-center">
        <p className="text-sm text-mk-muted">Didn&apos;t get a code?</p>
        <button
          type="button"
          onClick={handleResend}
          disabled={isResending || cooldown > 0}
          className="btn-brand-outline mt-3 w-full"
        >
          {isResending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Sending…
            </>
          ) : cooldown > 0 ? (
            `Resend code in ${cooldown}s`
          ) : (
            'Resend code'
          )}
        </button>
        <p className="mt-4 text-sm text-mk-muted">
          Wrong account?{' '}
          <Link
            href={nextPath ? `/auth/login?next=${encodeURIComponent(nextPath)}` : '/auth/login'}
            className={linkClass}
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthShell>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailForm />
    </Suspense>
  )
}
