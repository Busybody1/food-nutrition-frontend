'use client'

import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AuthShell } from '@/components/marketing/auth-shell'
import { api } from '@/lib/api/client'
import { ApiError } from '@/types/api'
import { CheckCircle2, Loader2 } from 'lucide-react'

const RESEND_COOLDOWN_SECONDS = 60

function VerifyEmailForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const emailParam = searchParams.get('email') ?? ''

  const [email, setEmail] = useState(emailParam)
  const [code, setCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [cooldown, setCooldown] = useState(0)

  // Countdown timer for the resend cooldown.
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
    // Only digits, max 6.
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
      router.push('/dashboard')
    } catch (err) {
      if (err instanceof ApiError) {
        // 400 -> invalid/expired; 429 -> attempts exhausted; both carry a message.
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
      // Response is intentionally generic (no account-existence leak).
      const message =
        (response.data as { message?: string } | undefined)?.message ??
        'If your account needs verification, a new code has been sent.'
      setNotice(message)
      setCooldown(RESEND_COOLDOWN_SECONDS)
    } catch (err) {
      if (err instanceof ApiError) {
        // 429 -> cooldown / daily cap.
        setError(err.message)
        if (err.status === 429) setCooldown(RESEND_COOLDOWN_SECONDS)
      } else {
        setError('Could not resend the code. Please try again.')
      }
    } finally {
      setIsResending(false)
    }
  }

  const labelClass = 'block text-sm font-medium text-ink-muted mb-1'
  const linkClass =
    'text-brand-strong underline decoration-brand/40 underline-offset-2 hover:decoration-brand-strong rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2'

  return (
    <AuthShell
      title="Verify your email"
      subtitle={
        <>
          Enter the 6-digit code we sent
          {email ? (
            <>
              {' '}to <span className="font-medium text-ink">{email}</span>
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
            className="bg-error-500/10 border border-error-500/30 text-error-500 px-4 py-3 rounded-card text-sm"
          >
            {error}
          </div>
        )}

        {notice && (
          <div
            role="status"
            className="flex items-start gap-2 bg-brand/10 border border-brand/30 text-ink px-4 py-3 rounded-card text-sm"
          >
            <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-brand-strong" />
            <span>{notice}</span>
          </div>
        )}

        {/* Email — editable fallback when the query param is missing. */}
        <div>
          <label htmlFor="email" className={labelClass}>Email</label>
          <Input
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
            className="h-11"
          />
        </div>

        <div>
          <label htmlFor="code" className={labelClass}>Verification code</label>
          <Input
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
            className="h-14 text-center text-2xl font-mono tracking-[0.5em]"
          />
          <p className="text-xs text-ink-muted mt-1">Check your inbox (and spam) for the code.</p>
        </div>

        <Button
          type="submit"
          className="w-full h-11 font-semibold hover:shadow-glow-lg motion-safe:hover:-translate-y-px"
          disabled={isSubmitting || code.length !== 6}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying…
            </>
          ) : (
            'Verify email'
          )}
        </Button>
      </form>

      <div className="mt-6 border-t border-surface-border/70 pt-5 text-center">
        <p className="text-sm text-ink-muted">Didn&apos;t get a code?</p>
        <Button
          type="button"
          variant="outline"
          onClick={handleResend}
          disabled={isResending || cooldown > 0}
          className="mt-3 w-full"
        >
          {isResending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending…
            </>
          ) : cooldown > 0 ? (
            `Resend code in ${cooldown}s`
          ) : (
            'Resend code'
          )}
        </Button>
        <p className="mt-4 text-sm text-ink-muted">
          Wrong account?{' '}
          <Link href="/auth/login" className={linkClass}>
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
