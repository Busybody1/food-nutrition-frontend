'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AuthShell } from '@/components/marketing/auth-shell'
import { api } from '@/lib/api/client'
import { ApiError } from '@/types/api'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

const linkClass =
  'text-brand-strong underline decoration-brand/40 underline-offset-2 hover:decoration-brand-strong rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = (searchParams.get('token') || '').trim()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(
    token ? '' : 'This reset link is missing a token. Request a new one.'
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!token) {
      setError('This reset link is missing a token. Request a new one.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setIsLoading(true)
    try {
      await api.auth.resetPassword(token, password)
      router.push('/auth/login')
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Could not reset password. Request a new link.')
      }
      setIsLoading(false)
    }
  }

  return (
    <AuthShell
      title="Reset password"
      subtitle={
        <>
          Or{' '}
          <Link
            href="/auth/forgot-password"
            className={linkClass}
            rel="noreferrer"
            referrerPolicy="no-referrer"
          >
            request a new link
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div
            role="alert"
            className="bg-error-500/10 border border-error-500/30 text-error-500 px-4 py-3 rounded-card text-sm"
          >
            {error}
          </div>
        )}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-ink-muted mb-1">
            New password
          </label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 pr-10"
              disabled={!token}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center rounded-r-brand cursor-pointer text-ink-muted hover:text-ink transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-ink-muted mb-1">
            Confirm password
          </label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            minLength={8}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="h-11"
            disabled={!token}
          />
        </div>
        <Button
          type="submit"
          className="w-full h-11 font-semibold hover:shadow-glow-lg motion-safe:hover:-translate-y-px"
          disabled={isLoading || !token}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            'Set new password'
          )}
        </Button>
      </form>
    </AuthShell>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  )
}
